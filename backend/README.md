# Legal Workflow Monitoring - Mock Backend

This is a **mock backend** for the Legal Workflow Monitoring & Anomaly Detection Dashboard. It provides endpoints for **workflow stats**, **timeline events**, **active anomalies**, and a **real-time SSE stream**. The backend is Dockerized and fully documented with Swagger.

---

## Features

- Mock endpoints for stats, timeline, and anomalies
- Real-time updates using **Server-Sent Events (SSE)**
- Swagger/OpenAPI documentation for all endpoints
- Docker-ready for easy deployment

---

## Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET    | `/api/stats/overview` | Returns overview metrics: total workflows, average cycle time, SLA compliance, active anomalies |
| GET    | `/api/stats/timeline` | Returns timeline events (last 24 hours) |
| GET    | `/api/stats/anomalies` | Returns active anomalies with type, severity, timestamp |
| GET    | `/events/stream` | SSE: emits new events every 10–20 seconds |

---

## Real-Time Events (SSE)

- Endpoint: `/events/stream`  
- Content-Type: `text/event-stream`  
- Example payload:

```json
{
  "id": 1700000000000,
  "type": "SLA_BREACH",
  "timestamp": "2025-12-06T01:00:00.000Z"
}
```

- Events are emitted **periodically** to simulate real-time workflow changes.

---

## Swagger Documentation

- JSON spec: [http://localhost:3000/api/docs/swagger.json](http://localhost:3000/api/docs/swagger.json)  
- Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)  

All endpoints include **example responses** to make frontend integration simple.

---

## Setup & Run Locally

1. Clone repository:

```bash
git clone <repo-url>
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

- Server runs at [http://localhost:3000](http://localhost:3000)

---

## Docker Setup

1. Build and run backend container:

```bash
docker-compose up --build
```

2. Backend accessible at `http://localhost:3000`

- `Dockerfile` defines the backend image
- `docker-compose.yml` runs the backend service

---

## Environment Variables

| Variable    | Default  | Description        |
|------------|---------|------------------|
| `NITRO_PORT` | `3000` | Port for the server |
| `NODE_ENV`   | `production` | Environment mode |

---

## Notes

- Backend is **mocked** and intended for **frontend dashboard testing**.  
- Real-time events and metrics are generated dynamically using helper functions.  
- Swagger/OpenAPI documentation ensures clarity for frontend integration.
