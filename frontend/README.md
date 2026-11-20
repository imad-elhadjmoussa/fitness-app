# FitPulse Frontend

React dashboard for FitPulse, wired to the Express + MongoDB API.

## Stack

- React + Vite + TypeScript
- React Router, TanStack Query
- Tailwind CSS + shadcn/ui
- JWT auth (Bearer token)
- Recharts + Sonner

## Run with the backend

Terminal 1 — API (port 3000):

```bash
cd fitness-app/backend
npm install
# ensure MongoDB is running and .env has MONGODB_URI
npm run dev
```

Terminal 2 — web:

```bash
cd fitness-app/frontend
npm install
npm run dev
```

Frontend defaults (`.env`):

```
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:3000
```

1. Open the app → **Create account** (athlete / coach / analyst).
2. Sign in.
3. Athletes can **Log workout**, view timeline, update profile.
4. Coaches see clients and client timelines.
5. Analysts see schema variety from live workouts; engagement / multi-city / jobs need mock or future APIs.

## Mock mode

Set `VITE_USE_MOCK=true` to use local JSON without the API (any login works).

## Auth endpoints used

| Action | Endpoint |
|--------|----------|
| Register | `POST /api/users` |
| Login | `POST /api/auth/login` |
| Session | `GET /api/auth/me` |
| Profile | `GET/PATCH /api/users/:id` |
| Workouts | `POST /api/workouts`, `GET /api/workouts/user/:id/recent` |
