import { readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".wav": "audio/wav",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ asset: string[] }> | { asset: string[] } }
) {
  const { asset } = await params;
  const publicDirectory = request.headers.get("x-airship-ftm-embedded") === "1"
    ? path.join(process.cwd(), "app", "(ftm)", "web", "public")
    : path.join(process.cwd(), "public");
  const filePath = path.resolve(publicDirectory, ...asset);
  const relativePath = path.relative(publicDirectory, filePath);

  if (
    !relativePath ||
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    const contentType = CONTENT_TYPES[path.extname(filePath).toLowerCase()];
    if (!contentType) return new Response("Not found", { status: 404 });

    const range = request.headers.get("range");
    const rangeMatch = range ? /^bytes=(\d*)-(\d*)$/.exec(range) : null;
    if (range && !rangeMatch) {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${file.byteLength}` },
      });
    }

    if (rangeMatch) {
      const suffixLength = rangeMatch[1] ? 0 : Number(rangeMatch[2]);
      const start = rangeMatch[1] ? Number(rangeMatch[1]) : Math.max(0, file.byteLength - suffixLength);
      const end = rangeMatch[2] && rangeMatch[1]
        ? Math.min(Number(rangeMatch[2]), file.byteLength - 1)
        : file.byteLength - 1;

      if (start >= file.byteLength || end < start) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${file.byteLength}` },
        });
      }

      const body = file.subarray(start, end + 1);
      return new Response(body, {
        status: 206,
        headers: {
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600",
          "Content-Length": String(body.byteLength),
          "Content-Range": `bytes ${start}-${end}/${file.byteLength}`,
          "Content-Type": contentType,
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    return new Response(file, {
      headers: {
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
        "Content-Length": String(file.byteLength),
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}