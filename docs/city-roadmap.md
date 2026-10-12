# Sotabosc city — roadmap and passport framework

Covers the web city (this repo). The physical screens have their own plan in
`D:\sotabosc\living-wall\docs\project-overview.md` §9; the two meet in Phase 3 below.

## Where things stand (2 Oct 2026)

| Piece | State | Where |
|---|---|---|
| Persistent directory (places, events, creators) | Live in Supabase, seed fallback | `docs/supabase-city-directory.md` |
| Homepage = the 3D city, one screen, no scroll | Built | `app/components/city/CityStage.jsx`, `CityScene3D.jsx`, `CityPanels.jsx` |
| Camera flights: arrival, fly-to on select, guided tour of the kingdoms | Built | `CameraRig` in `CityScene3D.jsx`, `TOUR` in `CityStage.jsx` |
| Step inside a building: a walkable room with things to use | Prototype in LittleJS, one layout per kingdom, **ambient figures only** (no shared presence yet) | `CityRoom.jsx`, `app/lib/city/room/room-game.js`, `app/routes/city.room-frame.jsx` |
| Explanatory pages | `/how-it-works`, `/screens` | `app/routes/how-it-works.jsx`, `screens.jsx`, `CitySections.jsx` |
| Live city | Barcelona's light and weather, walkers, boats, a strip of real gatherings | `scene/life.jsx`, `CityStage.jsx` |
| Passport: visits → kingdom collectibles | Built, **browser-only** | `app/lib/city/passport/` |
| Passport sync, accounts, check-ins at real venues | Not built | Phases 2–3 |

## The passport

**Rule.** Each kingdom keeps one collectible. It surfaces on the map when a visitor either

- walks into **3 different places** in that kingdom (explorer), or
- comes back to **one place on 4 different days** (regular).

A place counts once per Barcelona calendar day, so tapping a building repeatedly does nothing.
The numbers live in `PASSPORT_RULES` (`passport/rules.ts`).

**States.** `hidden` (nothing on the map) → `stirring` (wireframe gem; tapping it says what is
left to do) → `surfaced` (lit gem with a beam, plus a "Pick it up" notice) → `collected`.
The Plaça find has no kingdom and is always out; it teaches the idea.

**What counts as a visit today.** Opening a citizen on the homepage city. That is a web visit, not
proof someone was in the room — see Phase 3.

**Layers**

| Layer | File | Notes |
|---|---|---|
| Rules | `passport/rules.ts` | Pure functions, no storage, no React. Tested: `npm run test:city` |
| Local store | `passport/usePassportStore.ts` | zustand + localStorage key `sotabosc-city-passport`. Holds `visitorId`, `visits`, and an append-only `outbox` of events |
| Collectibles | `app/lib/city/finds.js` | One per kingdom, each mapped to a specimen so pick-ups land in the artifact dock and gallery |
| UI | `CityStage.jsx`, `CityPanels.jsx`, `CitySections.jsx` | Passport line in the citizen panel, progress in the Places list and on /how-it-works, gems in the 3D city, surfaced notice |

Collected state is the existing `discoveredSpecimens` in `useOrganismStore`, so the dock,
`/gallery` and `/collections/specimens` already show passport collectibles.

## Next phases

### Phase 2 — Passport on the server (the web2 step)

Goal: a passport survives a new device and can be trusted enough to give things away.

1. **Tables** (draft below — not in `supabase/migrations/` yet, so nothing gets pushed by accident).
2. **Route** `app/routes/api.city-passport.js`: `POST` takes `{ visitorId, events[] }` from the
   outbox, writes with the service-role key on the server, returns the merged passport. The
   browser never gets a write key. The client then calls `markSynced(ids)`.
3. **Server recomputes unlocks** with the same `rules.ts`; the client's claim is never the record.
4. **Identity**: start anonymous (`visitorId`). Attach to the existing membership profile
   (`public.profiles`, from `init_memberships`) when someone saves their artifact, so one person can merge two browsers.
5. Rate-limit by `visitorId` + IP, and cap events per day.

```sql
-- DRAFT. Review, then move into supabase/migrations/ and `db push --dry-run`.
create table city_visitors (
  id uuid primary key,
  profile_id uuid references public.profiles(id),   -- set once the visitor signs in
  created_at timestamptz not null default now()
);

create table city_visits (
  visitor_id uuid not null references city_visitors(id) on delete cascade,
  place_slug text not null,
  kingdom text not null,
  day date not null,                 -- Barcelona calendar day
  source text not null check (source in ('map','listing','screen','room')),
  created_at timestamptz not null default now(),
  primary key (visitor_id, place_slug, day)
);

create table city_collectibles (
  visitor_id uuid not null references city_visitors(id) on delete cascade,
  collectible_id text not null,
  kingdom text,
  unlocked_via text check (unlocked_via in ('explorer','regular','open')),
  collected_at timestamptz not null default now(),
  primary key (visitor_id, collectible_id)
);

alter table city_visitors enable row level security;
alter table city_visits enable row level security;
alter table city_collectibles enable row level security;
-- No anon policies: service_role only, same pattern as the booking tables.
```

### Phase 3 — Real visits: the screens become check-in points

Goal: a visit means someone stood in the venue.

- Every wall slide already carries a QR tagged with the host (`utm_medium=<host slug>`).
  Add a short-lived signed token to that link; landing with a valid token records a visit
  with `source = 'screen'`.
- Weight sources: a `screen` visit can count for more than a `map` visit, or the regular path
  (4 days) can require `screen` visits. That is one change in `rules.ts`.
- Wall side: a "collectible surfaced here" beat when someone unlocks at that venue, and a
  monthly count per host of the visits its screen sent on. Needs the living-wall repo.
- Consent stays as in `living-wall/docs/compliance.md`: no faces, no sensors, visitor ids only.

### Phase 4 — A city that is visibly shared

- **Real avatars in the rooms.** `CityRoom.jsx` already lets a visitor step in, pick a colour and walk;
  the other figures are scenery. Put each room on a Supabase Realtime presence channel
  (`room:<place slug>`), broadcast `{ hue, x, depth }` from `join` / `walkTo`, and draw the others with
  the same figure. Needs the anon key in the browser and `wss://` added to the CSP `connect-src`.
- Real presence instead of the simulated count: Supabase Realtime presence per kingdom, shown
  as the walkers on the map.
- Kingdom totals ("The Grove was walked 212 times this week") from `city_visits`.
- Collectibles as real objects: each one links to a print or edition in the store; hosts can
  offer something in the room to holders.
- Seasonal collectibles tied to festivals renting the Arena.

### Phase 5 — Citizens run their own plot

Claimed businesses edit their building, screen messages and events from an account, replacing
the claim form + manual seed edits.

## Open questions

- Should the 3 places have to be in **one** kingdom (current rule) or anywhere in the city?
- Is a homepage tap enough to earn a collectible, or should the kingdom ones wait for Phase 3?
- Listing pages (`/city/places/:slug`) do not record a visit yet; only map buildings do.

## Rooms (LittleJS)

The city stays in three.js; the interiors are a 2D LittleJS game, loaded only when someone steps inside.

- **Why an iframe.** LittleJS is one global engine: it sizes its canvas to the window, listens on
  `document` and cannot be shut down. `/city/room-frame` gives it a window of its own, so closing the
  room throws the whole engine away and nothing leaks into the site.
- **Split of work.** `room-game.js` draws the room, moves people and reports `near` / `action`.
  `CityRoom.jsx` owns everything with consequences: links, notes, the passport stamp.
  They talk over `postMessage` (messages listed at the top of `room-game.js`).
- **Rooms today.** One layout per kingdom (café, gallery, lab, venue, wellness studio), drawn from
  shapes, no image files. Every room has a host spot, one kingdom-specific thing, the screen, the
  noticeboard, a passport stamp and the door. Every thing is also a button under the room.
- **Next.** Per-business layouts and sprite art; real avatars over Realtime (Phase 4, send
  `{ hue, x, y }` from the game's walk); small games a business can host; sound.

## 3D performance

`/?stats` shows frame rate, draw calls, triangles, pixel ratio and shadow mode on the homepage.
`/?stats=live-shadows` redraws shadows every frame, to compare.

What is already done:

- Shadows are drawn once and kept (nothing that casts one moves); they refresh on a light change or a selection.
- Pixel ratio starts at 1.5 on touch devices and 1.75 elsewhere, and drops to 1 if frames fall behind.
- Background districts, trees, walkers and lamps are instanced. The scene stops while the tab is hidden or a room is open.
- The drifting-particle overlay is off on the homepage.

Next, if a phone still struggles (measure with `/?stats` first):

1. Merge each citizen building into one mesh per material. They are about 15 separate meshes each, which is most of the draw calls.
2. A "lite" tier for weak devices: no shadows, half the walkers, no fireflies, plankton or fireworks.
3. Swap the kingdom labels from DOM overlays to sprites.
