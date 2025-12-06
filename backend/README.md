# Legal Dashboard Backend (Mock API + SSE + Swagger)

This is the mock backend for the Hiring Quest — provides REST endpoints and an SSE stream.

## Endpoints
- `GET /stats/overview` — overview metrics
- `GET /stats/timeline` — timeline events (past 24 hours)
- `GET /stats/anomalies` — anomalies list
- `GET /events/stream` — Server-Sent Events (SSE) stream (10–20s random events)
- `GET /docs` — Swagger UI (OpenAPI 3.0)

## Run locally
```bash
cd backend
npm install
npm run dev   # nodemon (dev) or npm start
