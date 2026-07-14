# CW Shape Maker

Brand shape generator. React + Vite, designed at the 1440x860 breakpoint
(scales to fit smaller viewports).

## Run locally
    npm install
    npm run dev

## Deploy to Vercel
    npm i -g vercel   # if you don't have it
    vercel            # from this folder; accept defaults (Vite is auto-detected)

Or push this folder to a Git repo and import it at vercel.com/new — zero config.

## Structure
- src/engine.js — the shape engine (pure functions, fully test-verified).
  All brand constraints live here: feature sizes snap to the module grid,
  max two features, features win / corners yield, sliver removal,
  scallop+notch ban, dome gated off 16:9.
- src/App.jsx — the UI (Figma design system: chips, slider, stepper).
- public/fonts/ — ABC ROM Condensed (trial). Swap in the licensed file
  at the same path when ready; no code change needed.
- Neue Haas Unica loads from Typekit (link in index.html).

## Exports
- SVG: exact vector path, editable anywhere.
- PNG: 2560px long edge, transparent background.

## Responsive behaviour
- Left panel: fixed 468px; all type at fixed sizes.
- Preview: fills the remaining viewport; the shape scales with it.
- Viewport below 1000x600 -> "Expand the browser size to continue using this tool."
- Mobile devices -> "This tool is for desktop use only."
- Thresholds are the MIN_W / MIN_H constants at the top of src/App.jsx.

## Typekit note
Neue Haas Unica loads from your Adobe Fonts kit (use.typekit.net/vzp5eof.css).
In your Adobe Fonts web project settings, add the deployed domain
(e.g. your-project.vercel.app and any custom domain) to the kit's allowed
domains, or the font will fall back to Helvetica/Arial.
