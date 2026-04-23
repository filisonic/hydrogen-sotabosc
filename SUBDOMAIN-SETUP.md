# Subdomain Setup Guide

This guide explains how to set up the multi-subdomain structure for Sotabosc.

## Subdomain Architecture

All subdomains point to the **same Shopify Oxygen deployment**. The `server.js` worker rewrites URLs based on hostname. Everything also works at direct paths on the main domain as a fallback.

| Subdomain | Internal Path | What It Serves |
|---|---|---|
| `sotabosc.world` | `/` | Magazine portal — editorial hub linking to everything |
| `city.sotabosc.world` | `/city-world` | Immersive scroll world experience |
| `directory.sotabosc.world` | `/city/*` | Barcelona directory (places, events, creators, hikes) |
| `tools.sotabosc.world` | `/tools/*` | Creative tools hub |
| `labs.sotabosc.world` | `/labs/*` | Speculative Futures Lab / Research |

## How It Works

```
Request: tools.sotabosc.world/organism-lab
         ↓
server.js detects hostname starts with "tools."
         ↓
Internally rewrites URL to: /tools/organism-lab
         ↓
React Router matches route: tools.organism-lab.jsx
         ↓
Page renders normally
```

## Setup Steps

### Step 1: DNS Records (Hostinger)

1. Log in to **Hostinger hPanel** → **Domains** → **Manage** your `sotabosc.world` domain
2. Go to **DNS / Nameservers** → **Manage DNS records**
3. Add these **CNAME records**:

| Type | Name | Target | TTL |
|---|---|---|---|
| CNAME | `city` | _(your Oxygen deployment URL)_ | 14400 |
| CNAME | `directory` | _(your Oxygen deployment URL)_ | 14400 |
| CNAME | `tools` | _(your Oxygen deployment URL)_ | 14400 |
| CNAME | `labs` | _(your Oxygen deployment URL)_ | 14400 |

> **Note:** The target should be the same as your main domain's target — check your existing `sotabosc.world` DNS record to see where it currently points (likely something like `shops.myshopify.com` or your Oxygen URL).

### Step 2: Custom Domains (Shopify Admin)

1. Go to **Shopify Admin** → **Settings** → **Domains**
2. Click **Connect existing domain** for each subdomain:
   - `city.sotabosc.world`
   - `directory.sotabosc.world`
   - `tools.sotabosc.world`
   - `labs.sotabosc.world`
3. Set the **target** of each domain to your **Hydrogen storefront** (production)
4. SSL certificates will auto-provision

### Step 3: Deploy

Push your code changes to trigger an Oxygen deployment. The `server.js` subdomain routing is already in place.

### Step 4: Verify

After DNS propagation (up to 24 hours, usually faster):

- Visit `city.sotabosc.world` → should show the immersive scroll world
- Visit `directory.sotabosc.world` → should show the Barcelona directory
- Visit `tools.sotabosc.world` → should show the tools index
- Visit `tools.sotabosc.world/organism-lab` → should show the organism lab
- Visit `labs.sotabosc.world` → should show the Speculative Futures Lab
- Visit `sotabosc.world` → should show the magazine portal

## Fallback URLs

Everything also works at direct paths on the main domain:

- `sotabosc.world/city-world` → immersive scroll world
- `sotabosc.world/city` → directory
- `sotabosc.world/tools` → tools index
- `sotabosc.world/tools/organism-lab` → organism lab
- `sotabosc.world/labs` → research lab

## Files Modified

### Server Routing
- `server.js` — Subdomain detection + URL rewriting

### New Routes
- `app/routes/city-world._index.jsx` — Immersive scroll world (relocated from `_index.jsx`)
- `app/routes/tools._index.jsx` — Tools landing page
- `app/routes/tools.organism-lab.jsx` — Organism lab (iframe wrapper)

### Modified Routes
- `app/routes/_index.jsx` — Redesigned as magazine portal homepage
- `app/components/PageLayout.jsx` — Updated route detection for minimal chrome

### Static Assets
- `public/tools/organism-lab-app.html` — p5.js organism lab (renamed from `organism-lab.html`)