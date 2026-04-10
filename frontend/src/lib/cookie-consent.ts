import Cookies from 'js-cookie';

export const HAVEN_CONSENT_COOKIE = 'haven_consent';

export type HavenConsentState = 'all' | 'essential' | 'dismissed';

export function getConsentState(): HavenConsentState | null {
  const cookieValue = Cookies.get(HAVEN_CONSENT_COOKIE);

  // Only accept known consent values.
  if (cookieValue === 'all' || cookieValue === 'essential' || cookieValue === 'dismissed') {
    return cookieValue;
  }

  return null;
}

export function setConsentState(state: HavenConsentState) {
  // Keep the consent choice for a year so users are not asked repeatedly.
  Cookies.set(HAVEN_CONSENT_COOKIE, state, { expires: 365, sameSite: 'strict' });
}

export function allowsOptionalFeatures(state: HavenConsentState | null) {
  // Optional features only turn on when the user explicitly allows them.
  return state === 'all';
}
