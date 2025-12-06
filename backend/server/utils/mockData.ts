import { randomInt, randomFromArray } from './random';

export function generateOverview() {
  return {
    totalWorkflowsToday: randomInt(120, 350),
    averageCycleTime: randomInt(20, 80),
    slaCompliance: randomInt(80, 99),
    activeAnomalies: randomInt(0, 12),
  };
}

export function generateTimelineEvents() {
  const events = [];
  const types = ['completed', 'pending', 'anomaly'];

  for (let i = 0; i < 40; i++) {
    events.push({
      id: i + 1,
      timestamp: Date.now() - randomInt(0, 24 * 60 * 60 * 1000),
      type: randomFromArray(types),
    });
  }

  return events.sort((a, b) => a.timestamp - b.timestamp);
}

export function generateAnomalies() {
  const severities = ['low', 'medium', 'high'];
  const types = ['sla_breach', 'delay', 'missing_document'];

  return Array.from({ length: randomInt(5, 15) }, () => ({
    id: crypto.randomUUID(),
    type: randomFromArray(types),
    severity: randomFromArray(severities),
    timestamp: Date.now() - randomInt(0, 24 * 60 * 60 * 1000),
  }));
}
