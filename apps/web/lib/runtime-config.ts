const DEV_API_FALLBACK = "http://localhost:8010";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configured) return stripTrailingSlash(configured);

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return DEV_API_FALLBACK;
    }
    return stripTrailingSlash(window.location.origin);
  }

  return DEV_API_FALLBACK;
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
