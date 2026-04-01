# Sotabosc Design System

## Visual Language
- **Colors**: Vibrant, HSL-tailored palettes. Cyan, Deep Greens, Earthy Browns, Mycelial Pinks.
- **Typography**: Heading: Serif (Heading); Body: Outfit/Inter.
- **Atmosphere**: Glassmorphism, deep shadows, micro-animations.
- **Scroll**: GSAP-driven vertical pinning and linear transitions.
- **Specimens**: Interactive hotspots scattered throughout the linear descent.

## Design System Notes for Stitch Generation
- Use `backdrop-blur-2xl` and `bg-white/70` for UI cards.
- Rounded corners: `rounded-[2.5rem]`.
- Interactive elements should have subtle hover scales or glow.
- Components must be SSR-safe (guard `window`, `localStorage`, `crypto`).
