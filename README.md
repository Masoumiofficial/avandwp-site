# avandwp-site

Landing page for **AvandWP (آوند) v1.0.0** — React + TypeScript + Vite, RTL Persian UI.

## Scripts

```bash
npm install
npm run dev        # http://localhost:5173 (bound to 0.0.0.0)
npm run typecheck
npm run build      # outputs dist/ (ignored by git)
npm run preview
```

## Structure

- `src/data/content.ts` — all Persian copy, scenarios, chat demo answers, FAQ, pricing and ROI defaults.
- `src/components/` — one component per section (14-section brief).
- `src/styles/global.css` — design tokens (`--avand-*`) and responsive rules.
- `public/avandwp-logo.svg` — official hexagonal mark.

## Before launch: placeholders to confirm

| Item | Where | Current state |
| --- | --- | --- |
| Download URL | `LINKS.downloadUrl` | empty → button shows «به‌زودی» |
| Docs / status URLs | `LINKS.*` | `#docs`, `#status` placeholders |
| License prices (تومان / USD) | `LICENSE_TIERS` | sample values; `PRICING_CONFIRMED = false` shows a warning |
| Hourly rate for ROI | `ROI_DEFAULTS.hourlyRateToman` | sample value |
| Technical claims (8 tables, AES-256-GCM, 6 workspaces, provider list) | `content.ts` | taken from the product brief; verify against the released `avandwp-v1.0.0.zip` |

The chat widget, workflow simulator and ROI calculator are front-end demos. They do not call any AI service.
