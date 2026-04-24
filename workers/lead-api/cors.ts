import type { AppConfig } from "./types";

export function normalizeOrigin(origin: string | null): string | null {
  if (!origin) return null;

  try {
    const url = new URL(origin);
    return url.origin;
  } catch {
    return null;
  }
}

export function getCorsHeaders(origin: string | null, config: AppConfig): Headers {
  const headers = new Headers();

  if (origin && config.allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  } else {
    headers.set("Access-Control-Allow-Origin", config.defaultCorsOrigin);
  }

  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Content-Type", "application/json; charset=utf-8");

  return headers;
}

export function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  corsHeaders: Headers
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}
