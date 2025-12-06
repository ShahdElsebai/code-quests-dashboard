import { generateOverview } from '~~/server/utils/mockData';
import { createError } from 'h3';

/**
 * @swagger
 * /api/stats/overview:
 *   get:
 *     summary: Get workflow overview stats
 *     responses:
 *       200:
 *         description: Overview stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalWorkflowsToday:
 *                   type: integer
 *                   example: 230
 *                 averageCycleTime:
 *                   type: integer
 *                   example: 45
 *                 slaCompliance:
 *                   type: integer
 *                   example: 92
 *                 activeAnomalies:
 *                   type: integer
 *                   example: 4
 */
export default defineEventHandler(() => {
  if (Math.random() < 0.05) throw createError({ statusCode: 500, statusMessage: 'Simulated server error' });
  return generateOverview();
});
