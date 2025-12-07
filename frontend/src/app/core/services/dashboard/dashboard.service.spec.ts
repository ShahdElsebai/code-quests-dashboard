import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastrService } from 'ngx-toastr';
import { DestroyRef } from '@angular/core';
import { Overview, AnomalySeverity, TimelineEventType } from '../../../pages/dashboard/dashboard.model';
import { DashboardService } from './dashboard.service';

const mockOverview: Overview = { totalWorkflowsToday: 10, avgCycleTimeHours: 5, slaCompliancePercent: 99, activeAnomaliesCount: 2 };

const mockTimeline = [{ timestamp: Date.now(), type: TimelineEventType.Completed }];
const mockAnomalies = [{ id: 1, severity: AnomalySeverity.High }];


describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;
  let toastrService: ToastrService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DashboardService,
        { provide: ToastrService, useValue: { error: vi.fn(), info: vi.fn() } },
        DestroyRef
      ],
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
    toastrService = TestBed.inject(ToastrService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch overview and set signal', () => {
    service.getOverview();

    const req = httpMock.expectOne(`${service['baseUrl']}/stats/overview`);
    expect(req.request.method).toBe('GET');

    req.flush(mockOverview);

    expect(service.overview()).toEqual(mockOverview);
    expect(toastrService.error).not.toHaveBeenCalled();
  });

  it('should fetch timeline and set signal', () => {
    service.getTimeline();

    const req = httpMock.expectOne(`${service['baseUrl']}/stats/timeline`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTimeline);

    expect(service.timeline()).toEqual(mockTimeline);
  });

  it('should fetch anomalies and set signal', () => {
    service.getAnomalies();

    const req = httpMock.expectOne(`${service['baseUrl']}/stats/anomalies`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAnomalies);

    expect(service.anomalies()).toEqual(mockAnomalies);
  });

  it('should show toast and update toasts signal', () => {
    service.showToast('Test Title', 'Test Message');
    expect(service.toasts().length).toBe(1);
    expect(toastrService.info).toHaveBeenCalledWith('Test Message', 'Test Title', { timeOut: 3000 });
  });

  it('should dismiss toast', () => {
    service.showToast('Test Title', 'Test Message');
    const id = service.toasts()[0].id;
    service.dismissToast(id);
    expect(service.toasts().length).toBe(0);
  });
});
