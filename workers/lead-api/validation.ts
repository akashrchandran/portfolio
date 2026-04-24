import { HttpError } from "./types";
import type { AbstractEmailResponse, LeadRequest } from "./types";

export function isValidLeadPayload(payload: unknown): payload is LeadRequest {
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

export async function verifyWithAbstract(email: string, apiKey: string): Promise<void> {
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
