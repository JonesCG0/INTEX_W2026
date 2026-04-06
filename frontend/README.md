# Frontend

React + TypeScript + Vite app for Project Haven.

## Local Development

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`. Requires the backend running at `http://localhost:5262`.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL |

Copy `.env.example` to `.env` for local dev. Production URL is set in `.env.production`.

## Build

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build locally
```

## Linting & Formatting

```bash
npm run lint
npm run format
```
