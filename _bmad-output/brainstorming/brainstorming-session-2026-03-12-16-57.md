---
stepsCompleted: [1, 2]
inputDocuments: []
session_topic: 'Sotabosc: A Living Digital Ecosystem in the Browser'
session_goals: 'Build a slow, mysterious, ecologically-structured browser world that invites visitors to enter, choose an organism identity, descend through ecosystem layers, discover art artifacts, and eventually grow and return to watch their organism evolve.'
selected_approach: 'Refined Vision'
techniques_used: ['Ecological Metaphor Mapping', 'Phased Growth Model', 'Narrative Layering']
ideas_generated: []
context_file: ''
---

# Brainstorming Session — Sotabosc

**Facilitator:** System
**Date:** 2026-03-12

---

## Session Overview

**Topic:** Sotabosc — A Living Digital Ecosystem
**Core UX Vision:** Not a website. Not a game. A *place* you descend into.

---

## Refined Core Concept

### The Central Metaphor: Ecological Cross-section

Sotabosc's UI is structured as a **vertical ecological cross-section** — like a scientific illustration of a forest viewed from side. Scrolling = descending into the world.

```
Sky / Canopy
│
Trees
│
Understory (plants, herbs)
│
Fungal Network
│
Water Layer
│
Soil / Microbes
```

**Design feel:** Slow, mysterious, organic. Like a digital nature reserve, not a startup website.

---

## Phase 1 — World + Identity

### Entry Flow

1. **Landing Screen**
   - Hero text: *"Welcome to Sotabosc — A living ecosystem of art, organisms, and ideas."*
   - Single CTA: *"Enter the forest"*

2. **Organism Selection** (never forced — always skippable)
   - 🐦 Bird · 🌳 Tree · 🍄 Fungi · 🌿 Algae · 🦠 Microbe
   - (Optional: "Skip and explore")

3. **Organism Card Generation**
   - A beautiful, unique identity card is generated:
     ```
     SOTABOSC ORGANISM
     Name: Azure Moss Tree
     Species: Coastal oak
     Age: 63 seasons
     Habitat: Mediterranean understory
     Role: Memory keeper
     ```
   - Visual avatar. Two actions: *Save organism* | *Explore Sotabosc*

### Scrolling Ecosystem Map — Layer by Layer

| Layer | Organisms | Content |
|---|---|---|
| 🌤 Sky | Birds | Stories, philosophy, ideas, art prints, publications |
| 🌳 Forest Canopy | Large trees | Major artworks, exhibitions, installations |
| 🌿 Understory | Plants, herbs | Natural dyes, clothing, handmade objects, workshops |
| 🍄 Fungal Network | Mushrooms | Collaborations, markets, community events, second-hand |
| 🌊 Water | Fish, algae | Kombucha, fermentation, regenerative projects |
| 🌱 Soil | Microbes | Research, experiments, materials, speculative prototypes |

**Key UX rule:** Products appear as *discoveries*, not as catalogue items.
> *Artifact from the fungal network — Mycelial Drift No.3 · Plotter drawing · A1 archival ink*

---

## Phase 2 — Community Layer (Later)

Once the world is established, users gain organism profiles:

- Avatar + species + ecosystem role + contributions
- Example: *Organism: Wild Fermentation Microbe · Habitat: Barcelona · Contribution: Kombucha brewer*
- Ecosystem map showing organism nodes connected to real-world places (workshops, markets, labs)

**Key principle:** Enter → Explore → Belong. **Not:** Sign up → Profile → Dashboard.

---

## 🌟 THE BIG HOOK — Evolving Organism

> **This is the single most powerful engagement mechanic.**

The organism card grows over time:
- Microbe → Colony → Ecosystem Builder
- Tree → Sapling → Ancient Oak
- Visitors return to watch *their organism age, change, contribute*.

This alone drives return visits — not notifications, not gamification, just slow biological time.

**✅ CONFIRMED: Organism evolution mechanics**
- **Time-based:** The organism ages in real calendar time (e.g., a tree gains a ring each month)
- **Visit-based:** Returning to Sotabosc accelerates or triggers small changes
- **Community-based:** Phase 1 will include a lightweight version if feasible; deferred to Phase 2 if too complex

**✅ CONFIRMED: Organism card generation**
- User selects their type: 🐦 Bird · 🌳 Tree · 🍄 Fungi · 🌿 Algae · 🦠 Microbe
- System procedurally generates a unique name, species, age, habitat, and role
- Zero customisation friction at entry — the system handles the rest

---

## Technical Approach

**Stack:**
- **Framework:** React + Next.js
- **Scroll animations:** GSAP ScrollTrigger
- **3D/Visual depth:** Three.js or subtle GLSL shaders
- **Sound:** HTML5 Audio / Howler.js — subtle ambient nature soundscapes (very low default volume, easily mutable)
- **Deployment:** Vercel

**Philosophy:** Rich 2D illustration with depth — *not* a heavy 3D game. Think interactive scientific cross-section illustration.

**✅ CONFIRMED: Sound**
- Ambient nature sounds included (birdsong, wind, water, soil hum depending on layer)
- Very subtle default volume — unobtrusive in public or shared spaces
- Simple mute toggle always accessible
- No complex generative audio (Tone.js deferred — add later if desired)

**✅ CONFIRMED: First layer to build**
- Chosen for easiest implementation and strongest narrative entry point: **Sky / Canopy layer**
- Reasons: lightest content requirements, most accessible visually, establishes the tone immediately, draws visitors downward into deeper layers

---

## ✅ Session Complete — Ready for PRD

All key decisions are locked. The next step is to invoke the **Product Manager (PM) agent** and begin the **Create PRD workflow** (`/bmad-bmm-create-prd`) to formalize these decisions into a complete product requirements document.

**Key decisions summary:**
| Decision | Resolution |
|---|---|
| Organism evolution | Time-based + Visit-based (Community if feasible in Phase 1) |
| Card generation | User picks type → system generates unique card |
| Sound | Subtle ambient nature sounds, very low volume, mutable |
| First layer to build | Sky / Canopy (easiest, strongest narrative entry) |
| Plotter art integration | Deferred — not in scope for Phase 1 |
| Community features | Phase 2 only (organism profiles, ecosystem map) |
