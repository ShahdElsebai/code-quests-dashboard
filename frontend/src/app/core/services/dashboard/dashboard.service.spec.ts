import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DashboardService } from './dashboard.service';
import { Anomaly, Overview, TimelineEvent, TimelineEventType, AnomalySeverity, AnomalyType } from '../../../pages/dashboard/dashboard.model';

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

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: any;
  let toastrMock: any;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    httpMock = {
      get: vi.fn().mockReturnValue({ subscribe: vi.fn(cb => cb(mockOverview)) })
    };
    toastrMock = { info: vi.fn() };
    service = Object.create(DashboardService.prototype);
    (service as any).http = httpMock;
    (service as any).toastr = toastrMock;
    service.overview = service.overview || (() => null);
    service.timeline = service.timeline || (() => []);
    service.anomalies = service.anomalies || (() => []);
    service.toasts = service.toasts || (() => []);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch overview and set signal', () => {
    httpMock.get.mockReturnValueOnce({ subscribe: vi.fn(cb => cb(mockOverview)) });
    service.getOverview();
    expect(service.overview()).toEqual(mockOverview);
  });

  it('should fetch timeline and set signal', () => {
    httpMock.get.mockReturnValueOnce({ subscribe: vi.fn(cb => cb(mockTimeline)) });
    service.getTimeline();
    expect(service.timeline()).toEqual(mockTimeline);
  });

  it('should fetch anomalies and set signal', () => {
    httpMock.get.mockReturnValueOnce({ subscribe: vi.fn(cb => cb(mockAnomalies)) });
    service.getAnomalies();
    expect(service.anomalies()).toEqual(mockAnomalies);
  });

  it('should show toast and update toasts signal', () => {
    service.showToast('Test', 'Message');
    expect(service.toasts().length).toBe(1);
    expect(toastrMock.info).toHaveBeenCalledWith('Message', 'Test', { timeOut: 3000 });
  });

  it('should dismiss toast', () => {
    service.showToast('Test', 'Message');
    const id = service.toasts()[0].id;
    service.dismissToast(id);
    expect(service.toasts().length).toBe(0);
  });
});
