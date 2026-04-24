import { HttpError } from "./types";
import type { AppConfig } from "./types";

export async function sendResumeEmail(
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
      template: {
        id: config.resumeTemplateId,
        variables: {
          name: name || "there",
          preview_link: viewUrl,
          download_link: downloadUrl,
        },
      },
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new HttpError("Failed to send resume email.", 502);
  }
}
