---
stepsCompleted: []
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/epics.md', 'design-system/sotabosc/MASTER.md']
---

# Implementation Readiness Assessment Report

**Date:** 2026-03-13
**Project:** Sotabosc

## PRD Analysis

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

Total FRs: 36

### Non-Functional Requirements

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

Total NFRs: 19

### Additional Requirements

- **Starter Template:** Build directly inside the existing `hydrogen-sotabosc-new` Hydrogen 2025.7.0 codebase; existing routes (`/products`, `/collections`) must remain intact.
- **Architectural Boundaries:** All Shopify data fetched in React Router server loaders. Sanity queries strictly in `lib/sanity/queries.ts`. GSAP restricted to `components/world/`.
- **Deployment & Infrastructure:** Deploy to Vercel (Hobby tier acceptable for Phase 1), with `sotabosc.world` DNS pointing to Vercel to replace the existing Shopify storefront. Sanity webhooks trigger Vercel rebuilds.
- **UX Rules:** Biomimetic palette, Lora/Raleway typography, no emojis for UI icons, smooth 150-300ms transitions, maintain 4.5:1 text contrast minimum, visible focus states required.

### PRD Completeness Assessment

The PRD is comprehensive, with 36 clearly defined FRs and 19 NFRs that cover the core application loops (Generation, Persistence, Interaction). Critical technical constraints, architectural boundaries (Hydrogen over Next.js), and UX decisions have all been correctly elevated from the brainstorming and planning phases. The PRD is fully ready for Epic Coverage Validation.

## Epic Coverage Validation

### Coverage Matrix

| FR Number | PRD Requirement | Epic Coverage | Status |
| :--- | :--- | :--- | :--- |
| FR1 | Visitor can enter Sotabosc without any account, registration, or personal data submission | Epic 1 | ✓ Covered |
| FR2 | Visitor can scroll vertically through all six ecosystem layers... | Epic 1 | ✓ Covered |
| FR3 | Visitor can skip organism selection and explore the world in anonymous mode | Epic 1 | ✓ Covered |
| FR4 | Visitor in anonymous mode can access organism selection from within the world... | Epic 2 | ✓ Covered |
| FR5 | Visitor can scroll back up through previously visited layers | Epic 1 | ✓ Covered |
| FR6 | The world presents each ecosystem layer with distinct visual, sonic, and content character | Epic 1 | ✓ Covered |
| FR7 | Ambient sound adjusts based on the current ecosystem layer visible on screen | Epic 1 | ✓ Covered |
| FR8 | Visitor can select one of six organism domains... | Epic 2 | ✓ Covered |
| FR9 | System generates a unique organism card for the selected domain... | Epic 2 | ✓ Covered |
| FR10 | Visitor's organism identity and card data persist across browser sessions... | Epic 2 | ✓ Covered |
| FR11 | Visitor can optionally provide an email address to save their organism externally | Epic 2 | ✓ Covered |
| FR12 | Visitor can view their organism card and current age at any point... | Epic 2 | ✓ Covered |
| FR13 | Organism age advances based on real elapsed calendar time since creation | Epic 2 | ✓ Covered |
| FR14 | Organism card reflects visible changes when the visitor returns... | Epic 2 | ✓ Covered |
| FR15 | Visitor's active organism domain influences which ecosystem layer is foregrounded... | Epic 2 | ✓ Covered |
| FR16 | Each ecosystem layer surfaces contextual artefact links relevant to that layer's domain | Epic 3 | ✓ Covered |
| FR17 | Artefact links appear as discovered found objects, not as catalogue or shop items | Epic 3 | ✓ Covered |
| FR18 | Content manager can add, edit, and remove artefact links per layer... | Epic 3 | ✓ Covered |
| FR19 | Artefact links can point to internal Shopify product/collection pages or external URL | Epic 4 | ✓ Covered |
| FR20 | Visitor can follow an artefact link to its destination page | Epic 4 | ✓ Covered |
| FR21 | Content visible in each layer varies subtly based on visitor's organism domain | Epic 3 | ✓ Covered |
| FR22 | Content manager can associate specific artefact links with specific organism domains | Epic 3 | ✓ Covered |
| FR23 | Products from the existing Shopify store are accessible via artefact links... | Epic 4 | ✓ Covered |
| FR24 | All purchase transactions occur within the existing Shopify store... | Epic 4 | ✓ Covered |
| FR25 | Product presentation inside the world uses found-object language... | Epic 4 | ✓ Covered |
| FR26 | Visitor can mute or unmute ambient sound at any time via a visible control | Epic 1 | ✓ Covered |
| FR27 | Ambient sound is off by default on first visit; visitor must explicitly enable it | Epic 1 | ✓ Covered |
| FR28 | When enabled, ambient sound plays at a very low default volume | Epic 1 | ✓ Covered |
| FR29 | Content manager can access the CMS studio from within the Sotabosc domain | Epic 3 | ✓ Covered |
| FR30 | Content manager can create, update, and delete layer content... | Epic 3 | ✓ Covered |
| FR31 | Content changes in the CMS propagate to the live world within a short time... | Epic 3 | ✓ Covered |
| FR32 | Organism name generator produces sufficient variation... | Epic 2 | ✓ Covered |
| FR33 | Generated organism data is stored as portable JSON... | Epic 2 | ✓ Covered |
| FR34 | Organism data includes: domain, name, species, age, habitat, role, created-date | Epic 2 | ✓ Covered |
| FR35 | Site owner can view aggregate visitor counts, organism selection rates... | Epic 1 | ✓ Covered |
| FR36 | Analytics system collects no personally identifiable information and uses no tracking cookies | Epic 1 | ✓ Covered |

### Missing Requirements

*(None. All 36 Functional Requirements are explicitly mapped to and covered by the 4 Epics.)*

### Coverage Statistics

- Total PRD FRs: 36
- FRs covered in epics: 36
- Coverage percentage: 100%

## UX Alignment Assessment

### UX Document Status

**FOUND** (`design-system/sotabosc/MASTER.md`).

> [!NOTE]
> The project has a comprehensive Design System Master file specifying biomimetic color palettes (`#0891B2`, `#22C55E`), typography (Lora/Raleway), spacing tokens, and component specifications.

### Alignment Issues

None identified. The design system's "Biomimetic / Organic 2.0" style perfectly aligns with the PRD's vision and the Architecture's implementation patterns.

### Warnings

*None.* The UX foundation is solid and ready for implementation.

## Epic Quality Review

### Best Practices Compliance Checklist

- [x] Epics deliver clear user value (Goal: Outcome-focused)
- [x] Epic independence maintained (Sequence: 1 → 2 → 3 → 4)
- [x] Stories appropriately sized for iterative delivery
- [x] No forward dependencies identified
- [x] Data schema / CMS structure defined just-in-time
- [x] Acceptance Criteria follow testable BDD (Given/When/Then) format
- [x] Traceability to 36 FRs and 19 NFRs confirmed

### Quality Findings

#### 🔴 Critical Violations
*None.*

#### 🟠 Major Issues
*None.*

#### 🟡 Minor Concerns
- **Duplicated Documentation:** In the `epics.md` file, Stories 4.1 (Artefact Routing) and 4.2 (Found-Object Presentation Enforcement) are duplicated at the end of the document. 
- **Recommendation:** Prune the redundant section in `epics.md` for better clarity, though it does not impact implementation logic.

## Summary and Recommendations

### Overall Readiness Status: READY 🟢

The Sotabosc project is in a high state of readiness. The transition from brainstorming to structured planning artifacts (PRD, Architecture, Design System, Epics) has been completed with exceptional coherence and traceability.

### Critical Issues Requiring Immediate Action

*None.* All prerequisites for starting development on Epic 1 are satisfied.

### Recommended Next Steps

1. **Prune redundany:** Remove the duplicate Epic 4 stories from `epics.md` (Lines 370-397) to avoid confusion during ticket creation.
2. **Environment Setup:** Ensure `.env` variables for Shopify Storefront API and Sanity Project ID are configured in the development environment.
3. **Sprint 1 Kickoff:** Proceed to implement **Epic 1: World Foundation & Atmosphere**, starting with the routing shell and the GSAP scroll architecture.

### Final Note

This assessment identified 0 critical issues and 1 minor documentation concern across 4 categories. The artifacts are highly professional, technically sound, and provide a clear roadmap for the implementation phase.

**Assessor:** Antigravity (PM/Architect Agent)  
**Date:** 2026-03-13


