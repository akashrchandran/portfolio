/// <reference types="@cloudflare/workers-types" />

import { isDisposableEmail } from "fakeout";

import { getConfig } from "./config";
import { normalizeOrigin, getCorsHeaders, jsonResponse } from "./cors";
import { EMAIL_REGEX } from "./constants";
import { sendResumeEmail } from "./email";
import { getMinutesRemaining } from "./leads";
import {
  QUERY_INSERT_LEAD_WITH_RESUME_LAST_SENT_AT,
  QUERY_SELECT_LEAD_BY_EMAIL,
  QUERY_UPDATE_RESUME_LAST_SENT_AT,
} from "./queries";
import { buildResumeLinks, handleResumeRequest } from "./resume";
import { HttpError } from "./types";
import type { Env } from "./types";
import { isValidLeadPayload, verifyWithAbstract } from "./validation";

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

      const existing = await env.DB.prepare(QUERY_SELECT_LEAD_BY_EMAIL)
        .bind(email)
        .first();

      if (existing) {
        const lastSentAt = (existing as { resume_last_sent_at?: string | null }).resume_last_sent_at;
        if (lastSentAt) {
          const minutesRemaining = getMinutesRemaining(
            lastSentAt,
            config.resumeResendCooldownMinutes
          );
          if (minutesRemaining > 0) {
            return jsonResponse(
              {
                error:
                  `You have already requested recently. Wait ${minutesRemaining} minutes, and if you can't find the email, check the spam folder.`,
              },
              429,
              corsHeaders
            );
          }
        }
      }

      await verifyWithAbstract(email, env.ABSTRACT_API_KEY);

      if (existing) {
        const leadId = Number((existing as { id?: number }).id);
        const { viewUrl, downloadUrl } = await buildResumeLinks(env, request, leadId);
        await sendResumeEmail(email, name, env.RESEND_API_KEY, config, viewUrl, downloadUrl);
        await env.DB.prepare(QUERY_UPDATE_RESUME_LAST_SENT_AT)
          .bind(leadId)
          .run();
      } else {
        const insertResult = await env.DB.prepare(QUERY_INSERT_LEAD_WITH_RESUME_LAST_SENT_AT)
          .bind(email, name, reason, consent ? 1 : 0)
          .run();

        const leadId = Number(insertResult.meta?.last_row_id);
        const { viewUrl, downloadUrl } = await buildResumeLinks(env, request, leadId);
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
