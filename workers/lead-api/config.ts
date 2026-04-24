import { DEFAULT_RESUME_RESEND_COOLDOWN_MINUTES } from "./constants";
import { HttpError } from "./types";
import type { AppConfig, Env } from "./types";

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

export function getConfig(env: Env): AppConfig {
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

  const resumeTemplateId = env.RESUME_TEMPLATE_ID?.trim();
  if (!resumeTemplateId) {
    throw new HttpError("Server misconfiguration: RESUME_TEMPLATE_ID is missing.", 500);
  }

  const resumeResendCooldownMinutes = Number(env.RESUME_RESEND_COOLDOWN_MINUTES);
  const resolvedCooldownMinutes = Number.isFinite(resumeResendCooldownMinutes)
    ? resumeResendCooldownMinutes
    : DEFAULT_RESUME_RESEND_COOLDOWN_MINUTES;

  return {
    allowedOrigins,
    defaultCorsOrigin: allowedOriginsList[0],
    resendFrom,
    resumeUrl,
    resumeTemplateId,
    resumeResendCooldownMinutes: resolvedCooldownMinutes,
  };
}

export function getResumeTokenSecret(env: Env): string {
  const secret = env.RESUME_TOKEN_SECRET?.trim();
  if (!secret) {
    throw new HttpError("Server misconfiguration: RESUME_TOKEN_SECRET is missing.", 500);
  }
  return secret;
}
