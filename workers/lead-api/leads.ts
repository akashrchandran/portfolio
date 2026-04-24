export function getMinutesRemaining(lastSentAt: string, cooldownMinutes: number): number {
  const lastSentMs = Date.parse(lastSentAt);
  if (Number.isNaN(lastSentMs)) return 0;
  const elapsedMinutes = (Date.now() - lastSentMs) / 60000;
  const remaining = cooldownMinutes - elapsedMinutes;
  return remaining > 0 ? Math.ceil(remaining) : 0;
}
