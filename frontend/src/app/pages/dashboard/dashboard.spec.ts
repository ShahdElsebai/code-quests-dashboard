import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Dashboard } from './dashboard';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';
import { AnomalySeverity, Overview, TimelineEvent, Anomaly, TimelineEventType, AnomalyType } from './dashboard.model';

const mockOverview: Overview = {
  totalWorkflowsToday: 10,
  avgCycleTimeHours: 5,
  slaCompliancePercent: 99,
  activeAnomaliesCount: 2,
};

const mockTimeline: TimelineEvent[] = [
  { id: 1, timestamp: Date.now(), type: TimelineEventType.Completed },
  { id: 2, timestamp: Date.now(), type: TimelineEventType.Pending },
];

const mockAnomalies: Anomaly[] = [
  { id: '1', timestamp: Date.now(), severity: AnomalySeverity.High, type: AnomalyType.SLA_Breach },
  { id: '2', timestamp: Date.now(), severity: AnomalySeverity.Low, type: AnomalyType.SLA_Breach },
];

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let dashboardService: DashboardService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    dashboardService = {
      overview: vi.fn(() => mockOverview),
      timeline: vi.fn(() => mockTimeline),
      anomalies: vi.fn(() => mockAnomalies),
      getOverview: vi.fn(),
      getTimeline: vi.fn(),
      getAnomalies: vi.fn(),
      connectSSE: vi.fn(),
      disconnectSSE: vi.fn(),
    } as any;
    component.dashboardService = dashboardService;
    component.originalAnomalies = mockAnomalies;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle dark mode', () => {
    component.darkMode.set(false);
    component.toggleDarkMode();
    expect(component.darkMode()).toBe(true);
  });

  it('should toggle live updates and call connect/disconnect', () => {
    component.liveUpdates.set(false);
    component.toggleLiveUpdates();
    expect(component.liveUpdates()).toBe(true);
    expect(dashboardService.connectSSE).toHaveBeenCalled();
    component.toggleLiveUpdates();
    expect(component.liveUpdates()).toBe(false);
    expect(dashboardService.disconnectSSE).toHaveBeenCalled();
  });

  // it('should filter anomalies by severity', () => {
  //   component.filteredaSeverities = new Set([AnomalySeverity.High]);
  //   component.filterAnomaliesBySeverity(AnomalySeverity.High, false);
  //   expect(component.anomalies().length).toBe(1);
  //   expect(component.anomalies()[0].severity).toBe(AnomalySeverity.Low);
  // });
});
