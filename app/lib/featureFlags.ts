/**
 * Product feature toggles. Flip when ready to re-launch paid membership.
 * Optional override: PUBLIC_MEMBERSHIP_ENABLED=true in .env (Hydrogen public env).
 */
function envMembershipEnabled(): boolean {
  if (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_MEMBERSHIP_ENABLED === 'true') {
    return true;
  }
  return false;
}

/** Paid membership page, nav, checkout, and join CTAs */
export const MEMBERSHIP_PUBLIC = envMembershipEnabled();

export function isMembershipPublic() {
  return MEMBERSHIP_PUBLIC;
}
