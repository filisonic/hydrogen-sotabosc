---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: ['_bmad-output/planning-artifacts/prd.md']
workflowType: 'architecture'
project_name: 'Sotabosc'
user_name: 'Cherukara'
date: '2026-03-13'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements (FR1–FR36):**
36 FRs organized across 8 capability areas:
- **World Experience** (FR1–7): Vertical scroll through 6 layers, anonymous mode, bidirectional scroll
- **Organism Identity** (FR8–15): Domain selection, procedural card generation, localStorage persistence, time-based evolution, domain-based layer personalisation
- **Content Discovery** (FR16–22): Artefact links per layer, CMS-managed, domain-specific content variations
- **Commerce Integration** (FR23–25): Shopify Storefront API, no payment handling on the Next.js app
- **Sound** (FR26–28): Per-layer ambient audio, off by default, user-mutable
- **Content Management** (FR29–31): Sanity Studio at `/studio`, fast content propagation
- **Organism Generator** (FR32–34): Procedurally varied output, portable JSON, Tezos FA2-compatible metadata
- **Analytics** (FR35–36): Privacy-first, aggregate only, no PII

**Non-Functional Requirements — Architectural Drivers:**
- FCP < 1.5s · LCP < 3s · 60fps scroll (performance-first approach required)
- localStorage as primary identity store with graceful private-browsing fallback
- No PII collection by default; GDPR-friendly by design
- `prefers-reduced-motion` respected throughout all scroll/animation components
- Artistic integrity constraints enforced at Sanity schema level (found-object language, no dark patterns)

**Scale & Complexity:**
- **Complexity level:** Medium-high (novel interaction patterns, multi-system integration, no backend in Phase 1)
- **Primary domain:** Full-stack web (Next.js SPA + headless commerce + headless CMS)
- **Estimated architectural components:** 8 major components

### Technical Constraints & Dependencies

| Constraint | Detail |
|---|---|
| Existing Shopify store at `sotabosc.world` | Next.js replaces the frontend; Shopify remains commerce backend via Storefront API |
| No backend in Phase 1 | Identity, personalisation, and state are fully client-side (localStorage) |
| DNS migration required | From Shopify-hosted DNS → Vercel; requires staging validation before switch |
| Sanity free tier | Content model must stay lean in Phase 1; avoid over-engineering CMS schema |
| Tezos compatibility | Organism JSON schema must match FA2 metadata format from day one |

### Cross-Cutting Concerns Identified

1. **Organism state** — crosses identity, personalisation, world rendering, and evolution mechanics
2. **Domain-based personalisation** — affects layer rendering, content queries, and sound selection
3. **Performance** — 60fps scroll + lazy loading must be architecturally enforced at every layer component
4. **Privacy** — no PII requirement touches analytics, email-save flow, and CMS content schema
5. **Artistic integrity** — enforced through Sanity schema design and code conventions, not just documentation

---

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack web application (headless Shopify commerce + creative scroll world)** — built within the existing Hydrogen project, deployed to Oxygen (Shopify's hosting) or Vercel.

### Decision: Use Existing Hydrogen Project (No New Starter Needed)

**Rationale:** The repository `hydrogen-sotabosc-new` is already a fully configured Hydrogen 2025.7.0 project. Shopify Storefront API integration is pre-wired via GraphQL codegen. Creating a new project would discard this infrastructure and require DNS migration to a new host.

| What's Already in Place | Detail |
|---|---|
| **Hydrogen 2025.7.0** | Latest release, Shopify's official React framework |
| **React Router v7** | Remix-based SSR routing, file system routes |
| **Framer Motion 12** | Already installed — primary animation library |
| **Tailwind v4** | Already configured via PostCSS |
| **Vite 6** | Build tooling |
| **TypeScript** | Strict mode |
| **Shopify Storefront API** | Native integration with GraphQL codegen |
| **GraphQL typed queries** | Auto-generated via `@shopify/hydrogen-codegen` |

**Packages to add post-baseline:**

```bash
npm install @sanity/client next-sanity howler plausible-tracker
```

**Note:** GSAP vs Framer Motion for the scroll world will be decided in architectural decisions — Framer Motion is already installed and has strong scroll primitives (`useScroll`, `motion` components).

### Architectural Decisions Provided by Existing Stack

| Area | Decision |
|---|---|
| **Language** | TypeScript (existing) |
| **Router/SSR** | React Router v7 / Hydrogen (existing) |
| **Styling** | Tailwind v4 + custom CSS (existing config) |
| **Build** | Vite 6 (existing) |
| **Commerce** | Shopify Storefront API via Hydrogen (existing) |
| **Animation** | Framer Motion 12 (existing, confirmed) |
| **Deployment** | Vercel (confirmed, see below) |

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Scroll animation engine chosen
- State management approach confirmed
- CMS integration decided
- Deployment target confirmed
- Authentication explicitly skipped

**Deferred Decisions (Phase 2):**
- Persistent storage backend (Supabase or equivalent)
- Tezos wallet integration
- Email milestone notifications

---

### Scroll Animation Architecture

| Layer | Library | Reason |
|---|---|---|
| Ecosystem scroll world (layer transitions, pinning, parallax) | **GSAP ScrollTrigger** | Industry standard for complex scroll-driven scenes; superior timeline control for 6 pinned layers |
| UI transitions (organism card entrance, modal animations, CTAs) | **Framer Motion 12** (existing) | React-native declarative syntax; already installed |

**Separation of concerns:** GSAP owns the vertical scroll world. Framer owns UI component transitions. No overlap — clean boundary.

**Install required:**
```bash
npm install gsap @gsap/react
```

---

### State Management

| Concern | Approach |
|---|---|
| Organism identity + card data | **Zustand** store with `persist` middleware → localStorage |
| Organism evolution (age calculation) | Computed from `createdAt` timestamp stored in Zustand; no server clock needed |
| Audio mute state | Zustand store (persisted) |
| Anonymous mode flag | Zustand store (session only) |

**Organism persistence strategy:**
- **Primary:** localStorage via Zustand `persist` middleware — automatic, zero config
- **Fallback (private browsing):** Detect `localStorage` unavailability → show "Copy your organism link" option, encoding organism UUID + data as a URL param (`?o=...`)
- **No Supabase, no email, no authentication in Phase 1**

**Purchases:** Shopify handles checkout, email collection, and customer accounts entirely. Sotabosc has zero involvement in the transaction flow.

**Web3 readiness:** The Zustand store organism schema (`uuid, domain, name, species, age, habitat, role, createdAt`) matches FA2 token metadata. Phase 2 minting reads directly from this store.

**Install required:**
```bash
npm install zustand
```

---

### CMS — Sanity Integration

- **Sanity Studio:** Hosted at `yourproject.sanity.studio` (Sanity's own hosting) — free, accessible from any device, zero deploy dependency
- **Client in app:** `@sanity/client` + `next-sanity` fetch layer — content fetched server-side in React Router loaders for SSR
- **Content propagation:** Sanity webhook → Vercel Deploy Hook → triggers rebuild on content publish (< 2 minutes to live)
- **Schema enforces artistic integrity:** Artefact link fields use `discoveryDescription` (not `productDescription`), `foundIn` (not `category`), neutralising catalogue language at the data source

**Install required:**
```bash
npm install @sanity/client
```

---

### Authentication & Data

| Decision | Choice | Rationale |
|---|---|---|
| Authentication | ❌ **None** — explicitly skipped | No forced sign-up is a core product principle |
| Database (Phase 1) | ❌ **None** — localStorage only | Organism data is client-side; Shopify holds all commerce data |
| Email collection | Shopify checkout only | Shopify captures email at purchase; no separate email system needed |
| Supabase | ❌ **Deferred to Phase 2** | Needed only if email-save organism feature is built |

---

### Infrastructure & Deployment

| Area | Decision |
|---|---|
| **Deployment target** | **Vercel** (Hobby tier, free) |
| **Domain** | `sotabosc.world` → Vercel (DNS update from current Shopify/Oxygen config) |
| **Existing shop routes** | Preserved in the same Hydrogen project (`/products/*`, `/collections/*`, etc.) |
| **Homepage** | Replaced by Sotabosc world (`/` route → scroll world) |
| **Sanity webhook** | Sanity → Vercel Deploy Hook → ISR rebuild |
| **Analytics** | Plausible (privacy-first, Cookie-free) |
| **Environment** | `.env` for `SHOPIFY_STOREFRONT_API_TOKEN`, `SANITY_PROJECT_ID`, `SANITY_DATASET` |

**No subdomain split needed.** The Sotabosc world replaces the hompage of the existing Hydrogen project. All existing `/products`, `/collections`, `/cart` routes remain intact and accessible — they are simply no longer the front door.

**Install required:**
```bash
npm install plausible-tracker howler
npm install @sanity/client
npm install gsap @gsap/react
npm install zustand
```

---

## Implementation Patterns & Consistency Rules

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `OrganismCard.tsx`, `ScrollLayer.tsx` |
| Custom hooks | camelCase, `use` prefix | `useOrganism.ts`, `useScrollLayer.ts` |
| Utilities | camelCase | `generateOrganismCard.ts`, `computeAge.ts` |
| Route files | kebab-case (Remix convention) | `app/routes/_index.tsx` |
| Sanity schemas | camelCase | `artefactLink.ts`, `ecosystemLayer.ts` |
| CSS custom properties | `--sotabosc-` prefix | `--sotabosc-sky-color`, `--sotabosc-card-age` |
| Zustand stores | camelCase fields | `createdAt`, `organismDomain`, `displayName` |

GraphQL / Shopify types: **always use generated types** from `storefrontapi.generated.d.ts` — never redefine manually.

---

### Organism Data Schema (binding — all agents must use this exact shape)

```typescript
type OrganismCard = {
  uuid: string;           // crypto.randomUUID()
  domain: 'animals' | 'plants' | 'fungi' | 'algae' | 'microbes' | 'earth';
  displayName: string;    // e.g. "Azure Fern"
  species: string;        // e.g. "Asplenium scolopendrium"
  habitat: string;        // e.g. "Mediterranean Understory"
  role: string;           // e.g. "Light Filter"
  createdAt: number;      // Date.now() — Unix ms timestamp
  // age is ALWAYS computed: (Date.now() - createdAt) / 86400000
  // never stored — always derived on render
}
```

---

### State Management Patterns

- All organism state → `useOrganismStore` (Zustand, persisted to localStorage)
- Audio state (muted/volume) → `useAudioStore` (Zustand, persisted)
- Active scroll layer / GSAP position → ephemeral local/ref state only, never persisted
- **Never** store organism data in component `useState` — always read from Zustand
- **Age is always computed**, never stored

---

### Scroll Architecture Patterns

| Owner | Responsibility |
|---|---|
| **GSAP ScrollTrigger** | Layer pinning, parallax, reveal animations, scroll-driven world |
| **Framer Motion** | UI component transitions (card entrance, domain selector, modals) |

- Never mix — GSAP for world, Framer for UI
- All GSAP instances **must** be cleaned up in `useEffect` return
- Always check `prefers-reduced-motion` before initialising GSAP timelines

---

### Error Handling Patterns

| Scenario | Pattern |
|---|---|
| Shopify API error | Caught in React Router loader — return `null`, show graceful "artefact not found" state |
| Sanity fetch error | Layer renders with no artefact links — never breaks the world |
| localStorage unavailable | Detected on first `useOrganismStore` hydration → show "Copy organism link" prompt |
| No raw `console.error` in production | Errors silent to user, logged to Vercel runtime only |

---

### All AI Agents MUST

1. Generate organism cards using `lib/organism/generator.ts` — never inline generation logic in components
2. Compute organism age from `createdAt` — never store or cache age
3. Use Sanity query functions from `lib/sanity/queries.ts` — never write inline GROQ in components
4. Use Shopify types from generated codegen files — never redefine product/cart types
5. Prefix CSS custom properties with `--sotabosc-`
6. Check `prefers-reduced-motion` before starting any GSAP timeline

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
hydrogen-sotabosc-new/
├── .env                             ← SHOPIFY_*, SANITY_*, PLAUSIBLE_*
├── .env.example
├── package.json
├── vite.config.js
├── react-router.config.js
├── tailwind.config.cjs
├── server.js
│
├── app/
│   ├── root.jsx                     ← Shell: HTML, global styles, Zustand providers
│   ├── routes.js
│   │
│   ├── routes/
│   │   ├── _index.tsx               ← 🌍 Sotabosc world (homepage — replaces storefront)
│   │   ├── products.$handle.tsx     ← Existing product pages (unchanged)
│   │   ├── collections.$handle.tsx  ← Existing collection pages (unchanged)
│   │   └── cart.tsx                 ← Existing cart (unchanged)
│   │
│   ├── components/
│   │   ├── world/                   ← Scroll world (GSAP ScrollTrigger)
│   │   │   ├── ScrollWorld.tsx          ← Main GSAP container, pins layers
│   │   │   ├── EcosystemLayer.tsx       ← Generic layer wrapper (receives domain prop)
│   │   │   ├── LayerSky.tsx             ← Animals domain layer
│   │   │   ├── LayerCanopy.tsx          ← Plants domain layer
│   │   │   ├── LayerUnderstory.tsx      ← Fungi domain layer
│   │   │   ├── LayerWater.tsx           ← Algae domain layer
│   │   │   ├── LayerSoil.tsx            ← Microbes domain layer
│   │   │   ├── LayerBedrock.tsx         ← Earth/Minerals domain layer
│   │   │   ├── ArtefactLink.tsx         ← Found-object discovery link component
│   │   │   └── SoundToggle.tsx          ← Ambient audio mute/unmute control
│   │   │
│   │   ├── organism/                ← Organism identity (Framer Motion)
│   │   │   ├── DomainSelector.tsx       ← "What are you?" — 6 domain picker
│   │   │   ├── OrganismCard.tsx         ← Card: name, species, age, role, habitat
│   │   │   ├── OrganismAge.tsx          ← Computed age display (reads createdAt only)
│   │   │   └── OrganismLink.tsx         ← Floating access point to organism card
│   │   │
│   │   └── ui/                      ← Generic reusable UI
│   │       ├── Button.tsx
│   │       └── Overlay.tsx
│   │
│   ├── lib/
│   │   ├── organism/
│   │   │   ├── generator.ts             ← Procedural generation (name, species, role, habitat)
│   │   │   ├── evolution.ts             ← Age computation + evolution stage thresholds
│   │   │   └── types.ts                 ← OrganismCard type — the binding schema
│   │   │
│   │   ├── store/
│   │   │   ├── useOrganismStore.ts      ← Zustand + persist middleware → localStorage
│   │   │   └── useAudioStore.ts         ← Mute state + volume, Zustand + persist
│   │   │
│   │   ├── sanity/
│   │   │   ├── client.ts                ← @sanity/client config
│   │   │   └── queries.ts               ← All GROQ queries live here exclusively
│   │   │
│   │   └── sound/
│   │       └── audioManager.ts          ← Howler.js wrapper, per-layer audio zones
│   │
│   ├── styles/
│   │   ├── global.css                   ← --sotabosc-* CSS custom properties + resets
│   │   ├── world.css                    ← Scroll world + layer styles
│   │   └── organism.css                 ← Card + domain selector styles
│   │
│   └── graphql/                     ← Existing Shopify GraphQL queries (unchanged)
│
├── _bmad-output/
│   └── planning-artifacts/
│       ├── prd.md
│       └── architecture.md
│
└── public/
    ├── sounds/                      ← Ambient audio files (6 layers × stereo MP3/OGG)
    └── assets/
```

### Architectural Boundaries

**Shopify boundary:** All Shopify data fetched in React Router **loaders** (server-side). Components receive typed props — no Shopify client calls from the browser.

**Sanity boundary:** All GROQ queries in `lib/sanity/queries.ts` only. Loaders call these functions. Components receive plain objects — never the Sanity client directly.

**GSAP boundary:** All GSAP/ScrollTrigger code lives inside `components/world/` only. Never used in organism or UI components.

**Zustand boundary:** Stores accessed only in client components. Server-side loaders never access Zustand stores.

### Data Flow

```text
Visitor opens sotabosc.world
  ↓
React Router loader (server-side)
  ├── Sanity: fetch all 6 layer content sets + artefact links
  └── Shopify: fetch any linked product data
  ↓
_index.tsx renders with layerData props
  ↓
ScrollWorld.tsx (GSAP) — initialised client-side after hydration
  ↓
useOrganismStore (Zustand/localStorage) — reads stored organism
  ├── Has organism → domain passed to EcosystemLayer for personalisation
  └── No organism → DomainSelector shown on entry
  ↓
ArtefactLink (Sanity data) → links to /products/* or external URL
  ↓
Purchase → Shopify native checkout (zero Sotabosc involvement)
```

### External Integration Points

| Service | How | Direction |
|---|---|---|
| Shopify Storefront API | React Router loaders, GraphQL (generated types) | Server → Shopify |
| Sanity | `lib/sanity/client.ts` in loaders | Server → Sanity |
| Sanity webhook | Sanity → Vercel Deploy Hook → ISR rebuild | Sanity → Vercel |
| Plausible Analytics | `plausible-tracker` loaded client-side | Browser → Plausible |
| Howler.js | `lib/sound/audioManager.ts`, client-side only | Local |
| Tezos (Phase 2) | Wallet connection, reads `useOrganismStore` | Browser → Tezos |

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**  
Hydrogen 2025.7.0 (with React Router v7), GSAP, Framer Motion, Zustand, and Sanity are completely compatible. Shopify Storefront API is exclusively accessed via server loaders, leaving the client bundle clean.

**Pattern Consistency:**  
Zustand handles all data persistence; GSAP handles all scroll; React Router handles all server-fetching. The separation of concerns is strictly maintained without overlap. Formats and naming conventions (`camelCase`, `--sotabosc-` prefix) enforce project-wide consistency.

**Structure Alignment:**  
The component folder structure (`world/`, `organism/`, `ui/`) directly reflects the animation library split and functional boundary decisions.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**  
MVP Phase 1 (Organism identity + scroll ecosystem) is entirely supported. Zero-login requirement satisfied by client-side local storage. Phase 2 Web3 integration is paved via matching Zustand schemas with Tezos FA2 expectations.

**Functional Requirements Coverage:**  
Ecological mechanics are supported by the procedural generator map and `computedAge` pattern. Privacy constraints are satisfied by omitting Supabase/Auth in Phase 1 and using Plausible analytics.

**Non-Functional Requirements Coverage:**  
Performance targets (60fps Scroll) are explicitly addressed by mandating GSAP boundaries and CSS custom properties. Artistic integrity is supported by strict Sanity schema definitions, neutralizing catalog vocabulary.

### Implementation Readiness Validation ✅

**Decision Completeness:**  
All specific package versions are locked in (e.g., Framer Motion 12, Vite 6, Hydrogen 2025.7.0). Deployment target (Vercel) is confirmed.
 
**Structure Completeness:**  
Project tree maps exactly where new features belong relative to the existing Hydrogen boilerplate.

**Pattern Completeness:**  
Organism data schema is strictly typed, binding, and clearly defined. Consistency definitions prevent AI agents from hallucinating redundant components.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** **READY FOR IMPLEMENTATION**

**Confidence Level:** High

**Key Strengths:**
- Leverages the existing Shopify Hydrogen integration perfectly without reinventing the wheel
- Zero server/database cost for Phase 1 (utilizes Vercel free tier + localStorage)
- Clean, enforceable separation between UI transitions (Framer) and scroll ecology (GSAP)

**Areas for Future Enhancement:**
- Supabase integration for persistent email-bound Organism saves
- Tezos wallet integration layer

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries (GSAP vs Framer, Loader vs Client)
- Refer to this document for all architectural questions
