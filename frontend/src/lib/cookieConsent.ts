export type CookieConsentChoice = 'necessary' | 'all';

const COOKIE_NAME = 'haven_cookie_consent';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function readCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const prefix = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(';');

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }

  return null;
}

export function readConsentChoice(): CookieConsentChoice | null {
  const cookieValue = readCookie(COOKIE_NAME);
  if (cookieValue === 'necessary' || cookieValue === 'all') {
    return cookieValue;
  }

  return null;
}

export function writeConsentChoice(choice: CookieConsentChoice): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = [
    `${encodeURIComponent(COOKIE_NAME)}=${encodeURIComponent(choice)}`,
    'Path=/',
    `Max-Age=${ONE_YEAR_SECONDS}`,
    'SameSite=Lax',
  ].join('; ');
}

