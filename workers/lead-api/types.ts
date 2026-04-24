/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  ABSTRACT_API_KEY: string;
  RESEND_API_KEY: string;
  CORS_ORIGINS: string;
  RESEND_FROM: string;
  RESUME_URL: string;
  RESUME_TOKEN_SECRET: string;
  RESUME_TEMPLATE_ID: string;
  RESUME_RESEND_COOLDOWN_MINUTES?: string;
}

export type LeadRequest = {
  email: string;
  name?: string;
  reason: string;
  turnstileToken?: string;
  consent: boolean;
};

export type AbstractEmailResponse = {
  is_valid_format?: { value?: boolean };
  is_disposable_email?: { value?: boolean };
  deliverability?: string;
};

export type AppConfig = {
  allowedOrigins: Set<string>;
  defaultCorsOrigin: string;
  resendFrom: string;
  resumeUrl: string;
  resumeTemplateId: string;
  resumeResendCooldownMinutes: number;
};

export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
