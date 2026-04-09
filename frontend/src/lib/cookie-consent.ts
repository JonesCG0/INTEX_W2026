import Cookies from 'js-cookie';

export const HAVEN_CONSENT_COOKIE = 'haven_consent';

export type HavenConsentState = 'all' | 'essential' | 'dismissed';

export function getConsentState(): HavenConsentState | null {
  const cookieValue = Cookies.get(HAVEN_CONSENT_COOKIE);

  if (cookieValue === 'all' || cookieValue === 'essential' || cookieValue === 'dismissed') {
    return cookieValue;
  }

  return null;
}

export function setConsentState(state: HavenConsentState) {
  Cookies.set(HAVEN_CONSENT_COOKIE, state, { expires: 365, sameSite: 'strict' });
}

export function allowsOptionalFeatures(state: HavenConsentState | null) {
  return state === 'all';
}
