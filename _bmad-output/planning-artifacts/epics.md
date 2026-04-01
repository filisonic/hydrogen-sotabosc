---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/architecture.md', 'design-system/sotabosc/MASTER.md']
---

# Sotabosc - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Sotabosc, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Visitor can enter Sotabosc without any account, registration, or personal data submission
FR2: Visitor can scroll vertically through all six ecosystem layers (Sky → Canopy → Understory → Water → Soil → Bedrock)
FR3: Visitor can skip organism selection and explore the world in anonymous mode
FR4: Visitor in anonymous mode can access organism selection from within the world at any point
FR5: Visitor can scroll back up through previously visited layers
FR6: The world presents each ecosystem layer with distinct visual, sonic, and content character
FR7: Ambient sound adjusts based on the current ecosystem layer visible on screen
FR8: Visitor can select one of six organism domains (Animals, Plants, Fungi, Algae, Microbes, Earth/Minerals)
FR9: System generates a unique organism card for the selected domain (name, species, starting age, habitat, role)
FR10: Visitor's organism identity and card data persist across browser sessions without requiring a login
FR11: Visitor can optionally provide an email address to save their organism externally
FR12: Visitor can view their organism card and current age at any point during their visit
FR13: Organism age advances based on real elapsed calendar time since creation
FR14: Organism card reflects visible changes when the visitor returns after a significant elapsed time
FR15: Visitor's active organism domain influences which ecosystem layer is foregrounded on their visit
FR16: Each ecosystem layer surfaces contextual artefact links relevant to that layer's domain
FR17: Artefact links appear as discovered found objects, not as catalogue or shop items
FR18: Content manager can add, edit, and remove artefact links per layer without code changes (via CMS)
FR19: Artefact links can point to internal Shopify product/collection pages or any external URL
FR20: Visitor can follow an artefact link to its destination page
FR21: Content visible in each layer varies subtly based on visitor's organism domain
FR22: Content manager can associate specific artefact links with specific organism domains
FR23: Products from the existing Shopify store are accessible via artefact links within the world
FR24: All purchase transactions occur within the existing Shopify store — Sotabosc does not handle payments
FR25: Product presentation inside the world uses found-object language, not catalogue language
FR26: Visitor can mute or unmute ambient sound at any time via a visible control
FR27: Ambient sound is off by default on first visit; visitor must explicitly enable it
FR28: When enabled, ambient sound plays at a very low default volume
FR29: Content manager can access the CMS studio from within the Sotabosc domain
FR30: Content manager can create, update, and delete layer content (artefact links, layer descriptions, event links)
FR31: Content changes in the CMS propagate to the live world within a short time (minutes, not hours)
FR32: Organism name generator produces sufficient variation that two same-domain visitors are unlikely to receive identical cards
FR33: Generated organism data is stored as portable JSON (compatible with future Web3/Tezos identity upgrade)
FR34: Organism data includes: domain, name, species, age, habitat, role, created-date
FR35: Site owner can view aggregate visitor counts, organism selection rates, and layer engagement metrics
FR36: Analytics system collects no personally identifiable information and uses no tracking cookies

### NonFunctional Requirements

NFR1: First Contentful Paint (FCP) < 1.5 seconds on a 4G mobile connection
NFR2: Largest Contentful Paint (LCP) < 3 seconds
NFR3: Scroll animations maintain ≥ 60fps on mid-range devices (2020 Mac, mid-range Android)
NFR4: Initial JavaScript bundle < 500kb (gzipped); layers are code-split and lazy-loaded
NFR5: All images and SVGs are lazy-loaded per visible layer; delivered in WebP or AVIF format
NFR6: Organism state must survive normal browser session ends (tab close, navigate away) and be fully restored on return
NFR7: If localStorage is unavailable (private browsing), the system must detect this gracefully and prompt the email-save option without crashing
NFR8: CMS content updates must not cause downtime — Vercel ISR (Incremental Static Regeneration) or webhook-triggered rebuild is the acceptable pattern
NFR9: No personally identifiable information is collected by default — organism data is exclusively client-side in Phase 1
NFR10: Email addresses collected for organism-save purposes are stored securely and used only for organism milestone notifications
NFR11: No third-party ad networks or tracking scripts are loaded on any page
NFR12: Analytics data is anonymised and aggregate only
NFR13: Organism selection flow meets WCAG 2.1 AA minimum contrast and keyboard navigation requirements
NFR14: All scroll animations and parallax effects respect the `prefers-reduced-motion` CSS media query
NFR15: Sound is never required to navigate, understand content, or complete any interaction
NFR16: Mute toggle is always visible and keyboard-accessible
NFR17: No dark UX patterns — no countdown timers, urgency cues, "only X left" messaging, or forced pop-ups
NFR18: Product/artefact copy must use found-object language — the Sanity content schema enforces a description field framed as discovery, not sale
NFR19: The world must feel complete and functional on mobile — not a degraded version of the desktop experience

### Additional Requirements

- **Starter Template:** We are building directly inside the existing `hydrogen-sotabosc-new` Hydrogen 2025.7.0 codebase rather than starting a greenfield Next.js app. The existing routes (`/products`, `/collections`) must remain intact.
- **Architectural Boundaries:** All Shopify data must be fetched in React Router server loaders. Sanity queries strictly in `lib/sanity/queries.ts`. GSAP restricted to `components/world/`.
- **Deployment & Infrastructure:** The project must be deployed to Vercel (Hobby tier acceptable for Phase 1), with `sotabosc.world` DNS pointing to Vercel to replace the existing Shopify storefront frontend. Sanity webhooks will trigger Vercel rebuilds for content updates.
- **UX - Colors:** Biomimetic palette. Primary `#0891B2`, Secondary `#22D3EE`, CTA `#22C55E`, Background `#ECFEFF`, Text `#164E63`.
- **UX - Typography:** Lora for Headings, Raleway for Body.
- **UX - Page Pattern:** Scroll-Triggered Storytelling. Progression through layers with CTA placement at natural climaxes.
- **UX - Anti-patterns (Strict):** No emojis for UI icons (use Heroicons/Lucide SVG). All clickable elements require `cursor-pointer`. Hover states must have smooth transitions (150-300ms) and not cause layout shifts. Maintain 4.5:1 text contrast minimum. Focus states must be visible.

### FR Coverage Map

FR1: Epic 1 - Anonymous world entry
FR2: Epic 1 - Vertical scroll through 6 layers
FR3: Epic 1 - Skip organism selection
FR4: Epic 2 - Access organism selection mid-exploration
FR5: Epic 1 - Bi-directional scrolling
FR6: Epic 1 - Distinct visual/content character per layer
FR7: Epic 1 - Layer-specific ambient sound
FR8: Epic 2 - Select from 6 organism domains
FR9: Epic 2 - Generate unique organism card
FR10: Epic 2 - localStorage persistence of organism
FR11: Epic 2 - Optional email save
FR12: Epic 2 - View organism card and computed age
FR13: Epic 2 - Age advances via elapsed time
FR14: Epic 2 - Visible evolution over time
FR15: Epic 2 - Active domain foregrounds specific layer
FR16: Epic 3 - Surface contextual artefact links
FR17: Epic 3 - "Found object" presentation style
FR18: Epic 3 - CMS management of links
FR19: Epic 4 - Links route to Shopify or external URLs
FR20: Epic 4 - Follow artefact link
FR21: Epic 3 - Subtle content variation by visitor domain
FR22: Epic 3 - CMS association of links to domains
FR23: Epic 4 - Shopify products accessible via artefacts
FR24: Epic 4 - Transactions strictly on Shopify backend
FR25: Epic 4 - Enforce discovery copy over catalogue copy
FR26: Epic 1 - Mute/unmute toggle
FR27: Epic 1 - Sound off by default
FR28: Epic 1 - Very low default volume
FR29: Epic 3 - CMS access from domain
FR30: Epic 3 - Create/update/delete CMS content
FR31: Epic 3 - Fast CMS propagation (ISR/webhook)
FR32: Epic 2 - High variation in organism names
FR33: Epic 2 - Portable JSON storage
FR34: Epic 2 - Standardized schema payload
FR35: Epic 1 - Aggregate analytics visibility
FR36: Epic 1 - No PII / privacy-first analytics

## Epic List

### Epic 1: World Foundation & Atmosphere
**User Outcome:** Visitors can enter the Sotabosc URL, scroll smoothly through the six distinct ecosystem layers, listen to generative ambient audio, and explore the environment anonymously without friction.
**FRs covered:** FR1, FR2, FR3, FR5, FR6, FR7, FR26, FR27, FR28, FR35, FR36

### Story 1.1: World Shell & Routing Setup

As a visitor,
I want to land on the Sotabosc world instead of a traditional home page,
So that I immediately enter the ecological experience without friction.

**Acceptance Criteria:**

**Given** a visitor navigates to the root URL (`/`)
**When** the page loads
**Then** the React Router `_index.tsx` renders the Sotabosc shell instead of the Shopify storefront home page
**And** no login, cookie banner, or personal data request is presented
**And** existing `/products` and `/collections` routes remain functional

### Story 1.2: Vertical Ecosystem Scroll Architecture

As a visitor,
I want to scroll continuously through six visually distinct layers,
So that I experience the depth of the ecosystem (Sky down to Bedrock).

**Acceptance Criteria:**

**Given** the visitor is in the Sotabosc world
**When** they scroll down or up
**Then** GSAP ScrollTrigger seamlessly pins and transitions between 6 distinct layer components
**And** scroll performance remains ≥ 60fps on mid-range mobile devices
**And** `prefers-reduced-motion` CSS queries disable heavy parallax/GLSL effects gracefully

### Story 1.3: Anonymous Exploration Mode

As a wanderer,
I want to bypass organism selection and just explore the layers,
So that I can experience the world before committing to an identity.

**Acceptance Criteria:**

**Given** the organism selection screen is active
**When** the user clicks "Skip and explore"
**Then** the GSAP scroll world unlocks with neutral layer states (no specific domain highlighted)
**And** an "Identify yourself" CTA remains accessible somewhere in the UI

### Story 1.4: Ambient Audio Engine

As a visitor,
I want to hear subtle nature sounds that change as I descend,
So that the physical depth of the world is reinforced sonically.

**Acceptance Criteria:**

**Given** the visitor is scrolling the world
**When** they cross the threshold from one layer to another (e.g., Canopy to Understory)
**Then** Howler.js crossfades the ambient audio tracks smoothly
**And** the audio defaults to OFF/Muted upon first entry
**And** a globally accessible, keyboard-navigable sound toggle allows muting/unmuting at any time

### Story 1.5: Privacy-First Analytics Setup

As the site owner,
I want to track aggregate layer engagement,
So that I know how deep visitors scroll without invading their privacy.

**Acceptance Criteria:**

**Given** a visitor is exploring the world
**When** they reach a specific ecosystem layer
**Then** Plausible analytics logs an anonymous pageview/event
**And** absolutely no PII or tracking cookies are stored on the visitor's device

### Epic 2: Organism Engine & Identity
**User Outcome:** Visitors can choose an ecological domain, receive a uniquely generated organism card that persists across sessions, and watch it age in real-time without needing a user account.
**FRs covered:** FR4, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR32, FR33, FR34

### Story 2.1: Domain Selection Interface

As a visitor,
I want to choose from six ecological domains (Sky to Bedrock),
So that I can determine my starting point and identity in the ecosystem.

**Acceptance Criteria:**

**Given** a visitor clicks "Enter the forest" on the landing page
**When** the selection interface appears
**Then** all 6 domains (Animals, Plants, Fungi, Algae, Microbes, Earth/Minerals) are presented clearly
**And** the interface is fully keyboard accessible (WCAG 2.1 AA)
**And** following selection, the visitor is transitioned into the world

### Story 2.2: Procedural Organism Generation

As a visitor,
I want the system to assign me a unique organism based on my chosen domain,
So that my experience in the world is personalised and distinct.

**Acceptance Criteria:**

**Given** a visitor has selected a domain
**When** the generation function runs
**Then** a portable JSON payload is created containing: domain, procedurally generated name, species, age (0 days), habitat, role, and created-date
**And** the procedural name generator uses enough variation that identical names within a domain are highly statistically unlikely

### Story 2.3: Zero-Login State Persistence

As a returning visitor,
I want the world to remember my organism automatically,
So that I don't have to create an account or log in.

**Acceptance Criteria:**

**Given** a visitor has generated an organism
**When** they close the browser tab and return days later
**Then** Zustand automatically rehydrates the organism state from `localStorage`
**And** if `localStorage` is blocked (e.g. strict private browsing), the app handles it gracefully without crashing

### Story 2.4: Real-Time Biological Aging

As a returning visitor,
I want my organism to age based on calendar time,
So that the world feels alive and responsive to natural time, not just active usage.

**Acceptance Criteria:**

**Given** a visitor has an existing organism saved in local state
**When** they view their organism card
**Then** the displayed "Age" is dynamically calculated based on the difference between the current date and the `created-date` in the JSON payload
**And** the age visibly increments by 1 unit for every 1 calendar day elapsed
**And** the component visibly reflects changes (e.g., age text updating) without requiring a backend database

### Story 2.5: Identity-Driven Layer Foregrounding

As an identified visitor,
I want the world to react to my specific organism type,
So that my layer (e.g., Fungi in the Understory) feels like my primary habitat.

**Acceptance Criteria:**

**Given** a visitor has an active organism
**When** they explore the ecosystem
**Then** their domain's corresponding vertical layer receives visual emphasis (e.g. starts fully expanded, triggers a specific ambient sound layer, or scrolls there first)

### Story 2.6: Optional Email Persistence ("Copy your DNA")

As a private-browsing visitor,
I want a fallback way to save my organism,
So I don't lose it if my local storage is cleared.

**Acceptance Criteria:**

**Given** a visitor has a generated organism
**When** they view their organism card settings
**Then** they have the option to securely email themselves a restoration link
**And** clicking that emailed link securely restores the organism JSON payload to `localStorage` on any device

### Epic 3: Ecosystem CMS & Personalisation
**User Outcome:** The creator can easily add "found object" artefacts (events, drawings, writing) to specific layers via Sanity Studio, and visitors see subtly different content depending on their organism type.
**FRs covered:** FR16, FR17, FR18, FR21, FR22, FR29, FR30, FR31

### Story 3.1: Sanity Studio Setup & Schema

As the creator,
I want a CMS interface tailored to the ecosystem's structure,
So that I can easily draft and publish content without touching code.

**Acceptance Criteria:**

**Given** the creator accesses the Studio route (`/studio`)
**When** they log in
**Then** they see a clear content schema organized by the 6 Ecosystem Layers (Sky, Canopy, Understory, Water, Soil, Bedrock)
**And** the schema enforces a "found object" presentation (e.g., fields for 'Discovery Description' rather than 'Product Copy')

### Story 3.2: Contextual Artefact Management

As the creator,
I want to add links, events, and drawings to specific layers,
So that visitors can discover my work contextually within the world.

**Acceptance Criteria:**

**Given** the creator is in the Sanity Studio
**When** they create a new Artefact
**Then** they can assign it to a specific layer
**And** they can provide an internal path (e.g. `/products/mycelial-drift`) or an external URL (e.g. a workshop registration link)
**And** changes publish successfully to the Sanity dataset

### Story 3.3: Static Content Revalidation (Webhook)

As a visitor,
I want to see the latest discoveries in the ecosystem,
So that the world always feels current.

**Acceptance Criteria:**

**Given** the creator publishes a new artefact in Sanity
**When** the Sanity webhook fires
**Then** Vercel triggers Incremental Static Regeneration (ISR)
**And** the live Sotabosc world updates to show the new artefact within minutes, without requiring a manual redeploy

### Story 3.4: Visitor-Specific Content Variation

As an identified visitor,
I want to see content that resonates with my specific organism,
So that the world feels genuinely responsive to my presence.

**Acceptance Criteria:**

**Given** a visitor exploring the world has an active organism domain (e.g. Fungi)
**When** they view a layer
**Then** Sanity queries fetch and prioritize artefacts tagged for that specific domain
**And** the UI subtly emphasizes these specific artefacts (e.g., bringing them to the foreground of the parallax scroll or highlighting them)

### Epic 4: Commerce Bridge
**User Outcome:** Visitors can click on discovered artefacts within the world and seamlessly transition to the existing Shopify storefront to purchase items or book workshops, without breaking the poetic immersion.
**FRs covered:** FR19, FR20, FR23, FR24, FR25

### Story 4.1: Artefact Routing (Internal & External)

As a visitor,
I want to follow a discovered artefact link,
So that I can view or purchase the item in the Shopify store or register for an event.

**Acceptance Criteria:**

**Given** the visitor clicks an artefact link in the world
**When** the link resolves
**Then** internal paths (e.g., `/products/...`) route smoothly via React Router to the existing Shopify templates
**And** external paths open in a new tab securely (`target="_blank" rel="noopener noreferrer"`)
**And** the transition from the "world" into the "store" is visually indicated (so the visitor knows they have left the ecosystem)

### Story 4.2: Found-Object Presentation Enforcement

As a visitor,
I want the descriptions of items inside the world to feel like discoveries,
So that I am not abruptly pulled out of the experience by sales language.

**Acceptance Criteria:**

**Given** a visitor clicks on an artefact in the ecosystem layer
**When** the preview or link is displayed
**Then** the UI renders the custom Sanity "Discovery Description"
**And** standard Shopify pricing/add-to-cart buttons are NOT visible until the user explicitly clicks through to the actual product page
**And** no urgency cues (e.g., "Only 1 left!") are displayed within the Sotabosc scroll world

### Story 4.1: Artefact Routing (Internal & External)

As a visitor,
I want to follow a discovered artefact link,
So that I can view or purchase the item in the Shopify store or register for an event.

**Acceptance Criteria:**

**Given** the visitor clicks an artefact link in the world
**When** the link resolves
**Then** internal paths (e.g., `/products/...`) route smoothly via React Router to the existing Shopify templates
**And** external paths open in a new tab securely (`target="_blank" rel="noopener noreferrer"`)
**And** the transition from the "world" into the "store" is visually indicated (so the visitor knows they have left the ecosystem)

### Story 4.2: Found-Object Presentation Enforcement

As a visitor,
I want the descriptions of items inside the world to feel like discoveries,
So that I am not abruptly pulled out of the experience by sales language.

**Acceptance Criteria:**

**Given** a visitor clicks on an artefact in the ecosystem layer
**When** the preview or link is displayed
**Then** the UI renders the custom Sanity "Discovery Description"
**And** standard Shopify pricing/add-to-cart buttons are NOT visible until the user explicitly clicks through to the actual product page
**And** no urgency cues (e.g., "Only 1 left!") are displayed within the Sotabosc scroll world
