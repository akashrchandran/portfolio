/// <reference types="@cloudflare/workers-types" />

import { isDisposableEmail } from "fakeout";

interface Env {
  DB: D1Database;
  ABSTRACT_API_KEY: string;
  RESEND_API_KEY: string;
  CORS_ORIGINS: string;
  RESEND_FROM: string;
  RESUME_URL: string;
  RESUME_TOKEN_SECRET: string;
  RESUME_SUBJECT?: string;
}

type LeadRequest = {
  email: string;
  name?: string;
  reason: string;
  turnstileToken?: string;
  consent: boolean;
};

type AbstractEmailResponse = {
  is_valid_format?: { value?: boolean };
  is_disposable_email?: { value?: boolean };
  deliverability?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_RESUME_SUBJECT = "My Resume";
const RESUME_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

type AppConfig = {
  allowedOrigins: Set<string>;
  defaultCorsOrigin: string;
  resendFrom: string;
  resumeUrl: string;
  resumeSubject: string;
};

class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function normalizeOrigin(origin: string | null): string | null {
  if (!origin) return null;

  try {
    const url = new URL(origin);
    return url.origin;
  } catch {
    return null;
  }
}

function parseCsvList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeAllowedOrigins(origins: string[]): string[] {
  return origins
    .map((origin) => {
      try {
        return new URL(origin).origin;
      } catch {
        return "";
      }
    })
    .filter(Boolean);
}

function getConfig(env: Env): AppConfig {
  const envOrigins = normalizeAllowedOrigins(parseCsvList(env.CORS_ORIGINS));
  if (envOrigins.length === 0) {
    throw new HttpError("Server misconfiguration: CORS_ORIGINS is missing or invalid.", 500);
  }

  const allowedOriginsList = envOrigins;
  const allowedOrigins = new Set<string>(allowedOriginsList);

  const resendFrom = env.RESEND_FROM?.trim();
  if (!resendFrom) {
    throw new HttpError("Server misconfiguration: RESEND_FROM is missing.", 500);
  }

  const resumeUrl = env.RESUME_URL?.trim();
  if (!resumeUrl) {
    throw new HttpError("Server misconfiguration: RESUME_URL is missing.", 500);
  }

  return {
    allowedOrigins,
    defaultCorsOrigin: allowedOriginsList[0],
    resendFrom,
    resumeUrl,
    resumeSubject: env.RESUME_SUBJECT?.trim() || DEFAULT_RESUME_SUBJECT,
  };
}

function getResumeTokenSecret(env: Env): string {
  const secret = env.RESUME_TOKEN_SECRET?.trim();
  if (!secret) {
    throw new HttpError("Server misconfiguration: RESUME_TOKEN_SECRET is missing.", 500);
  }
  return secret;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecodeToBytes(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function signToken(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

async function verifyTokenSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sigBuffer = base64UrlDecodeToBytes(signature);
  return crypto.subtle.verify("HMAC", key, sigBuffer, new TextEncoder().encode(payload));
}

async function createResumeToken(leadId: number, secret: string): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + RESUME_TOKEN_TTL_SECONDS;
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = base64UrlEncode(nonceBytes);
  const payload = `${leadId}.${expiresAt}.${nonce}`;
  const signature = await signToken(payload, secret);
  return `${base64UrlEncode(new TextEncoder().encode(payload))}.${signature}`;
}

async function parseResumeToken(
  token: string,
  secret: string
): Promise<{ leadId: number; expiresAt: number } | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const payloadBytes = base64UrlDecodeToBytes(parts[0]);
  const payload = new TextDecoder().decode(new Uint8Array(payloadBytes));
  const [leadIdRaw, expiresAtRaw] = payload.split(".");
  const leadId = Number(leadIdRaw);
  const expiresAt = Number(expiresAtRaw);

  if (!Number.isFinite(leadId) || !Number.isFinite(expiresAt)) return null;

  const valid = await verifyTokenSignature(payload, parts[1], secret);
  if (!valid) return null;

  if (Math.floor(Date.now() / 1000) > expiresAt) return null;

  return { leadId, expiresAt };
}

function getCorsHeaders(origin: string | null, config: AppConfig): Headers {
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

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  corsHeaders: Headers
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

async function verifyWithAbstract(email: string, apiKey: string): Promise<void> {
  const url = new URL("https://emailreputation.abstractapi.com/v1/");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("email", email);

  const response = await fetch(url.toString(), {
    method: "GET",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new HttpError("Email verification service unavailable.", 502);
  }

  const data = (await response.json()) as AbstractEmailResponse;

  if (data.is_valid_format?.value === false) {
    throw new HttpError("Invalid email address.", 400);
  }

  if (data.is_disposable_email?.value === true) {
    throw new HttpError("Disposable email addresses are not allowed.", 400);
  }

  if (data.deliverability && data.deliverability.toUpperCase() === "UNDELIVERABLE") {
    throw new HttpError("Email address appears undeliverable.", 400);
  }
}

async function sendResumeEmail(
  email: string,
  name: string | null,
  apiKey: string,
  config: AppConfig,
  viewUrl: string,
  downloadUrl: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.resendFrom,
      to: [email],
      subject: config.resumeSubject,
      template_id: "send_resume",
      variables: {
        name: name || "there",
        preview_link: viewUrl,
        download_link: downloadUrl,
      },
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new HttpError("Failed to send resume email.", 502);
  }
}

async function logResumeAction(
  db: D1Database,
  leadId: number,
  action: "view" | "download"
): Promise<void> {
  if (action === "view") {
    await db
      .prepare("UPDATE leads SET resume_viewed_at = datetime('now') WHERE id = ?")
      .bind(leadId)
      .run();
    return;
  }

  await db
    .prepare("UPDATE leads SET resume_downloaded_at = datetime('now') WHERE id = ?")
    .bind(leadId)
    .run();
}

async function proxyResumePdf(
  request: Request,
  config: AppConfig,
  disposition: "inline" | "attachment"
): Promise<Response> {
  const upstream = await fetch(config.resumeUrl, {
    method: "GET",
    signal: AbortSignal.timeout(8000),
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Resume unavailable.", { status: 502 });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("Content-Type") || "application/pdf";
  headers.set("Content-Type", contentType);
  headers.set("Content-Disposition", `${disposition}; filename="resume.pdf"`);

  const cacheControl = upstream.headers.get("Cache-Control");
  if (cacheControl) {
    headers.set("Cache-Control", cacheControl);
  }

  return new Response(upstream.body, {
    status: 200,
    headers,
  });
}

async function handleResumeRequest(
  request: Request,
  env: Env,
  config: AppConfig
): Promise<Response> {
  const url = new URL(request.url);
  const [, token, action] = url.pathname.split("/").filter(Boolean);

  if (!token) {
    return new Response("Invalid resume link.", { status: 400 });
  }

  if (!action) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/r/${token}/view`,
      },
    });
  }

  if (action !== "view" && action !== "download") {
    return new Response("Invalid resume link.", { status: 404 });
  }

  const secret = getResumeTokenSecret(env);
  const payload = await parseResumeToken(token, secret);
  if (!payload) {
    return new Response("Resume link expired or invalid.", { status: 410 });
  }

  await logResumeAction(env.DB, payload.leadId, action);

  return proxyResumePdf(request, config, action === "view" ? "inline" : "attachment");
}

function isValidLeadPayload(payload: unknown): payload is LeadRequest {
  if (!payload || typeof payload !== "object") return false;

  const p = payload as Record<string, unknown>;

  return (
    typeof p.email === "string" &&
    (p.name === undefined || typeof p.name === "string") &&
    typeof p.reason === "string" &&
    (p.turnstileToken === undefined || typeof p.turnstileToken === "string") &&
    typeof p.consent === "boolean"
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = normalizeOrigin(request.headers.get("Origin"));
    const url = new URL(request.url);
    let corsHeaders = new Headers({
      "Access-Control-Allow-Origin": origin ?? "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8",
    });

    try {
      const config = getConfig(env);
      corsHeaders = getCorsHeaders(origin, config);

      if (request.method === "GET" && url.pathname.startsWith("/r/")) {
        return handleResumeRequest(request, env, config);
      }

      if (request.method === "OPTIONS") {
        if (origin && !config.allowedOrigins.has(origin)) {
          return jsonResponse({ error: "Origin not allowed." }, 403, corsHeaders);
        }

        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }

      if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed." }, 405, corsHeaders);
      }

      if (origin && !config.allowedOrigins.has(origin)) {
        return jsonResponse({ error: "Origin not allowed." }, 403, corsHeaders);
      }

      const contentType = request.headers.get("Content-Type") ?? "";
      if (!contentType.toLowerCase().startsWith("application/json")) {
        return jsonResponse({ error: "Content-Type must be application/json." }, 400, corsHeaders);
      }

      let body: unknown;

      try {
        body = (await request.json()) as unknown;
      } catch {
        return jsonResponse({ error: "Invalid JSON body." }, 400, corsHeaders);
      }

      if (!isValidLeadPayload(body)) {
        return jsonResponse({ error: "Invalid request payload." }, 400, corsHeaders);
      }

      const email = body.email.trim().toLowerCase();
      const name = typeof body.name === "string" ? body.name.trim() : null;
      const reason = body.reason.trim();
      const consent = body.consent;

      if (!email || !EMAIL_REGEX.test(email)) {
        return jsonResponse({ error: "A valid email is required." }, 400, corsHeaders);
      }

      if (consent !== true) {
        return jsonResponse({ error: "Consent is required." }, 400, corsHeaders);
      }

      if (name && name.length > 100) {
        return jsonResponse({ error: "Name is too long." }, 400, corsHeaders);
      }

      if (!reason) {
        return jsonResponse({ error: "Reason is required." }, 400, corsHeaders);
      }

      if (reason.length > 280) {
        return jsonResponse({ error: "Reason is too long." }, 400, corsHeaders);
      }

      if (isDisposableEmail(email)) {
        return jsonResponse({ error: "Disposable email addresses are not allowed." }, 400, corsHeaders);
      }

      await verifyWithAbstract(email, env.ABSTRACT_API_KEY);

      const existing = await env.DB.prepare("SELECT 1 FROM leads WHERE email = ? LIMIT 1")
        .bind(email)
        .first();

      if (!existing) {
        const insertResult = await env.DB.prepare(
          "INSERT INTO leads (email, name, reason, consent) VALUES (?, ?, ?, ?)"
        )
          .bind(email, name, reason, consent ? 1 : 0)
          .run();

        const leadId = Number(insertResult.meta?.last_row_id);
        const resumeToken = await createResumeToken(leadId, getResumeTokenSecret(env));
        const baseUrl = new URL(request.url).origin;
        const viewUrl = `${baseUrl}/r/${resumeToken}/view`;
        const downloadUrl = `${baseUrl}/r/${resumeToken}/download`;
        await sendResumeEmail(email, name, env.RESEND_API_KEY, config, viewUrl, downloadUrl);
      }

      return jsonResponse({ success: true }, 200, corsHeaders);
    } catch (error) {
      if (error instanceof HttpError) {
        return jsonResponse({ error: error.message }, error.status, corsHeaders);
      }

      const message = error instanceof Error ? error.message : "Internal server error.";

      return jsonResponse({ error: message }, 500, corsHeaders);
    }
  },
};
