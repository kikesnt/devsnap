/**
 * Advertising consent state.
 *
 * The model is deliberately simple, because a consent model that is hard to
 * explain is usually a consent model that is hard to defend:
 *
 *  - `granted`  — personalised advertising is allowed.
 *  - `denied`   — it is not. Outside the EEA the slot still loads with
 *                 non-personalised advertising; inside the EEA no ad request
 *                 is made at all.
 *  - `null`     — no answer yet. Treated as `denied` for personalisation, and
 *                 as "do not load" inside the EEA.
 *
 * The EEA test is a timezone heuristic, not geolocation. It is intentionally
 * conservative: it treats the whole `Europe/*` and `Atlantic/*` namespace as
 * the regulated region, which over-includes a few non-EEA countries and never
 * under-includes one. A false positive costs an impression; a false negative
 * costs a GDPR complaint.
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
 * Whether an ad slot may be requested at all. Inside the regulated region the
 * answer is no until the visitor has actively agreed.
 */
export function mayRequestAds(state: ConsentState = readConsent()): boolean {
  if (state === 'granted') return true;
  return !isRegulatedRegion();
}

/** Personalised advertising needs an explicit yes, everywhere. */
export function personalisedAllowed(state: ConsentState = readConsent()): boolean {
  return state === 'granted';
}
