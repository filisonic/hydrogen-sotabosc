# Claude Context - Hydrogen SOTABOSC Project

## 🎯 Project Overview
**Type**: Shopify Hydrogen v2 e-commerce site
**Domain**: SOTABOSC (Barcelona cultural directory)
**Framework**: React Router, Shopify Storefront API
**Status**: `#status/active` Development phase

## 📁 Project Structure
```
app/
├── components/          # React components
│   ├── directory/      # Directory listing components  
│   ├── home/           # Homepage components
│   └── world/          # Interactive world visualization
├── routes/             # File-based routing
│   ├── products.$handle.jsx  # ✅ Product detail pages
│   ├── city.*.jsx      # Directory sections
│   └── _index.jsx      # Homepage
├── lib/                # Utilities & data
└── styles/             # CSS files
```

## 🔧 Current State
- **Product routing**: ✅ Working (`products.$handle.jsx`)
- **Directory system**: 🔄 Active development
- **World visualization**: 🔄 Active development
- **Performance**: ⚠️ Needs optimization

## 🐛 Known Issues
- Performance bottlenecks in world rendering `#priority/high`
- Mobile responsive improvements needed `#priority/medium`
- SEO optimization pending `#priority/low`

## 🏗️ Architecture
- **Frontend**: React 18, Hydrogen v2
- **Backend**: Shopify Storefront API
- **Styling**: CSS modules, custom properties
- **State**: React hooks, context where needed

## 🔗 Key Files
| File | Purpose | Status |
|------|---------|--------|
| `products.$handle.jsx` | Product detail pages | ✅ Working |
| `_index.jsx` | Homepage | 🔄 Development |
| `loadCriticalData.js` | Data fetching utility | ✅ Working |
| `world/` components | Interactive visualization | 🔄 Active work |

## 🗄️ Supabase & Living Wall
- **Persistent city**: Supabase `ervbjxiwvjzeslrzonxx` holds `directory_places`, `directory_events`, `directory_creators` (public read) and booking data (`service_role` only). How-to: `docs/supabase-city-directory.md`. Agent/dev entry: `AGENTS.md`.
- **This repo owns the migration history**: `npx supabase db push --dry-run` then `npx supabase db push`, only from here. Do not push from `D:\sotabosc\living-wall`.
- **Site reads**: city routes use `getCityDirectory()` (`app/lib/directory/source.server.ts`) — anon key, cached, seed fallback.
- **Sync**: `npm run directory:sync-supabase` (seed → Supabase); it never writes consent columns (`wall_opt_in*`, `works[].rightsGranted`). Check: `npm run directory:check-live`.
- **Living Wall** screens (`D:\sotabosc\living-wall`) read the directory with the anon key; other businesses appear only with `wall_opt_in = true`. Rules: `living-wall/docs/compliance.md`.
- Never print or commit service-role keys; never grant anon access to booking/CRM ids

## 🎨 Design System
- **Colors**: Earth tones, nature-inspired palette
- **Typography**: Modern, accessible fonts
- **Components**: Modular, reusable design
- **Responsive**: Mobile-first approach

## 📊 Performance Targets
- **Load time**: <3s on 3G
- **Bundle size**: <500KB initial
- **Lighthouse**: >90 performance score
- **Core Web Vitals**: Green across all metrics

## 🔄 Recent Changes
- Homepage is the 3D city alone, one screen with no scroll (`CityStage.jsx`, `CityScene3D.jsx`): camera flights, a guided tour, step inside a building (`CityRoom.jsx`; the room is a LittleJS game in an iframe, `app/lib/city/room/room-game.js` + `/city/room-frame`). Explanatory content lives on `/how-it-works` and `/screens`. `/?stats` shows the 3D cost
- City passport: visits unlock a collectible per kingdom, browser-only for now (`app/lib/city/passport/`, `npm run test:city`). Phases and draft schema: `docs/city-roadmap.md`
- Persistent city: places, events and creators in Supabase; city pages read live with seed fallback
- Living Wall compliance (consent, labels, retention) documented in `living-wall/docs/compliance.md`
- Booking calendars locked to `service_role` (`20260930000000_wall_consent_and_rls.sql`)
- Fixed product routing 404 issues

## 📝 Notes
- Uses file-based routing convention
- Shopify Storefront API for product data
- Custom world visualization system
- Barcelona cultural directory integration