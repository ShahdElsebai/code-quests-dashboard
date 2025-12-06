const SEVERITIES = ["low", "medium", "high", "critical"];
const EVENT_TYPES = ["SLA Breach", "Case Delayed", "New Workflow", "Completed", "Pending"];

export function generateOverview() {
  return {
    totalWorkflowsToday: Math.floor(200 + Math.random() * 800),
    avgCycleTimeHours: +(1 + Math.random() * 48).toFixed(1),
    slaCompliancePercent: Math.floor(60 + Math.random() * 40), // 60-99%
    activeAnomaliesCount: Math.floor(Math.random() * 20),
  };
}

/**
 * Generate evenly distributed events for the last 24 hours.
 * Each event: { timestamp: <ms>, type: "completed"|"pending"|"anomaly" }
 */
export function generateTimeline() {
  const now = Date.now();
  const events = [];
  // create 240 events => one every ~6 minutes
  const count = 240;
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * (24 * 60 * 60 * 1000) / count;
    const r = Math.random();
    const type = r < 0.75 ? "completed" : r < 0.9 ? "pending" : "anomaly";
    events.push({ timestamp, type });
  }
  return events;
}

/**
 * Generate a list of recent anomalies (random timestamps in last 48 hours)
 * Each anomaly: { id, type, severity, timestamp, details }
 */
export function generateAnomalies(count = 30) {
  const now = Date.now();
  const list = [];
  for (let i = 0; i < count; i++) {
    const ts = now - Math.floor(Math.random() * 48 * 60 * 60 * 1000);
    list.push({
      id: `anom-${ts}-${i}`,
      type: ["SLA Breach", "Missing Approval", "Document Delay"][Math.floor(Math.random() * 3)],
      severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
      timestamp: ts,
      details: "Auto-generated anomaly for testing"
    });
  }
  // sort newest first
  return list.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Random event broadcaster payload:
 * { id, type, timestamp, meta }
 */
export function generateRandomEvent() {
  return {
    id: `evt-${Date.now()}`,
    type: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)],
    timestamp: Date.now(),
    meta: {
      severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
      note: "Simulated real-time event"
    },
  };
}
