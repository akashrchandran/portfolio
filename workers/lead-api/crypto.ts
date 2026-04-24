import { RESUME_TOKEN_TTL_SECONDS } from "./constants";

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

export async function createResumeToken(leadId: number, secret: string): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + RESUME_TOKEN_TTL_SECONDS;
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = base64UrlEncode(nonceBytes);
  const payload = `${leadId}.${expiresAt}.${nonce}`;
  const signature = await signToken(payload, secret);
  return `${base64UrlEncode(new TextEncoder().encode(payload))}.${signature}`;
}

export async function parseResumeToken(
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
