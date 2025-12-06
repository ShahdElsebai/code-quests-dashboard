import { generateTimelineEvents } from '~~/server/utils/mockData';
import type { H3Event } from 'h3';
import { createError, getQuery } from 'h3';

/**
 * @swagger
 * /api/stats/timeline:
 *   get:
 *     summary: Get timeline events
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by event types (comma-separated)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit number of events
 *     responses:
 *       200:
 *         description: List of timeline events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   timestamp:
 *                     type: integer
 *                     example: 1700000000000
 *                   type:
 *                     type: string
 *                     example: "completed"
 */
export default defineEventHandler((event: H3Event) => {
  if (Math.random() < 0.05) throw createError({ statusCode: 500, statusMessage: 'Simulated server error' });

  const query = getQuery(event);
  const limit = query.limit ? Number(query.limit) : undefined;
  const typeFilter = query.type ? String(query.type).split(',') : undefined;

  let events = generateTimelineEvents();
  if (typeFilter) events = events.filter(e => typeFilter.includes(e.type));
  if (limit) events = events.slice(0, limit);

  return events;
});
