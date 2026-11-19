# FitPulse Frontend

React dashboard for the FitPulse fitness-tracking platform (M2 ILSI Big Data). Reads live from the Express API, or from local mock JSON when the backend is not ready.

## Stack

- React + Vite + TypeScript
- React Router, TanStack Query
- Tailwind CSS + shadcn/ui
- Recharts (via shadcn chart)
- Sonner toasts

## Run

```bash
cd fitness-app/frontend
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Mock vs real API

Defaults (see `.env`):

```
VITE_USE_MOCK=true
VITE_API_URL=http://localhost:5000
```

| Mode | Config |
|------|--------|
| Mock data (~300 ms delay) | `VITE_USE_MOCK=true` |
| Live backend | `VITE_USE_MOCK=false` and a reachable `VITE_API_URL` |

No code changes are required to switch. Copy `.env.example` to `.env` if needed. The Vite dev server proxies `/api` to `VITE_API_URL` to avoid CORS during local development.

## Roles

Use the sidebar select (no real auth):

- **Athlete** — timeline, calories, streak, profile (user `u1`)
- **Coach** — clients, client timeline, client calories
- **Analyst / Admin** — engagement, multi-city, schema variety, jobs

## Build

```bash
npm run build
npm run preview
```
