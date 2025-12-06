import { randomFromArray } from '~~/server/utils/random';
import type { H3Event } from 'h3';

/**
 * @swagger
 * /events/stream:
 *   get:
 *     summary: Stream real-time workflow events via SSE
 *     description: |
 *       Server-Sent Events (SSE) endpoint. Returns a continuous stream of workflow events.
 *       Each event contains an id, type, and timestamp. Events occur every 10–20 seconds.
 *     responses:
 *       200:
 *         description: Event stream
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1700000000000
 *                 type:
 *                   type: string
 *                   example: "SLA_BREACH"
 *                 timestamp:
 *                   type: string
 *                   example: "2025-12-06T01:00:00.000Z"
 */
const events = ['SLA_BREACH', 'CASE_DELAYED', 'WORKFLOW_COMPLETED', 'NEW_CASE_RECEIVED'];

export default defineEventHandler((event: H3Event) => {
  const { req, res } = event.node;
 res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendEvent = () => {
    const data = {
      id: Date.now(),
      type: randomFromArray(events),
      timestamp: new Date().toISOString(),
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send first event immediately
  sendEvent();

  // Send events every 10–20 seconds
  const interval = setInterval(sendEvent, 10000 + Math.random() * 10000);

  // Clear on client disconnect
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });

  // Prevent Nuxt fallback by returning a never-resolving promise
  return new Promise(() => {});
});