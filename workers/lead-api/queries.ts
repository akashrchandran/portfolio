export const QUERY_SELECT_LEAD_BY_EMAIL =
  "SELECT id, resume_last_sent_at FROM leads WHERE email = ? LIMIT 1";

export const QUERY_UPDATE_RESUME_LAST_SENT_AT =
  "UPDATE leads SET resume_last_sent_at = datetime('now') WHERE id = ?";

export const QUERY_INSERT_LEAD_WITH_RESUME_LAST_SENT_AT =
  "INSERT INTO leads (email, name, reason, consent, resume_last_sent_at) VALUES (?, ?, ?, ?, datetime('now'))";

export const QUERY_UPDATE_RESUME_VIEWED_AT =
  "UPDATE leads SET resume_viewed_at = datetime('now') WHERE id = ?";

export const QUERY_UPDATE_RESUME_DOWNLOADED_AT =
  "UPDATE leads SET resume_downloaded_at = datetime('now') WHERE id = ?";
