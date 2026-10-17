# MotorMind — Interactive Automotive Customisation Experience

A client-facing interactive vehicle customisation prototype designed for **MotorMind Automotive Designs** (Bengaluru, Karnataka).

Inspired by the tactile customisation garaging of titles like *Need for Speed*, unified with the visual realism and usability of modern automotive configurators (such as the Porsche Configurator and Linear design sensibilities).

---

## 🚗 Vehicle Showcase: Volkswagen Polo GT TSI

- **Variant:** Volkswagen Polo GT TSI (Fifth generation · India-market 5-door hatchback).
- **Visualisation Strategy:** High-fidelity layered 2.5D studio compositor with dynamic real-time paint shading, specular reflections, finish characteristics (Gloss, Satin, Matte), multiple alloy wheel designs across bespoke finishes, aerodynamic styling kits (front splitter, side skirt extensions, rear diffuser with vertical strakes, roof spoiler extension), ride-height stance adjustments, contrast roofs, mirrors, door handles, and side graphics.

---

## ✨ Features

- **Dynamic Real-Time Paint Engine:** Shading models supporting custom automotive respray colors (e.g. MotorMind Red, Midnight Black, Lapis Blue, Sunburst Orange) and full-body vinyl wraps (Stealth Black, Concrete Grey, Liquid Copper, Electric Teal).
- **Wheel Customizer:** Apex twin 5-spoke, Vortex turbine, Monoblock 6-spoke, Lattice cross-spoke, and stock alloys with Silver, Gunmetal, Gloss Black, and Bronze finishes.
- **Aero Styling & Fitment:** Front splitter, sill blades, diffuser, and spoiler extensions with carbon-look, gloss-black, or body-color finishes.
- **Dynamic Camera Presets:** Seamless focus modes (Overview, Front, Side, Rear, Wheels, Roof).
- **Interactive Before/After Comparison:** Real-time split comparison slider against factory stock trim.
- **Itemised Build & Quote Conversion:**
  - Real-time indicative INR pricing calculations with replacement semantics and constraint protection.
  - Direct WhatsApp conversion pre-filling build references and itemised specs.
  - Email draft and copy-to-clipboard summary flows.
  - Full build link sharing (URL query encoding) and local browser build bookmarking.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + bespoke design tokens & studio utilities
- **Motion & Dynamics:** GSAP + modern CSS micro-animations
- **UI Architecture:** Radix UI primitives, Lucide Icons, Zustand state persistence
- **Routing:** React Router v7 + SPA Vercel rewrites

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

---

## ⚠️ Notes & Disclaimers

- All displayed part pricing and figures are illustrative demo estimations for presentation and prototyping purposes. Final quotations and compatibility require verification from MotorMind.
- All real MotorMind imagery and branding referenced from verified company archives (Founded 2008 in Bengaluru by Shahid Haq).
