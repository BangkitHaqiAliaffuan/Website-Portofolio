# 3dportofolio — AGENTS.md

React 19 + Vite 8 portfolio site (GSAP scroll animations, Tailwind v4, react-router). Part of the `D:\KELAS-XI` monorepo; see the root `AGENTS.md` for workspace context.

## Commands

- Use **npm** (this project has `package-lock.json`; sibling projects use pnpm — don't assume).
- `npm run dev` — but note it runs `process:images` first (see below).
- `npm run lint` — ESLint flat config (`eslint.config.js`). No tests are configured.

## Asset pipeline gotcha

`npm run dev` and `npm run build` both run `scripts/remove-gray-bg.mjs` first. It uses `sharp` to strip the gray background from `src/assets/spaceship-window.png` and writes `src/assets/spaceship-window-processed.png` (the file imported by `SpaceScroll.jsx`).

- Never edit `spaceship-window-processed.png` by hand — it's regenerated on every dev/build.
- Colors are matched against hardcoded `{130,130,129}` with tolerance 20 inside the script. If you replace the source PNG, rerun `npm run process:images` and check the output.
- `sharp` is a native dependency; if installs fail, that's the culprit.

## Tailwind v4 (CSS-first)

No `tailwind.config.js`. Tailwind is enabled via `@tailwindcss/vite` in `vite.config.js` and imported once with `@import "tailwindcss";` in `src/App.css`. Any theme customization goes in CSS (`@theme`), not a JS config.

## Env / EmailJS

Contact form (inside `Home.jsx`) uses EmailJS via `import.meta.env.VITE_EMAILJS_*` (service/template IDs + public key). Copy `.env.example` → `.env` and restart the dev server after changing values. If vars are missing the form just fails gracefully — not a bug.

## Structure

- `src/App.jsx` — single route `/` → `Home`. `About.jsx` / `Contact.jsx` are stubs.
- `src/Components/Home.jsx` (589 lines) + `Home.css` (1542 lines) — nearly the whole site lives here.
- Custom `Dune_Rise` font in `src/dune_rise/`.
- Certificates in `public/certificates/` are referenced by exact filename from `Home.jsx` (`README.txt` lists the required names).

## 3D profile (R3F + drei)

`SpaceScroll.jsx` renders a 3D avatar (`src/Components/Profile3D.jsx`) inside the circular profile frame, replacing `profile-photo.png` (which is now unused). It auto-centers/scales the model via `THREE.Box3`, spins slowly when idle, and follows the mouse pointer (whole-model look-at). Stack: `three` + `@react-three/fiber@9` + `@react-three/drei@10` (all pinned to React 19 — do **not** bump fiber to v10 alpha or drei to v9).

- Model: `src/assets/astronaut_glb.glb`, imported directly via Vite. Vite 8/rolldown does **not** treat `.glb` as an asset by default — `vite.config.js` sets `assetsInclude: ['**/*.glb']`; don't remove it or the build fails.
- Model is a single mesh with no bones (Blender export, source `zh123`) — "head follows mouse" rotates the whole model; a true head/neck pivot requires a model with a separate head node/bone. No license was stated for the current model (the old Sketchfab CC-BY-4.0 astronaut attribution no longer applies).
- Lighting is manual (ambient + 3 directional); do not swap in drei `Environment` presets unless you accept a runtime CDN fetch for the HDR.
- The circular mask lives in the `.profile-photo` CSS in `SpaceScroll.jsx` (`overflow: hidden` + `border-radius: 50%`); GSAP still animates that wrapper, so the timeline is untouched.
