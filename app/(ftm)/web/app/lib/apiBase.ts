export function getFtmApiBase() {
  return typeof window === "undefined" ? "" : window.location.origin;
}

export function getFtmApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${getFtmApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
}