const DEV_API_FALLBACK = "http://localhost:8010";
const PROD_API_FALLBACK = "https://api.robolog.us";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function isLocalHost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1";
}

function isRobologHost(host: string): boolean {
  return host === "robolog.us" || host === "www.robolog.us" || host.endsWith(".vercel.app");
}

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configured) return stripTrailingSlash(configured);

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (isLocalHost(host)) {
      return DEV_API_FALLBACK;
    }

    // Production web domains should default to the dedicated API host.
    if (isRobologHost(host)) {
      return PROD_API_FALLBACK;
    }

    return stripTrailingSlash(window.location.origin);
  }

  return process.env.NODE_ENV === "production" ? PROD_API_FALLBACK : DEV_API_FALLBACK;
}

export function getApiDocsUrl(baseUrl = getApiBaseUrl()): string {
  const configured = process.env.NEXT_PUBLIC_API_DOCS_URL?.trim();
  if (configured) return configured;
  return `${baseUrl}/docs`;
}

export function getApiRedocUrl(baseUrl = getApiBaseUrl()): string {
  const configured = process.env.NEXT_PUBLIC_API_REDOC_URL?.trim();
  if (configured) return configured;
  return `${baseUrl}/redoc`;
}
