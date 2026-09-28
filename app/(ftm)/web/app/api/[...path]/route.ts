type RouteContext = {
  params: Promise<{ path: string[] }> | { path: string[] };
};

const HOP_BY_HOP_HEADERS = [
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "x-airship-ftm-embedded",
];

function getBackendUrl() {
  const configuredUrl = process.env.FTM_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  const backendUrl = configuredUrl || (process.env.NODE_ENV === "development" ? "http://localhost:8001" : "");
  if (!backendUrl) return null;

  try {
    const parsed = new URL(backendUrl);
    const isLoopback = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname.toLowerCase());
    if (!/^https?:$/.test(parsed.protocol) || (process.env.NODE_ENV === "production" && isLoopback)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function forwardToFtmBackend(request: Request, { params }: RouteContext) {
  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    return Response.json({ error: "The FTM backend URL is not configured." }, { status: 503 });
  }

  try {
    const { path } = await params;
    const incomingUrl = new URL(request.url);
    const targetUrl = new URL(`api/${path.map(encodeURIComponent).join("/")}`, `${backendUrl.href.replace(/\/+$/, "")}/`);
    targetUrl.search = incomingUrl.search;

    const headers = new Headers(request.headers);
    HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header));
    headers.delete("host");

    const method = request.method.toUpperCase();
    const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
    const backendResponse = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });
    const responseHeaders = new Headers(backendResponse.headers);
    HOP_BY_HOP_HEADERS.forEach((header) => responseHeaders.delete(header));
    const responseBody = method === "HEAD" || [204, 205, 304].includes(backendResponse.status)
      ? null
      : backendResponse.body;

    return new Response(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json({ error: "The FTM backend could not be reached." }, { status: 502 });
  }
}

export const GET = forwardToFtmBackend;
export const POST = forwardToFtmBackend;
export const PUT = forwardToFtmBackend;
export const PATCH = forwardToFtmBackend;
export const DELETE = forwardToFtmBackend;
export const HEAD = forwardToFtmBackend;