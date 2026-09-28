# 3dportofolio — AGENTS.md

React 19 + Vite 8 portfolio site (GSAP scroll animations, Tailwind v4, react-router).

## Commands

- Use **npm** (`package-lock.json`).
- `npm run dev` / `npm run build` — both run `process:images` first (see below).
- `npm run lint` — ESLint flat config. No tests configured. One known pre-existing warning: `react-hooks/exhaustive-deps` in `Home.jsx` (`aboutTextContent`).

## Asset pipeline gotcha

`process:images` runs `scripts/remove-gray-bg.mjs` (needs `sharp`, a native dep — if installs fail, that's the culprit). It strips the gray background from `src/assets/spaceship-window.png` and writes `src/assets/spaceship-window-processed.png` (imported by `SpaceScroll.jsx`).

- Never edit `spaceship-window-processed.png` by hand — regenerated on every dev/build, and git-ignored (see `.gitignore`).
- Match color is hardcoded `{130,130,129}` tolerance 20 in the script. Replacing the source PNG requires rerunning `npm run process:images` and checking output.

## Tailwind v4 (CSS-first)

No `tailwind.config.js`. Enabled via `@tailwindcss/vite` in `vite.config.js`, imported once with `@import "tailwindcss";` in `src/App.css`. Theme customization goes in CSS (`@theme`), not a JS config.

## Env / EmailJS

Contact form (in `Home.jsx`) uses EmailJS via `import.meta.env.VITE_EMAILJS_*`. Copy `.env.example` → `.env`, restart dev server after changes. `.env` is git-ignored; missing vars fail gracefully (not a bug). Template params sent: `from_name`, `from_email`, `reply_to`, `message`.

## Structure

- `src/App.jsx` — single route `/` → `Home`. `About.jsx` / `Contact.jsx` are unused stubs.
- `src/Components/Home.jsx` + `Home.css` — nearly the whole site lives here.
- `src/Components/SpaceScroll.jsx` — GSAP-pinned intro (spaceship zoom → fade → name text over Earth). Rendered only on desktop (`Home.jsx` skips it at ≤900px). After scroll ends only the name text shows; there is no avatar — the 3D stack (`three`, `@react-three/fiber`, `@react-three/drei`, `Profile3D.jsx`, `astronaut_glb.glb`, `assetsInclude`) was fully removed, so do not reintroduce it without asking.
- `src/assets/profile-photo.png` is unused; the About section uses `photo-profile.png`.
- Certificates in `public/certificates/` are referenced by exact filename from `Home.jsx`; `README.txt` lists required names.
- Custom `Dune_Rise` font in `src/dune_rise/`.
