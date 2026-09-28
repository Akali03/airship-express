import { existsSync } from "node:fs";
import path from "node:path";
import serverless from "serverless-http";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ExcelJS from "exceljs";
import express from "express";
import nodemailer from "nodemailer";

type RouteContext = {
  params: Promise<{ path: string[] }> | { path: string[] };
};

const backendRoot = [
  path.resolve(process.cwd(), "backend"),
  path.resolve(process.cwd(), "app/(ftm)/backend"),
  path.resolve(process.cwd(), "../backend"),
].find((candidate) => existsSync(path.join(candidate, "server.js")));

if (!backendRoot) {
  throw new Error("Unable to locate the FTM backend package.");
}

const nodeRequire = eval("require") as NodeRequire;
const expressApp = nodeRequire(path.join(backendRoot, "server.js"));
if (
  typeof express !== "function" ||
  typeof dotenv.config !== "function" ||
  typeof createClient !== "function" ||
  typeof ExcelJS.Workbook !== "function" ||
  typeof nodemailer.createTransport !== "function"
) {
  throw new Error("FTM API runtime dependencies are unavailable.");
}
const expressHandler = (serverless as unknown as (
  app: unknown,
  options?: { provider?: "aws" }
) => unknown)(expressApp, { provider: "aws" }) as (
  event: object,
  context: object
) => Promise<{
  statusCode: number;
  headers?: Record<string, string | string[]>;
  body?: string;
  isBase64Encoded?: boolean;
  cookies?: string[];
}>;

export const runtime = "nodejs";

async function forwardToFtmBackend(request: Request, { params }: RouteContext) {
  try {
    const { path } = await params;
    const incomingUrl = new URL(request.url);
    const method = request.method.toUpperCase();
    const body = method === "GET" || method === "HEAD"
      ? undefined
      : Buffer.from(await request.arrayBuffer()).toString("utf8");
    const result = await expressHandler({
      version: "2.0",
      routeKey: "$default",
      rawPath: `/api/${path.map(encodeURIComponent).join("/")}`,
      rawQueryString: incomingUrl.search.slice(1),
      headers: Object.fromEntries(request.headers),
      requestContext: {
        http: {
          method,
          path: incomingUrl.pathname,
          protocol: incomingUrl.protocol.replace(":", ""),
          sourceIp: request.headers.get("x-forwarded-for") || "127.0.0.1",
          userAgent: request.headers.get("user-agent") || "",
        },
      },
      isBase64Encoded: false,
      body,
    }, {});

    const responseHeaders = new Headers();
    Object.entries(result.headers || {}).forEach(([name, value]) => {
      if (Array.isArray(value)) value.forEach((entry) => responseHeaders.append(name, entry));
      else responseHeaders.set(name, value);
    });
    result.cookies?.forEach((cookie) => responseHeaders.append("set-cookie", cookie));
    const responseBody = method === "HEAD" || [204, 205, 304].includes(result.statusCode)
      ? null
      : result.isBase64Encoded
        ? Buffer.from(result.body || "", "base64")
        : result.body || null;

    return new Response(responseBody, {
      status: result.statusCode,
      headers: responseHeaders,
    });
  } catch {
    return Response.json({ error: "The FTM API handler failed." }, { status: 500 });
  }
}

export const GET = forwardToFtmBackend;
export const POST = forwardToFtmBackend;
export const PUT = forwardToFtmBackend;
export const PATCH = forwardToFtmBackend;
export const DELETE = forwardToFtmBackend;
export const HEAD = forwardToFtmBackend;