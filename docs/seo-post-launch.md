# Search Console and indexing (post-launch)

After deploying directory SEO changes:

1. **Verify property** in [Google Search Console](https://search.google.com/search-console) for your production origin (DNS or HTML file verification, as offered for your host).
2. **Submit sitemaps**: add `https://<your-domain>/sitemap.xml` (Shopify product sitemap index) and `https://<your-domain>/directory-sitemap.xml` (Barcelona directory, guides, neighbourhoods, listings).
3. **Monitor** Coverage and Page indexing for spikes in “Discovered – currently not indexed” or soft 404s; fix thin or duplicate URLs.
4. **Rich results**: spot-check category URLs with the [Rich Results Test](https://search.google.com/test/rich-results) for `FAQPage`, `ItemList`, `BreadcrumbList`, and place `LocalBusiness` where applicable.
5. **Recrawl** important URLs after large content updates (URL Inspection → Request indexing), sparingly.

No code changes are required for these steps; they are operational follow-up on your hosting domain.
