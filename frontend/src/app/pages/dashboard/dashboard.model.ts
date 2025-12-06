export interface Overview {
  totalWorkflowsToday: number;
  avgCycleTimeHours: number;
  slaCompliancePercent: number;
  activeAnomaliesCount: number;
}

export enum TimelineEventType {
  Completed = 'completed',
  Pending = 'pending',
  Anomaly = 'anomaly'
}

export interface TimelineEvent {
  id: number;
  timestamp: number;
  type: TimelineEventType;
}

export enum AnomalySeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

export enum AnomalyType {
  SLA_Breach = 'sla_breach',
  Delay = 'delay',
  Missing_Document = 'missing_document'
}

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  timestamp: number;
}
