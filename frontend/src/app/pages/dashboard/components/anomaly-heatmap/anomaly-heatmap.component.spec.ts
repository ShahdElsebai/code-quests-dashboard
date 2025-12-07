import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnomalyHeatmapComponent } from './anomaly-heatmap.component';
import { Anomaly, AnomalySeverity, AnomalyType } from '../../dashboard.model';
import * as echarts from 'echarts';
import { signal } from '@angular/core';

describe('AnomalyHeatmapComponent', () => {
  let fixture: ComponentFixture<AnomalyHeatmapComponent>;
  let component: AnomalyHeatmapComponent;

  const anomalies: Anomaly[] = [
    { id: '1', severity: AnomalySeverity.Low, timestamp: Date.now(), type: AnomalyType.SLA_Breach },
    { id: '2', severity: AnomalySeverity.High, timestamp: Date.now(), type: AnomalyType.Delay },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnomalyHeatmapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnomalyHeatmapComponent);
    component = fixture.componentInstance;

    (component as any).anomalies = signal(anomalies);
    (component as any).activeFilters = signal(new Set<AnomalySeverity>());
    component.anomalySeverity = AnomalySeverity;

    component.anomalyChart = {
      setOption: vi.fn(),
    } as unknown as echarts.ECharts;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit filterChange on checkbox toggle', () => {
    const spy = vi.spyOn(component.filterChange, 'emit');
    component.onFilterChange(AnomalySeverity.Low, true);
    expect(spy).toHaveBeenCalledWith({ severity: AnomalySeverity.Low, checked: true });
  });

  it('should call setOption when chart is updated', () => {
    component.updateChart();
    expect(component.anomalyChart?.setOption).toHaveBeenCalled();
  });
});
