---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
inputDocuments: ['_bmad-output/brainstorming/brainstorming-session-2026-03-12-16-57.md']
workflowType: 'prd'
classification:
  projectType: web_app
  domain: Creative Digital Ecosystem / Art Platform
  complexity: medium-high
  projectContext: greenfield


# Product Requirements Document - Sotabosc

**Author:** Cherukara
**Date:** 2026-03-12

---

## Executive Summary

Sotabosc (`sotabosc.world`) is a living browser-based world structured as a vertical ecological cross-section — sky, canopy, understory, fungal network, water, and soil. Visitors don't browse a website; they descend into a place. The experience is slow, mysterious, and personalised: each visitor is quietly assigned an organism identity (bird, tree, fungi, algae, or microbe) that shapes what they discover. A fungi visitor descends through a mycelial world; a bird visitor sees from the canopy first. Each organism evolves in real biological time — ageing and changing whether or not the visitor returns.

Sotabosc solves the widespread loss of wonder in digital spaces. As a reaction to fast, extractive social media, Sotabosc offers a rare digital environment that rewards patience, curiosity, and return. It is not built for users — humans are visitors. The organisms are the protagonists.

**Target Users:**
- Artists, craftspeople, foragers, fermenters, and people drawn to slow culture and ecological thinking
- People who have felt alienated by standard e-commerce and portfolio sites
- Curious visitors with no prior relationship to the creator's practice — discovered through links, word of mouth, or organic interest

**The Problem Being Solved:**
Creative practitioners who work at the intersection of art, ecology, and craft have no home online that reflects the depth and pace of their work. Existing platforms (Shopify, Behance, Instagram) flatten this work into catalogues and feeds. Sotabosc provides a world that *is* the work — the medium and the message are the same.

### What Makes This Special

**Core differentiator:** The ecosystem is personalised by organism type — each visitor's world is genuinely different. There is no standard site-map. Content, contextual links (to drawings, events, kombucha, workshops), and layer emphasis vary by who you are. The world is impossible to fully describe to someone who hasn't entered it themselves — the strongest possible form of word-of-mouth.

**The key inversion:** Most platforms ask users to be *consumers*. Sotabosc asks visitors to be *organisms* in a world that does not belong to them. This shift — from user to inhabitant — creates emotional belonging no conventional UX pattern can replicate.

**The evolving organism mechanic:** No notifications. No gamification. Visitors return because something has genuinely changed. Their organism is older. A season has passed. Engagement through biological time, not algorithmic pressure.

**Products and links as discoveries:** Artworks, events, and projects appear as contextual portals inside the world — not a shop grid. A fungi layer artefact might lead to a drawing collection; a water layer link might surface a fermentation event. The world guides, it does not sell.

**Phase 2 potential:** When the world is established, organism profiles become community identities. Organism identity can optionally be upgraded to a blockchain-backed permanent record — introduced silently, without jargon, only for those who seek permanence.

## Project Classification

- **Project Type:** Web Application (browser-based SPA / continuous scroll surface)
- **Domain:** Creative Digital Ecosystem / Art Platform
- **Complexity:** Medium-High (personalised scroll world, organism persistence, generative identity, ambient sound layering)
- **Project Context:** Greenfield — no existing system
- **Phase 1 Scope:** World structure + organism card + contextual discovery links + ambient sound + frictionless organism persistence (localStorage / optional email)
- **Phase 2 Scope (deferred):** Community organism profiles, ecosystem map, optional Web3 identity layer

---

## Organism System — Six Ecological Domains

Sotabosc uses a scientifically grounded 6-domain organism classification. Visitors select one domain; the system generates a unique species identity within it. Each domain maps directly to one vertical ecosystem layer, creating a perfect 1:1 relationship between identity and spatial world.

| Domain | Layer | Role | Example Identities |
|---|---|---|---|
| 🐾 Animals | ☁️ Sky | Movement & sensing | Fox, Raven, Ant, Whale, Beetle |
| 🌳 Plants | 🌳 Canopy | Growth & energy | Oak, Fern, Moss, Bamboo, Lotus |
| 🍄 Fungi | 🌿 Understory | Networks & decomposition | Mycelium, Lichen, Chanterelle |
| 🌊 Algae | 🌊 Water | Regeneration | Kelp, Spirulina, Phytoplankton |
| 🦠 Microbes | 🌱 Soil | Transformation | Fermentation culture, Archaea |
| 🪨 Earth/Minerals | 🪨 Bedrock | Structure & memory | Basalt, River clay, Quartz |

**Philosophical grounding:** The six domains reflect posthuman ecological thinking (Barad, Haraway, new materialism). Non-living matter (Earth/Minerals) is included as an active participant — not as decoration, but as an agent with geological time, memory, and structure. This is what makes Sotabosc philosophically distinct from any other digital world.

---

## Success Criteria

### User Success

- A visitor can enter Sotabosc, choose a domain, and receive a unique organism card **within 30 seconds, with zero sign-up required**
- A visitor returns after 30+ days and notices their organism has visibly changed (aged, grown, shifted stage)
- A visitor discovers a contextual link (drawings, event, kombucha, workshop) that feels *found* rather than sold — and follows it
- The world feels perceptibly different depending on domain — an Animal visitor (sky) and an Earth visitor (bedrock) have a genuinely different experience of the same world
- Ambient sounds are noticed positively (or not noticed negatively) — no complaints about unwanted audio

### Business Success

- **3 months post-launch:** 500+ unique organism cards generated; at least 20% of visitors return at least once
- **6 months:** Organism-based personalisation drives measurable clicks to at least 3 contextual link categories
- **12 months:** Sotabosc is described by visitors in their own words without prompting — the concept self-explains and spreads
- The world becomes a reference point for the creator's practice (media, collaborators, institutions reference Sotabosc)

### Technical Success

- Page loads under 3 seconds on a standard connection
- Organism state persists reliably in localStorage across sessions for 90+ days without login
- Scroll ecosystem performs at 60fps on mid-range laptops and mobile
- Ambient audio plays at very low volume by default with a visible, accessible mute toggle
- Layer personalisation by organism domain works without a backend (static in Phase 1)

### Measurable Outcomes

- Visitor-to-organism conversion: target >40% of visitors choose a domain
- Return visit rate: target >20% within 60 days
- Contextual link CTR: at least one link category achieves >5% CTR from its relevant layer

---

## Product Scope

### MVP — Minimum Viable Product (Phase 1)

- **Entry:** Landing screen → "Enter the forest" CTA
- **Domain selection:** 6 domains (Animals, Plants, Fungi, Algae, Microbes, Earth/Minerals) — visitor picks, system generates unique card
- **Organism card:** procedurally generated name, species, age (starts at 0), habitat, role
- **Organism persistence:** localStorage; optional email to "save" organism — never forced
- **Scrollable ecosystem:** 6 vertical layers (Sky → Canopy → Understory → Water → Soil → Bedrock), at minimum 3 fully designed at launch
- **Layer personalisation:** content emphasis and contextual link sets vary by organism domain
- **Contextual links:** each layer surfaces 1–2 discovered artefact links (drawings, events, projects)
- **Ambient sound:** subtle layered nature sounds per ecosystem depth, mutable
- **Organism evolution:** time-based (organism ages in real calendar time via localStorage)
- **Mobile responsive**

### Growth Features (Post-MVP / Phase 2)

- All 6 layers fully designed and populated
- Visit-based organism evolution (return visits accelerate changes)
- Email milestone notifications ("Your oak has grown a new ring")
- Community organism profiles and ecosystem map
- Optional Web3 organism identity upgrade — silently offered, no jargon

### Vision (Long-Term)

- Sotabosc as a living archive of the full creative practice
- Organism communities forming around shared domains and species
- Other artists inhabiting layers temporarily as guests
- Physical–digital bridge: organism signals informing generative plotter drawings
- Sotabosc as a philosophical and ecological reference world

---

## Existing System Context

> **Important constraint:** An existing Shopify store is live at `sotabosc.world`. This shapes the architecture significantly.

**Integration strategy:**
- The new Sotabosc world (Next.js) will **replace** the Shopify storefront at `sotabosc.world`
- Shopify continues to handle **product catalogue, inventory, and payments** via its Storefront API
- Contextual links in the ecosystem that lead to products point directly to **Shopify product or collection pages** (or use a custom storefront built with Shopify Storefront API embedded in the Next.js app)
- No rebuilding of commerce logic — Shopify is the commerce backend; Sotabosc is the front

**Migration path:**
1. Build and test the Sotabosc Next.js world on a staging URL
2. Point `sotabosc.world` DNS to Vercel, replacing the Shopify storefront
3. Shopify store remains as a headless backend (Storefront API access)
4. Existing products remain untouched; they are surfaced as discovered artefacts in the ecosystem

---

## User Journeys

### Journey 1: The Curious First-Time Visitor (Primary — Happy Path)
**Persona:** Marta, 34, Barcelona. Graphic designer drawn to ecology and slow living. Discovers Sotabosc via a friend's WhatsApp link, opens on her phone at a café.

- **Opening:** The page loads — no familiar branding, no product grid. Something is moving. A slow, dark world. She reads: *"Welcome to Sotabosc."* She presses *"Enter the forest."*
- **Rising action:** A screen: *"What are you?"* — six domains. She's drawn to Plants. Her card generates silently: *"Azure Fern · Mediterranean Understory · Age: 0 seasons · Role: Light Filter."*
- **Climax:** She scrolls into the canopy layer. A faint label: *"Artefact: Mycelial Drift No.3 — found in the fungal network."* She clicks through to a drawing on the Shopify store. She buys it.
- **Resolution:** She never signed up. Three weeks later she types the URL from memory. Her fern is now Age: 0.7 seasons. She screenshots it.

### Journey 2: The Returning Inhabitant (Primary — Repeat Visit)
**Persona:** Jonas, 41, Berlin. Fermentation practitioner. Discovered Sotabosc 6 months ago, chose Microbes.

- **Opening:** He types sotabosc.world from memory. His organism card appears instantly from localStorage: *"Thermophilic Bacterium · Age: 6 seasons · Role: Nitrogen fixer."*
- **Rising action:** He descends to the soil layer — his layer. A new artefact link: a fermentation workshop in his city. It wasn't there last month.
- **Climax:** He signs up for the workshop via the external link. He sends the Sotabosc URL to three people.
- **Resolution:** He wonders what his organism looks like at 12 seasons. He returns monthly.

### Journey 3: The Creator / Content Manager (Secondary — Admin)
**Persona:** The artist and creator of Sotabosc. Wants to add a new foraging event link to the Fungi layer before the weekend.

- **Opening:** Opens Sanity Studio (`sotabosc.world/studio`). Logs in. Navigates to the Fungi layer content type.
- **Action:** Adds a new artefact link — title, URL, short description. Publishes.
- **Resolution:** The link is live in the Fungi layer within seconds. Done on a phone before the event. No code touched.

### Journey 4: The Lost Wanderer (Edge Case — Skipped Organism Selection)
**Persona:** Tomàs, 19, student. Arrives via a search result, sceptical. Skips organism selection.

- **Opening:** Presses *"Skip and explore."* The world opens in neutral mode — all layers accessible, no personalisation.
- **Rising action:** He reaches the Bedrock layer. Something about geological time resonates. He finds a link inside the world: *"Find your place."*
- **Resolution:** He returns to organism selection and chooses Earth/Minerals. His card generates. The Bedrock layer becomes prominent on subsequent visits.

> **Requirements revealed:** Re-accessible organism selection from within the world; neutral anonymous mode with full layer access.

### Journey Requirements Summary

| Capability | Revealed By |
|---|---|
| Organism card generation + localStorage persistence | Journeys 1 & 4 |
| Time-based organism evolution + visible age | Journeys 1 & 2 |
| Layer personalisation by organism domain | Journeys 1, 2 & 4 |
| Contextual artefact links per layer (Sanity-managed) | Journeys 1, 2 & 3 |
| Shopify Storefront API integration for product links | Journey 1 |
| Sanity Studio for content management (Phase 1) | Journey 3 |
| Re-accessible organism selection from within the world | Journey 4 |
| Skip/anonymous mode with full layer access | Journey 4 |

### Key Architectural Decisions (Confirmed)

| Decision | Resolution |
|---|---|
| CMS | Sanity.io — included in Phase 1 |
| E-commerce | Shopify Storefront API (existing store) |
| Domain | sotabosc.world — Next.js replaces Shopify frontend |
| Web3 chain (Phase 2) | Tezos — low energy, art-native ecosystem |
| Organism data format | Portable JSON from day one (ERC-721 / FA2 compatible metadata) |
| Phase 2 identity upgrade | localStorage UUID → Tezos wallet token ("Make your organism permanent") |

---

## Domain-Specific Requirements

**Domain:** Creative Digital Ecosystem / Art Platform — a novel domain with no regulatory compliance requirements, but with specific technical, integration, and artistic integrity constraints.

### Privacy & Data

- Organism identity is stored in **localStorage only** in Phase 1 — no personal data collected by default
- If visitor opts to save their organism via email, that email is stored securely (Vercel serverless + database TBD) and used only for organism milestone notifications — no marketing without explicit consent
- GDPR-friendly by design: no tracking cookies, no analytics that identify individuals without consent
- Optional analytics (e.g. Plausible — privacy-first) for aggregate visit tracking only

### Integration Constraints

- **Shopify Storefront API:** Product data fetched at build time or via client-side API calls. Sotabosc does not handle payments — all transactions occur on Shopify. No PCI-DSS scope on the Next.js app.
- **Sanity.io:** Used for layer content and artefact links only. Not used for organism data (organism data stays client-side in Phase 1). Sanity webhooks can trigger Vercel redeployment for static content updates.
- **Tezos (Phase 2):** Requires wallet connection library (e.g. Taquito + Beacon). Must be additive — organism system must work identically without wallet. Wallet integration is an opt-in upgrade path, not a dependency.

### Performance & Accessibility

- Scroll performance is critical — the world must feel smooth at 60fps. Heavy animations must be deferred or reduced on low-power devices (use `prefers-reduced-motion` media query).
- Images and SVG layers must be lazy-loaded per visible layer to avoid initial load degradation
- The world must be navigable without sound (ambient audio is never required for navigation or understanding)
- Minimum accessibility: keyboard navigable organism selection, readable contrast ratios for all text elements, mute toggle visible and reachable

### Artistic Integrity Constraints

- **No dark UX patterns** — no countdown timers, no urgency messaging, no "only 2 left" language inside the world. The world is calm.
- **No third-party ad networks** on any page of Sotabosc
- **Product presentation language** inside the ecosystem must remain poetic and contextual — never catalogue-style. Sanity content schema should enforce a "found object description" field, not a "product description" field.
- **Organism card generation** must produce genuinely varied results — the procedural name generator must have enough variation that two fungi visitors are unlikely to receive identical cards

---

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Organism-as-identity (no precedent in consumer web)**
No existing art or commerce platform uses an evolving biological organism as a persistent, zero-login identity. The organism is not a profile, not an avatar, not a badge — it is a *living record of biological time*.

**2. Ecological time as the engagement mechanic**
Every existing platform uses algorithmic time (notifications, streaks, feeds). Sotabosc replaces this entirely with biological time — an organism ages whether you visit or not. There is no documented precedent for this as a primary engagement pattern in a commercial digital product.

**3. Personalised world without a user backend**
In Phase 1, the world is genuinely different per organism type using only localStorage and static Sanity content. A personalised experience without a database, login, or session is architecturally novel for an art/commerce platform.

**4. Non-living matter as an interactive actor (Earth/Minerals domain)**
Including geological matter as one of six organism domains enacts posthuman philosophy (Barad, Haraway) in a product interface. A user who identifies as a rock has no equivalent in any existing digital product.

**5. Commerce surfaced as ecological discovery**
Products appear as *found objects* — artefacts, not items. Shopify sits headlessly beneath a scroll ecology. The visitor discovers a drawing the way they might find a feather on a forest floor.

### Market Context & Competitive Landscape

- **Existing alternatives:** Shopify storefronts, Cargo, Are.na, Behance — grids, feeds, portfolios. None have spatial, ecological, or time-based mechanics.
- **Closest references:** Zach Lieberman's digital experiments, Hundred Rabbits' off-grid computing ethos — not commerce-enabled.
- **Cultural moment:** Post-pandemic slow web movement, solarpunk aesthetics, ecological design discourse — Sotabosc arrives at a culturally receptive moment.

### Validation Approach

- Organism selection rate >40% → concept resonates
- Return visit rate >20% within 60 days → ecological time working
- Visitors describe Sotabosc in their own words unprompted → concept self-communicates

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| Organism mechanic confuses visitors | Minimal onboarding copy; "Skip and explore" always accessible |
| Ecological time feels too slow | Visible change within 2 weeks of organism creation |
| localStorage fails in private browsing | Detect gracefully; offer email save option early in the journey |
| Web3 Phase 2 low adoption | Additive and optional — Phase 1 success independent of it |

---

## Web Application Specific Requirements

### Project-Type Overview

Sotabosc is a **browser-based SPA** (Single Page Application) built on Next.js, rendered with a mix of Static Site Generation (SSG) for layer content and client-side state for organism data. It is not a traditional multi-page site — it is a continuous scroll surface with distinct layer zones.

### Browser Support

- **Modern evergreen browsers:** Chrome, Firefox, Safari, Edge — latest 2 versions
- **Mobile browsers:** iOS Safari, Android Chrome — primary targets (many visitors will arrive on mobile)
- **No IE support:** Not required
- **Progressive enhancement:** Core world (text, structure, links) must work without JavaScript; animations and 3D enhancements are layered on top

### Responsive Design

- The scroll ecosystem must function on all screen sizes
- Mobile: single-column vertical scroll, organism card full-width, layer elements stacked
- Desktop: richer parallax depth, wider layer compositions, more visual detail
- The experience must be **complete on mobile** — not degraded. Many visitors will arrive via shared links on phones.

### Performance Targets

- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 3s
- Scroll performance: 60fps on mid-range devices (`will-change`, GPU-composited layers)
- Total bundle size: < 500kb initial JS (code-split per layer)
- Images/SVGs: lazy-loaded per visible layer; next-gen formats (WebP/AVIF)

### SEO Strategy

- The world must be crawlable: organism selection, layer content, and artefact links should be accessible without JavaScript where possible
- Meaningful `<title>`, `<meta description>` per page/route
- Open Graph tags for social sharing (when a visitor shares Sotabosc, the preview should convey the world's aesthetic)
- Sitemap generated by Next.js for Vercel deployment
- **Important:** SEO is secondary to experience — the world is not optimised for search traffic. Word of mouth and link sharing are primary discovery mechanisms.

### Accessibility

- Minimum: WCAG 2.1 AA compliance for organism selection flow and text content
- Keyboard navigable organism selection
- `prefers-reduced-motion`: all scroll animations and parallax effects must respect this media query
- Sound is never a navigation or content requirement — mute state does not restrict access
- Colour contrast: all text elements must meet 4.5:1 ratio minimum

### Implementation Considerations

- **Framework:** Next.js 14+ (App Router) — enables SSG for layer content, client components for organism state
- **Scroll engine:** GSAP ScrollTrigger — professional-grade scroll animation with good mobile support
- **Visual depth:** CSS 3D transforms + subtle GLSL shaders via React Three Fiber (lightweight, not full 3D game)
- **CMS:** Sanity.io — layer content, artefact links, event links. Studio accessible at `/studio`
- **Commerce:** Shopify Storefront API — product data fetched at build time or on-demand
- **Sound:** Howler.js — cross-browser ambient audio, per-layer sound zones, volume control, mute toggle
- **Deployment:** Vercel — automatic preview deployments per branch, Sanity webhook triggers rebuild on content change
- **Analytics:** Plausible (privacy-first) — no cookies, no personal data collection

---

## Functional Requirements

### World Experience

- **FR1:** Visitor can enter Sotabosc without any account, registration, or personal data submission
- **FR2:** Visitor can scroll vertically through all six ecosystem layers (Sky → Canopy → Understory → Water → Soil → Bedrock)
- **FR3:** Visitor can skip organism selection and explore the world in anonymous mode
- **FR4:** Visitor in anonymous mode can access organism selection from within the world at any point
- **FR5:** Visitor can scroll back up through previously visited layers
- **FR6:** The world presents each ecosystem layer with distinct visual, sonic, and content character
- **FR7:** Ambient sound adjusts based on the current ecosystem layer visible on screen

### Organism Identity

- **FR8:** Visitor can select one of six organism domains (Animals, Plants, Fungi, Algae, Microbes, Earth/Minerals)
- **FR9:** System generates a unique organism card for the selected domain (name, species, starting age, habitat, role)
- **FR10:** Visitor's organism identity and card data persist across browser sessions without requiring a login
- **FR11:** Visitor can optionally provide an email address to save their organism externally
- **FR12:** Visitor can view their organism card and current age at any point during their visit
- **FR13:** Organism age advances based on real elapsed calendar time since creation
- **FR14:** Organism card reflects visible changes when the visitor returns after a significant elapsed time
- **FR15:** Visitor's active organism domain influences which ecosystem layer is foregrounded on their visit

### Content Discovery

- **FR16:** Each ecosystem layer surfaces contextual artefact links relevant to that layer's domain
- **FR17:** Artefact links appear as discovered found objects, not as catalogue or shop items
- **FR18:** Content manager can add, edit, and remove artefact links per layer without code changes (via CMS)
- **FR19:** Artefact links can point to internal Shopify product/collection pages or any external URL
- **FR20:** Visitor can follow an artefact link to its destination page
- **FR21:** Content visible in each layer varies subtly based on visitor's organism domain
- **FR22:** Content manager can associate specific artefact links with specific organism domains

### Commerce Integration

- **FR23:** Products from the existing Shopify store are accessible via artefact links within the world
- **FR24:** All purchase transactions occur within the existing Shopify store — Sotabosc does not handle payments
- **FR25:** Product presentation inside the world uses found-object language, not catalogue language

### Sound

- **FR26:** Visitor can mute or unmute ambient sound at any time via a visible control
- **FR27:** Ambient sound is off by default on first visit; visitor must explicitly enable it
- **FR28:** When enabled, ambient sound plays at a very low default volume

### Content Management

- **FR29:** Content manager can access the CMS studio from within the Sotabosc domain
- **FR30:** Content manager can create, update, and delete layer content (artefact links, layer descriptions, event links)
- **FR31:** Content changes in the CMS propagate to the live world within a short time (minutes, not hours)

### Organism Generator

- **FR32:** Organism name generator produces sufficient variation that two same-domain visitors are unlikely to receive identical cards
- **FR33:** Generated organism data is stored as portable JSON (compatible with future Web3/Tezos identity upgrade)
- **FR34:** Organism data includes: domain, name, species, age, habitat, role, created-date

### Analytics

- **FR35:** Site owner can view aggregate visitor counts, organism selection rates, and layer engagement metrics
- **FR36:** Analytics system collects no personally identifiable information and uses no tracking cookies

---

## Non-Functional Requirements

The following quality attributes are binding constraints. They apply across the entire system unless a specific exception is noted.

### Performance

- **NFR1:** First Contentful Paint (FCP) < 1.5 seconds on a 4G mobile connection
- **NFR2:** Largest Contentful Paint (LCP) < 3 seconds
- **NFR3:** Scroll animations maintain ≥ 60fps on mid-range devices (2020 Mac, mid-range Android)
- **NFR4:** Initial JavaScript bundle < 500kb (gzipped); layers are code-split and lazy-loaded
- **NFR5:** All images and SVGs are lazy-loaded per visible layer; delivered in WebP or AVIF format

### Reliability

- **NFR6:** Organism state must survive normal browser session ends (tab close, navigate away) and be fully restored on return
- **NFR7:** If localStorage is unavailable (private browsing), the system must detect this gracefully and prompt the email-save option without crashing
- **NFR8:** CMS content updates must not cause downtime — Vercel ISR (Incremental Static Regeneration) or webhook-triggered rebuild is the acceptable pattern

### Privacy & Security

- **NFR9:** No personally identifiable information is collected by default — organism data is exclusively client-side in Phase 1
- **NFR10:** Email addresses collected for organism-save purposes are stored securely and used only for organism milestone notifications
- **NFR11:** No third-party ad networks or tracking scripts are loaded on any page
- **NFR12:** Analytics data is anonymised and aggregate only

### Accessibility

- **NFR13:** Organism selection flow meets WCAG 2.1 AA minimum contrast and keyboard navigation requirements
- **NFR14:** All scroll animations and parallax effects respect the `prefers-reduced-motion` CSS media query
- **NFR15:** Sound is never required to navigate, understand content, or complete any interaction
- **NFR16:** Mute toggle is always visible and keyboard-accessible

### Artistic Integrity

- **NFR17:** No dark UX patterns — no countdown timers, urgency cues, "only X left" messaging, or forced pop-ups
- **NFR18:** Product/artefact copy must use found-object language — the Sanity content schema enforces a description field framed as discovery, not sale
- **NFR19:** The world must feel complete and functional on mobile — not a degraded version of the desktop experience

---

## PRD Status: Complete ✅

**Completed:** 2026-03-13
**Author:** Cherukara
**Version:** 1.0 — Phase 1 (World + Identity)

**Sections complete:**
- Executive Summary & Project Classification
- Six Ecological Domains (Organism System)
- Success Criteria & Measurable Outcomes
- Product Scope (MVP / Growth / Vision)
- Existing System Context (Shopify migration)
- User Journeys (4 personas)
- Key Architectural Decisions
- Domain-Specific Requirements
- Innovation & Novel Patterns
- Web Application Technical Requirements
- Functional Requirements (FR1–FR36)
- Non-Functional Requirements (NFR1–NFR19)

**Next step:** Invoke Architect agent → Architecture Document
