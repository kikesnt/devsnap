/**
 * Advertising consent state.
 *
 * The model is deliberately simple, because a consent model that is hard to
 * explain is usually a consent model that is hard to defend:
 *
 *  - `granted`  — advertising is allowed, and it is personalised.
 *  - `denied`   — it is not. No ad request is made at all.
 *  - `null`     — no answer yet. Treated as `denied`: nothing is requested
 *                 until the visitor says yes.
 *
 * A Do Not Track signal overrides a stored yes, which is enforced in the
 * page's head script before anything is requested.
 */

export type ConsentState = 'granted' | 'denied' | null;

export const CONSENT_KEY = 'devsnap-consent';

export function readConsent(): ConsentState {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(state: 'granted' | 'denied'): void {
  try {
    localStorage.setItem(CONSENT_KEY, state);
    // A first-party cookie as well, so the choice survives a cleared
    // localStorage and is visible to anything that only reads cookies.
    document.cookie = `${CONSENT_KEY}=${state}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // The banner still works for this page view.
  }
  const target = window as Window & { __adsConsent?: string };
  target.__adsConsent = state;
}

/** True for the EEA, the United Kingdom and Switzerland, conservatively. */
export function isRegulatedRegion(): boolean {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    return zone.startsWith('Europe/') || zone.startsWith('Atlantic/');
  } catch {
    return false;
  }
}

/**
 * Whether an ad slot may be requested at all.
 *
 * Only an explicit "yes" releases the slots, and it does so everywhere: the
 * ad request is what consent mode v2 gates, and the site does not make a
 * request with a denied signal just because the visitor is outside the
 * regulated region. Silence is "no".
 */
export function mayRequestAds(state: ConsentState = readConsent()): boolean {
  return state === 'granted';
}

/** Personalised advertising needs an explicit yes, everywhere. */
export function personalisedAllowed(state: ConsentState = readConsent()): boolean {
  return state === 'granted';
}
