/**
 * URL validation helper for external government portals and news sources.
 * Validates that a URL is a legitimate http/https external address
 * and prevents accidental navigation to localhost or internal app routes.
 */
export function isValidExternalUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === '#' || trimmed.startsWith('javascript:')) return false;
  try {
    const parsed = new URL(trimmed);
    const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    const isNotLocalhost = parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1';
    return isHttp && isNotLocalhost;
  } catch {
    return false;
  }
}
