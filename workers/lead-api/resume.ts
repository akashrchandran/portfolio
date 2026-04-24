/// <reference types="@cloudflare/workers-types" />

import { getResumeTokenSecret } from "./config";
import { createResumeToken, parseResumeToken } from "./crypto";
import { QUERY_UPDATE_RESUME_DOWNLOADED_AT, QUERY_UPDATE_RESUME_VIEWED_AT } from "./queries";
import type { AppConfig, Env } from "./types";

export async function buildResumeLinks(
  env: Env,
  request: Request,
  leadId: number
): Promise<{ viewUrl: string; downloadUrl: string }> {
  const resumeToken = await createResumeToken(leadId, getResumeTokenSecret(env));
  const baseUrl = new URL(request.url).origin;
  return {
    viewUrl: `${baseUrl}/r/${resumeToken}/view`,
    downloadUrl: `${baseUrl}/r/${resumeToken}/download`,
  };
}

export async function logResumeAction(
  db: D1Database,
  leadId: number,
  action: "view" | "download"
): Promise<void> {
  if (action === "view") {
    await db
      .prepare(QUERY_UPDATE_RESUME_VIEWED_AT)
      .bind(leadId)
      .run();
    return;
  }

  await db
    .prepare(QUERY_UPDATE_RESUME_DOWNLOADED_AT)
    .bind(leadId)
    .run();
}

export async function proxyResumePdf(
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

export async function handleResumeRequest(
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

  const payload = await parseResumeToken(token, getResumeTokenSecret(env));
  if (!payload) {
    return new Response("Resume link expired or invalid.", { status: 410 });
  }

  await logResumeAction(env.DB, payload.leadId, action);

  return proxyResumePdf(request, config, action === "view" ? "inline" : "attachment");
}
