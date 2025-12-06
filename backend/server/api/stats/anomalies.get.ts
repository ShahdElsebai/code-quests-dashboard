import { generateAnomalies } from '~~/server/utils/mockData';
import type { H3Event } from 'h3';
import { createError, getQuery } from 'h3';

/**
 * @swagger
 * /api/stats/anomalies:
 *   get:
 *     summary: Get active anomalies
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by anomaly types (comma-separated)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit number of anomalies
 *     responses:
 *       200:
 *         description: List of anomalies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6"
 *                   type:
 *                     type: string
 *                     example: "sla_breach"
 *                   severity:
 *                     type: string
 *                     example: "high"
 *                   timestamp:
 *                     type: integer
 *                     example: 1700000000000
 */
export default defineEventHandler((event: H3Event) => {
  if (Math.random() < 0.05) throw createError({ statusCode: 500, statusMessage: 'Simulated server error' });

  const query = getQuery(event);
  const limit = query.limit ? Number(query.limit) : undefined;
  const typeFilter = query.type ? String(query.type).split(',') : undefined;

  let anomalies = generateAnomalies();
  if (typeFilter) anomalies = anomalies.filter(a => typeFilter.includes(a.type));
  if (limit) anomalies = anomalies.slice(0, limit);

  return anomalies;
});
