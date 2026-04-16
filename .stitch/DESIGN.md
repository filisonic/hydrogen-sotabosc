# Sotabosc — design system (code sync)

Source of truth for Stitch prompts and Hydrogen implementation. **Align generated screens with these tokens** so HTML handoff maps to `var(--sotabosc-*)` in React.

## Brand & vibe

- **Product**: Nature-led city directory (Barcelona) + scrollable “world” home; solarpunk, organic, premium clarity.
- **Voice**: Confident, minimal chrome; domain-colored accents (plants, fungi, algae, etc.) on neutral bases.

## CSS variables (Hydrogen)

Set on `WorldShell` (home) or `DirectorySurface` (city routes). Map Stitch colors to these names:

| Token | Role | Neutral value |
|-------|------|----------------|
| `--sotabosc-bg` | Page background | `#f4f1ea` |
| `--sotabosc-surface` | Cards, panels | `#ffffff` |
| `--sotabosc-surface-muted` | Secondary bands | `#ebe6dc` |
| `--sotabosc-accent` | Primary actions, key headers | `#1b4332` |
| `--sotabosc-accent-soft` | Hover, secondary CTA | `#2d6a4f` |
| `--sotabosc-text` | Body / titles | `#1a1a1a` |
| `--sotabosc-muted` | Secondary text | `#5c5c5c` |
| `--sotabosc-border` | Hairlines | `rgba(27, 67, 50, 0.12)` |

Domain themes override the same keys when the user has an organism domain selected (see `app/lib/theme/domainTheme.ts`).

## Typography

- **UI font**: Inter (existing `app/styles/app.css` / Tailwind sans).
- **Display / marketing**: Manrope as `--font-display` (city + cards). **Editorial / home hero**: Newsreader as `--font-editorial` (Stitch *Sotabosc Reserve* pairing).
- **Scale**: Tight display headings (`font-black` or editorial `font-semibold`, `tracking-tight`); labels `uppercase tracking-widest` or `tracking-[0.35em]` at `10px`–`11px`.

## Shape & elevation

- **Radius**: Cards `rounded-2xl` (1rem); pills `rounded-full`.
- **Shadow**: Restrained — `hover:shadow-md` on interactive cards; avoid heavy default shadow.
- **Focus**: Visible focus ring on links/controls (`ring-2 ring-[var(--sotabosc-accent)] ring-offset-2`).

## Components (Stitch prompt anchors)

1. **Directory listing card** — Image top 16:10, domain pill, title + summary, neighborhood meta; border `var(--sotabosc-border)`, surface `var(--sotabosc-surface)`.
2. **Event row card** — Horizontal layout, date block with domain tint, truncated title.
3. **City hero** — H1 + short subtitle +search; generous padding; muted subtitle `var(--sotabosc-muted)`.

## Home masthead & hero (awesome-design-md–style guardrails)

Cross-cutting patterns from the [VoltAgent awesome-design-md](https://github.com/VoltAgent/awesome-design-md) collection (Stitch-oriented **DESIGN.md** structure: hierarchy, layout, components, depth, responsive, do/don’t), adapted to Sotabosc tokens:

| Principle | Application |
|-----------|-------------|
| **Visual hierarchy** | Single column: brand mark → H1 → one-line subtitle → supporting copy → **one** dominant primary CTA, then secondary. |
| **Typography** | Clear step between display (editorial), subtitle, and body; body **≥14px** on small screens; labels may be 11–12px. |
| **Layout** | Horizontal padding **16 / 24 / 32px** (`px-4 sm:px-6 lg:px-8`); generous vertical padding at the start of the journey; prose width cap **~42rem** for deck copy. |
| **Primary / secondary** | Primary = filled accent gradient or solid `var(--sotabosc-accent)`; secondary = outline / glass, **lower** visual weight — not the same size/color as primary. |
| **Touch targets** | Interactive controls **≥44×44px** effective hit area (padding + `min-h`). |
| **Depth** | Glass: hairline border + **one** soft shadow tier; inset highlight optional; avoid competing heavy drop shadows. |
| **Responsive** | Narrow: center stack; **`sm:`+** left-align editorial block for LTR. |
| **Don’ts** | No two “primary” buttons; no body copy below 12px except micro-labels; don’t hardcode hex where `var(--sotabosc-*)` should track theme (except locked marketing green on home if we freeze brand). |

Implementation: [`app/routes/_index.jsx`](../app/routes/_index.jsx) (layered backdrop + glass hero card).

---

## Long-page section taxonomy (Enter Maya–style)

Long-scroll pages use **named vertical bands** for rhythm and cohesion (inspired by narrative marketing sites like [Enter Maya](https://entermaya.com/)), implemented with shared primitives — not a visual clone of that brand.

| Section type | Role | `PageSection` variant | Header pattern |
|--------------|------|----------------------|----------------|
| **Hero** | One H1, deck, primary discovery (search) | `band-muted`, `density="hero"` | `SectionHeader` `titleAs="h1"` |
| **Discovery filters** | Domains, categories, wayfinding chips | Alternate `band-default` / `band-muted` | `aria-label` on section if no visible title |
| **Featured grid** | Places, hikes, events, creators | Alternate bands | `SectionHeader` H2 + optional kicker + actions link |
| **Inset callout** | Guides card, promo panel | Often `band-muted` with inner `surface` card | `SectionHeader` inside card |
| **CTA band** | Feedback / contribute | `band-accent` (gradient) or `band-default` + solid accent card | Custom copy or `SectionHeader` with inverted text if needed later |
| **Social proof** | Quotes / press (future) | `band-muted` or `band-default` | `SectionHeader` + quote list |

**Band alternation (city hub):** `muted → default → muted → …` down the page so sections read as distinct “chapters.” **One H1 per page**; all other section titles are **H2** (or **H3** only when nested under an already-labelled landmark).

**Primitives:** [`app/components/layout/PageSection.jsx`](../app/components/layout/PageSection.jsx), [`app/components/layout/SectionHeader.jsx`](../app/components/layout/SectionHeader.jsx) — horizontal padding `px-4 sm:px-6 lg:px-8`, inner `max-w-6xl mx-auto`, tokens only for backgrounds.

---

## Priority redesign targets (ship order)

1. **City hub** — [`app/routes/city._index.jsx`](../app/routes/city._index.jsx): hero, search, domain pills, grids.
2. **Listing cards** — [`PlaceCard`](../app/components/directory/PlaceCard.jsx), [`EventCard`](../app/components/directory/EventCard.jsx): token-based surfaces and borders.
3. **Detail pages** — [`city.places.$slug.jsx`](../app/routes/city.places.$slug.jsx), [`city.events.$slug.jsx`](../app/routes/city.events.$slug.jsx): hero media, back link, metadata chips.

## Stitch MCP reference (generated)

- **Project ID**: `18438465356645526031` (Stitch: Sotabosc Hydrogen UX)
- **Home screen ID**: `f6ce16926a1845c2b6ef73811fad606f` — title *Sotabosc Hydrogen HOME* (DESKTOP). Handoff: [.stitch/designs/sotabosc-home-hydrogen.json](designs/sotabosc-home-hydrogen.json).
- **City hub screen ID**: `6a01bf98440e469c95117c7bcd0f54b5` — title *Sotabosc City Hub* (DESKTOP).
- **Design system assets**: `assets/758f625f31e84614bdb20a6a289193a5` (*Sotabosc Reserve* — Newsreader + Inter, tonal surfaces, home prompt). Legacy: `assets/5d6ce9003f424d8eb1b4449b4a10a79c` (*Sotabosc Solarpunk* — Manrope headlines).
- **Handoff note**: Stitch suggests soft **green-tinted** hover shadow `0 20px 40px rgba(27, 67, 50, 0.06)` on cards; prefer tonal section bands over harsh divider lines where feasible.

## Stitch MCP usage

- **Project**: Use or create a Stitch project titled **Sotabosc Hydrogen UX**; generate **desktop** screens first.
- **Prompt template**: Paste the **CSS variables** table and **Components** bullets into `generate_screen_from_text`; request Tailwind-style utility structure and `data-stitch-id` on major blocks.
- **Handoff**: Download HTML/screenshot to `.stitch/designs/` if needed; map to JSX — preserve token comments for resync.

## Optional marketing imagery (Google / Nano Banana MCP, etc.)

- **Hero / OG / share**: Export PNG/WebP to `public/images/og/` (e.g. `sotabosc-share.png`). Wire absolute URL in meta via [`app/lib/seo/siteImagery.js`](../app/lib/seo/siteImagery.js).
- Do **not** use typography or layout from raster images — only backgrounds and share cards.

### Nano Banana MCP in Cursor

- **Server id (for the agent):** `user-nanobanana` — tool `generate_image` (see Cursor MCP descriptors under `mcps/user-nanobanana/`).
- **Config:** [nanobanana-mcp-server](https://github.com/zhongweili/nanobanana-mcp-server) via **Cursor Settings → MCP**; `env` must include a valid **`GEMINI_API_KEY`** from [Google AI Studio](https://aistudio.google.com/) (Generative Language API enabled for that key).
- **`output_path`:** Use an absolute path to this repo, e.g. `d:/hydrogen-sotabosc-new/public/images/og/sotabosc-share.png` or `…/public/assets/world/backgrounds/canopy.png`.
- If generation returns **`API key not valid`**, the key in MCP `env` is wrong, expired, or restricted — create a new API key in AI Studio and paste it into the Nano Banana server block (no quotes/spaces). Requires **`uvx`** on PATH if you launch with `uvx nanobanana-mcp-server@latest`.
- **Free tier vs Nano Banana:** On [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing), **native image models** (`gemini-3.1-flash-image-preview`, `gemini-2.5-flash-image`, Imagen, etc.) list **Free tier: Not available** for API image output — billing is paid-only. That matches **`429` / quota `limit: 0`** on a free key. **Text** models (e.g. Flash) have free API tiers, but they do not replace raster generation in this MCP. **$0 workflows:** generate in **AI Studio** (playground) and download PNGs into `public/…`, or use **SVG/CSS** from a text model, or **scraped / stock** imagery (see bulk-ingest plan).
