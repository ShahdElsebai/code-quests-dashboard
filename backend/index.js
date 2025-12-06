import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import {
  generateOverview,
  generateTimeline,
  generateAnomalies,
  generateRandomEvent,
} from "./data/mockData.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SIMULATE_ERRORS = process.env.SIMULATE_ERRORS === "1" || false;

// ---- Swagger/OpenAPI setup ----
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Legal Dashboard Mock API",
      version: "1.0.0",
      description:
        "Mock API for the Legal Workflow Monitoring & Anomaly Detection Dashboard (SSE + REST).",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---- In-memory SSE clients list ----
let sseClients = [];

/**
 * @openapi
 * /api/stats/overview:
 *   get:
 *     summary: Get overview statistics
 *     description: Returns totals and aggregated overview metrics.
 *     responses:
 *       200:
 *         description: Overview JSON
 */
app.get("/api/stats/overview", (req, res) => {
  if (SIMULATE_ERRORS && Math.random() < 0.05) {
    return res.status(500).json({ message: "Simulated server error" });
  }
  res.json(generateOverview());
});

/**
 * @openapi
 * /api/stats/timeline:
 *   get:
 *     summary: Get timeline events for the past 24 hours
 *     responses:
 *       200:
 *         description: Array of timeline events (timestamp + type)
 */
app.get("/api/stats/timeline", (req, res) => {
  if (SIMULATE_ERRORS && Math.random() < 0.05) {
    return res.status(500).json({ message: "Simulated server error" });
  }
  res.json(generateTimeline());
});

/**
 * @openapi
 * /api/stats/anomalies:
 *   get:
 *     summary: Get recent anomalies list
 *     responses:
 *       200:
 *         description: Array of anomalies (type, severity, timestamp)
 */
app.get("/api/stats/anomalies", (req, res) => {
  if (SIMULATE_ERRORS && Math.random() < 0.05) {
    return res.status(500).json({ message: "Simulated server error" });
  }
  res.json(generateAnomalies());
});

/**
 * @openapi
 * /api/events/stream:
 *   get:
 *     summary: Server-Sent Events stream of live events
 *     description: Connect to this endpoint to receive a new event every 10-20 seconds.
 *     responses:
 *       200:
 *         description: SSE stream
 */

app.get('/api/events/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = () => {
    const event = { id: Date.now(), timestamp: Date.now(), type: 'anomaly' };
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  const interval = setInterval(sendEvent, 5000);

  req.on('close', () => clearInterval(interval));
  // Do NOT call res.end()
});

// ---- SSE broadcaster: emit random event every 10-20 seconds ----
function emitEventToClients(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch (err) {
      // ignore write errors; client may have disconnected
    }
  });
}

// schedule randomized intervals between 10-20s
function scheduleNextEmit() {
  const ms = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;
  setTimeout(() => {
    const event = generateRandomEvent();
    emitEventToClients(event);
    scheduleNextEmit();
  }, ms);
}
// start broadcasting loop
scheduleNextEmit();

app.get("/", (req, res) => {
  res.send(
    "<h3>Legal Dashboard Mock API</h3><p>Swagger UI: <a href='/docs'>/docs</a></p><p>SSE stream: /events/stream</p>"
  );
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});
