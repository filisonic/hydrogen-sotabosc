import Plausible from 'plausible-tracker';

let plausibleInstance: any = null;

function getPlausible() {
    if (typeof window === 'undefined') return null;

    if (!plausibleInstance) {
        const domain = window.location.hostname || 'sotabosc.world';
        plausibleInstance = Plausible({
            domain: domain,
            apiHost: 'https://plausible.io',
        });
    }
    return plausibleInstance;
}

/**
 * Tracks a custom event in Plausible.
 */
export function trackEvent(eventName: string, props?: Record<string, any>) {
    const p = getPlausible();
    if (p) {
        p.trackEvent(eventName, { props });
    }
}

/**
 * Tracks a pageview.
 */
export function trackPageview() {
    const p = getPlausible();
    if (p) {
        p.trackPageview();
    }
}

// ─── Directory-specific event helpers ───────────────────────────────

export function trackListingView(slug: string, domain: string, category: string) {
    trackEvent('directory:listing_view', { slug, domain, category });
}

export function trackEventView(slug: string, domain: string) {
    trackEvent('directory:event_view', { slug, domain });
}

export function trackCreatorView(slug: string, domain: string) {
    trackEvent('directory:creator_view', { slug, domain });
}

export function trackStoreClick(creatorSlug: string, productHandle?: string) {
    trackEvent('directory:store_click', { creatorSlug, productHandle });
}

export function trackReviewSubmit(placeSlug: string, rating: number) {
    trackEvent('directory:review_submit', { placeSlug, rating });
}

export function trackSearch(query: string, resultCount: number) {
    trackEvent('directory:search', { query, resultCount });
}

export function trackCategoryFilter(category: string) {
    trackEvent('directory:category_filter', { category });
}

export function trackDomainFilter(domain: string) {
    trackEvent('directory:domain_filter', { domain });
}

export function trackContributionCTA(action: string) {
    trackEvent('directory:contribution_cta', { action });
}
