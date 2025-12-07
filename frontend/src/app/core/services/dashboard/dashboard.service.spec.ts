import { describe, it, beforeEach, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AnomalySeverity, TimelineEventType } from '../../../pages/dashboard/dashboard.model';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: any;
  let toastrMock: any;

  const mockOverview = { activeAnomaliesCount: 10 };
  const mockTimeline = [{ timestamp: Date.now(), type: TimelineEventType.Completed }];
  const mockAnomalies = [{ id: 1, severity: AnomalySeverity.High }];

  beforeEach(() => {
    httpMock = { get: vi.fn() };
    toastrMock = { info: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        { provide: HttpClient, useValue: httpMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    });

    service = TestBed.inject(DashboardService);
  });

  it('should fetch overview and set signal', () => {
    httpMock.get.mockReturnValue(of(mockOverview));
    service.getOverview();
    expect(service.overview()).toEqual(mockOverview);
  });

  it('should fetch timeline and set signal', () => {
    httpMock.get.mockReturnValue(of(mockTimeline));
    service.getTimeline();
    expect(service.timeline()).toEqual(mockTimeline);
  });

  it('should fetch anomalies and set signal', () => {
    httpMock.get.mockReturnValue(of(mockAnomalies));
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
