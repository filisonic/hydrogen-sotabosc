# Brand Context: Sotabosc
*Generated: April 2, 2026 | Focus: Full brand — Barcelona directory, solarpunk world layer, artefacts, and integrated store*

---

## Brand Overview

Sotabosc is pivoting from a **personal drawings / portfolio storefront** to a **Barcelona-first cultural directory** wrapped in a **solarpunk, nature-led** experience: a curated map of galleries, workshops, retreats, events, communities, shops, and cafés. Users engage through a **chosen artefact** tied to one of **six ecological domains**; **activity and support** (visits, saves, purchases, community actions — exact mechanics **TBD**) **grow** that artefact, which in turn reinforces discovery of **listed venues** and an **artist-forward store** (including the founder’s own work). Hydrogen/Shopify powers commerce; seed data and UI tokens in-repo align with “city + world” positioning ([`.stitch/DESIGN.md`](../.stitch/DESIGN.md)).

---

## Brand Story & Origin

**From the product direction (not independently verified on a public site):** The brand originates in the founder’s creative practice (drawings, art) and is **expanding into a civic-cultural layer** — using Barcelona as the first “city skin” under a **solarpunk** narrative (hopeful futures, ecology-as-metaphor, organic technology). There is **no canonical public URL** in the repo README yet; treat timeline, founding myth, and prior brand assets as **to be supplied** for marketing copy.

**Inferred maturity:** Early / pre-launch or soft-launch product — high narrative clarity in design docs, **market and SEO presence not yet established** at brand level.

---

## Product Catalog

Reframed as **surfaces** (not only SKUs):

| Surface | Role | Notes |
|--------|------|--------|
| **City directory** | Searchable listings by place type, domain tint, events | Seed categories include galleries, workshops, retreats, coworking, venues, food, shops ([`app/lib/directory/domains.ts`](../app/lib/directory/domains.ts)) |
| **Scrollable “world” home** | Emotional entry, specimen/organism metaphor | Solarpunk, domain-themed CSS variables on `WorldShell` |
| **Artefact / organism** | User-selected persistent object that **grows with activity** | Six **domain** categories in code (see below); growth rules **TBD** |
| **Store** | Shopify-backed commerce | Artists who want listing + founder’s drawings; ties directory ↔ commerce **TBD** (bundles, featured artists, revenue share) |
| **Support / “activity”** | Drives artefact growth + promotion of venues | Could be purchases, check-ins, reviews, shares — **specify for messaging** |

**Six artefact domains (confirmed in codebase):** `plants`, `algae`, `fungi`, `microbes`, `animals`, `earth` — each with label, emoji, color, and short metaphorical description (e.g. fungi = “hidden networks, fermentation, underground culture”).

| “Product” (domain) | Key differentiator (in-app framing) | Audience signal |
|--------------------|-------------------------------------|-----------------|
| Plants | Rooted growth, gardens, green spaces | Nature-forward, slow culture |
| Algae | Flow, water, coastal rhythms | Coastal / fluid / retreat-adjacent |
| Fungi | Networks, fermentation, underground culture | Workshops, subcultures, coworking |
| Microbes | Invisible forces, biotech, fermentation science | Experimental, tech-adjacent |
| Animals | Movement, instinct, herds | Events, music, social energy |
| Earth | Foundation, minerals, grounding | Food, coffee, shops, grounding practices |

**Hero “product” (strategic):** The **combined loop** — directory discovery → emotional investment in an artefact → repeat visits and **support** that benefits **listed places and the store** — is the differentiated bundle; no single SKU is the hero.

---

## What Makes Them Different

1. **Solarpunk wrapper on a real city** — Not generic “events app”; **Barcelona as first canvas** with **ecological metaphor** and premium, minimal UI (accent greens, organic domains) per design system.
2. **Artefact growth as loyalty** — Gamified or ritualized **progress** tied to **real-world cultural participation** (directionally unique vs. flat listings).
3. **Directory + creator economy** — Bridges **physical culture** (galleries, workshops, cafés) with **art sales** and **artist listing** in one brand universe.
4. **Curation stance** — Seed data and category blurbs suggest **editorial** workshop/retreat copy vs. scrape-everything aggregators.

**Quote-style paraphrase (from design doc):** *Nature-led city directory + scrollable world; solarpunk, organic, premium clarity.*

---

## Competitor Landscape

Barcelona residents and visitors already use **municipal agendas**, **media guides**, **apps**, and **Google/Maps** for discovery. Sotabosc competes for **attention and habit**, not necessarily for raw event count.

| Competitor / analogue | Their positioning | How Sotabosc differs |
|----------------------|-------------------|----------------------|
| **GuiaBCN** (Ajuntament) | Official agenda, thousands of activities, filters by district, price, type | Authoritative but **institutional**; weak on solarpunk narrative, **artefact loyalty**, indie shop tie-in |
| **Betevé agenda** | Local media, curated “what to do,” newsletter | Editorial but **broadcast** model; not a user-owned growth artefact or unified store |
| **Time Out Barcelona** | Global lifestyle brand, restaurants + culture + hotels | Broad **tourist + mass** audience; not ecology-metaphor or artist-listed commerce |
| **Barcelona Navigator / irBarcelona** | Events, festivals, exhibitions calendars | **SEO/listicle** discovery; limited interactive identity layer |
| **Hoy Barcelona** (app) | Province leisure agenda, discounts | **Transaction/offers** framing vs. community-ecology story |
| **Articket / museum-focused sites** | Museum passes + exhibition intel | **Museum-heavy**; less on small galleries, workshops, coworking, cafés as one ecosystem |
| **Coworking / space listicles** (e.g. Nomad Cowork, Barcelona Life) | Rankings, nomad audience | **Workspace-first**; not full cultural directory + art store |
| **Google Maps / Instagram** | Default discovery | **No narrative**, no artefact, no curated solarpunk frame |

---

## The Alternative Solution

**Before Sotabosc (customer behaviors):**

- **Tourist / newcomer:** Time Out, official guides, hotel concierges, Google, TikTok recs — **fragmented**, often **promotional**, little **personal stake**.
- **Local culture-seeker:** Municipal agenda + WhatsApp groups + venue newsletters — **high effort**, easy to miss **small galleries and workshops**.
- **Artist / small venue:** Rely on **social algorithms**, walk-ins, and **generic** e-commerce (Shopify alone) without a **city story** that drives **repeat intentional traffic**.

Sotabosc’s “old way” to replace: **passive scrolling and disconnected tabs** between “what’s on,” “where to go,” and “who to buy from.”

---

## Core Audience(s)

**Primary:** Culture-motivated **Barcelona locals and regular visitors** who want **discovery with identity** — people drawn to **art, workshops, third places, and ethical/slow culture**, and who respond to **hopeful ecological aesthetics** (solarpunk) more than corporate nightlife marketing.

**Secondary:**

- **Small venues and organizers** needing **distribution** without building their own app.
- **Independent artists** who want **listing + sales** adjacent to **physical culture** (not only Instagram Shop).
- **Digital nomads / creatives** already using coworking and event lists — cross-over if workshop and gallery depth is strong.

**Key signals:** Pain = **noise vs. curation**, **trust** (who curates?), **desire for meaning** (artefact growth), **support local** without **preachy** tone.

---

## Brand Voice & Tone

**Adjectives (inferred):** Confident, minimal, **premium clarity**, **warm-organic**, **solarpunk-optimistic** (future-forward but grounded), domain-colored accents without clutter.

**Patterns:** Short display headings; uppercase tracking on micro-labels; restrained shadows; **nature metaphors** for categories (not clinical SaaS).

**Example directions (not final copy):** “Grow your patch of the city.” “Choose your lineage — plants, fungi, tide.” “Support the room where the work hangs.”

**Avoid:** Pure **doomer** eco-messaging; **greenwashing** without substance; **bro tourism** energy; **dense** institutional bureaucratese.

---

## Creative Constraints

| Constraint | Type | Notes |
|------------|------|--------|
| No verified live brand site for fact-checking | Inferred | Claims about “official” brand history need founder sign-off |
| Solarpunk can read **niche** or **political** | Inferred | Test mainstream vs. subculture framing in ads |
| **Gamification / growth** may trigger **platform policies** if tied to purchases or engagement bait | Inferred | Align mechanics with Meta/TikTok **community and commerce** guidelines |
| **Barcelona-only** limits scale messaging | Confirmed (direction) | Future cities = narrative “expansion,” not promised now |
| Shopify / listing accuracy | Inferred | **Stock, hours, events** wrong = trust break; creative must not over-promise real-time completeness |
| **Six domains** use **microbe** emoji/visuals | Confirmed (code) | Some audiences post-COVID may react; consider **soft framing** in sensitive contexts |

---

## Must-Know Strategic Context

- **Pivot narrative:** Honest **evolution** from personal art site to **platform** — useful for founder-led storytelling and PR.
- **Cold start:** Directory value requires **seed listings + updates**; artefact loop requires **clear rules** so users trust the game.
- **Stakeholder triangle:** **Seekers**, **venues**, **artists/shop** — incentives must stay **aligned** (who pays whom, who gets featured).
- **Design system** is a **creative anchor**: tokens and domain colors in [`domains.ts`](../app/lib/directory/domains.ts) and [DESIGN.md](../.stitch/DESIGN.md).
- **2026 Barcelona context:** Major cultural calendar activity (exhibitions, architecture capital, anniversaries) — **opportunity** for timely content hooks (verify dates on official sources when campaigning).

---

## Stakeholder Pain Points

### Cultural seekers (users)

- **Overload:** Too many agendas; hard to filter for **quality** and **vibe** (not only “free this weekend”).
- **Trust:** Unsure whether a listing is **active**, **accurate**, or **pay-to-play**.
- **Coherence:** Want **identity** and **return reasons** — not one-off clicks.
- **Mobile friction:** Jumping between **Maps, IG, and ticket sites**.

### Venues / organizers

- **Visibility:** Competing with **algorithms** and **big institutions** (museums on Articket, official agenda).
- **Labor:** Keeping listings updated is **boring**; need **low-friction** tools or partnerships.
- **ROI:** Why list on Sotabosc vs. **free** municipal or **large** media?

### Artists & shop (including founder)

- **Discovery:** Standalone **portfolio/Shopify** lacks **city context** and **repeat discovery**.
- **Positioning:** Fear of being **buried** under a directory or **diluted** vs. pure art brand.
- **Operations:** Fulfillment, **rights**, **commissions** if multi-artist.

### Operator (you)

- **Scope creep:** Directory + world + game + store = **four products** unless sequenced.
- **Data debt:** Stale events **hurt** faster than stale blog posts.
- **Narrative debt:** Solarpunk must stay **tied to real civic benefit**, not **skin-deep** aesthetic.

---

## Strategy Assessment & Refinement

**Core question:** Is the bundle **directory + artefact growth + store** one brand promise or three?

**Recommended hypotheses to validate (cheaply):**

1. **Wedge first:** Lead with **one** strongest hook — e.g. **“workshops & retreats + galleries”** OR **“artist store + gallery nights”** — then widen.
2. **Artefact clarity:** Users must understand **one sentence**: “When I X, my Y grows, and Z benefits.” If X/Y/Z are vague, **drop or simplify** before scaling ads.
3. **Supply-side pull:** Can you get **10–20 flagship venues** to **co-market** (QR in space, mutual posts)? Without this, paid UA fights **incumbent habit**.
4. **Revenue model:** Listing fees, **commission**, **sponsored** placement, or **store-only** margin — each changes **trust** and **copy**.

**Refinement signals (when to narrow):**

- If SEO is weak: double down on **niche long-tail** (“Barcelona drawing workshops solarpunk” style — test, don’t assume volume).
- If retention is weak: **artefact** may be **gimmick**; strengthen **newsletter + saved lists + alerts**.
- If venues won’t engage: position as **media partner** or **cultural calendar column** before “platform.”

---

## Pros and Cons (Strategic Model)

| Pros | Cons |
|------|------|
| **Differentiated** narrative vs. generic agendas | **Cold start**: need listings + traffic simultaneously |
| **Emotional retention** via artefact (if rules are clear) | **Complexity** may confuse first-time visitors |
| **Natural path** from browsing → buying art | **Conflict of interest** if store + paid listings blur **editorial trust** |
| **Barcelona focus** enables **deep** partnerships | **Small TAM** for pure performance ads unless you expand or go **tourism-seasonal** |
| **Founder art** gives **authentic** roots story | Risk of perception as **“one artist’s site with extras”** unless **multi-artist** proof is visible |
| Solarpunk aligns with **values-led** audiences | Solarpunk can feel **insider**; may need **gateway** language for broader ads |

---

## Market Research (Light)

**Barcelona cultural discovery market**

- **Institutional gravity:** [GuiaBCN](https://guia.barcelona.cat/) (Barcelona City Council) offers a **massive** official agenda and directory — strong on **coverage**, weak on **brand personality** and **creator commerce**.
- **Media aggregators:** [Betevé agenda](https://beteve.cat/agenda/), [Time Out Barcelona](https://www.timeout.com/barcelona/), [Barcelona Navigator](https://barcelonanavigator.com/events/), [irBarcelona](https://irbarcelona.org/) — **attention competitors** with **editorial or SEO** strength.
- **App layer:** [Hoy Barcelona](https://www.hoybarcelona.app/) — **leisure + offers** model; different value prop.
- **Exhibition verticals:** [Articket BCN](https://articketbcn.org/), museum guides, [Barcelona Explorers](https://barcelonaexplorers.com/) — **museum/exhibition** depth; partial overlap with **galleries** only.
- **Workspace / workshop adjacency:** Coworking roundups (e.g. [Nomad Cowork Barcelona](https://nomadcowork.com/spaces/countries/spain/barcelona), [Barcelona Life](https://www.barcelona-life.com/barcelona-coworking-spaces)) — **nomad** skew; opportunity to **cross-list** creative workshops.

**Solarpunk / aesthetic positioning (consumer landscape)**

- Solarpunk-oriented **commerce** often emphasizes **eco-optimism**, **ethical production**, **lifestyle philosophy** (e.g. apparel and accessories positioned as **resistance to disposable culture**) — useful for **tone**, not for copying offers. Reference reads: [Solarpunk Store](https://solarpunk-store.com/), aesthetic framing e.g. [The Gr0ve — solarpunk aesthetics](https://thegr0ve.com/kits/solarpunk-inspiration/art-and-community/the-glass-and-the-green-solarpunk-aesthetics-guide/).

**Gaps Sotabosc could occupy**

- **Curated “slow culture + ecology metaphor”** directory with **user progression** and **artist commerce** in one place — **not** filled by municipal or Time Out-style players at **experience** level.
- **Hyperlocal** love for **neighborhood** galleries and **hands-on** workshops vs. **only** blockbuster exhibitions.

**Risks**

- **Habit incumbency:** Google + Instagram + official agenda.
- **SEO long ramp** without **backlinks** and **fresh content**.
- **Seasonality** (tourism spikes vs. local year-round).
- **Trust** if **pay-to-list** without transparency.

---

## Research Notes

*Sources consulted (representative):*

- https://guia.barcelona.cat/
- https://beteve.cat/agenda/
- https://www.timeout.com/barcelona/
- https://barcelonanavigator.com/events/
- https://irbarcelona.org/
- https://www.hoybarcelona.app/
- https://articketbcn.org/
- https://barcelonaexplorers.com/
- https://nomadcowork.com/spaces/countries/spain/barcelona
- https://www.barcelona-life.com/barcelona-coworking-spaces
- https://solarpunk-store.com/
- https://thegr0ve.com/kits/solarpunk-inspiration/art-and-community/the-glass-and-the-green-solarpunk-aesthetics-guide/

*Gaps / low-confidence areas:*

- **Public brand URL**, traffic, revenue, team size — **unknown**.
- Exact **artefact growth rules** and what counts as “support” — **TBD** (user to define for legal and creative clarity).
- **Monetization** (listing fees, ads, commission) — **TBD**.
- **Legal entity**, partnerships, and **content licensing** for listings — **TBD**.
- Competitor feature sets **change**; re-verify before major campaigns.

---

*End of document.*
