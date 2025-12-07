import { describe, it, beforeEach, expect, vi } from 'vitest';
import { VolumeChartComponent } from './volume-chart.component';
import { signal, WritableSignal } from '@angular/core';
import { TimelineEvent, TimelineEventType } from '../dashboard.model';

const mockTimeline: TimelineEvent[] = [
  { id: 1, type: TimelineEventType.Anomaly, timestamp: new Date().toISOString() },
  { id: 2, type: TimelineEventType.Completed, timestamp: new Date().toISOString() },
];

describe('VolumeChartComponent', () => {
  let component: VolumeChartComponent;

  beforeEach(() => {
    component = new VolumeChartComponent();

    (component as any)._timeline = signal(mockTimeline) as WritableSignal<TimelineEvent[]>;

    component.volumeChart = { setOption: vi.fn() } as any;
  });

  it('should update chart when timeline changes', () => {
    component.updateVolumeChart();
    expect(component.volumeChart?.setOption).toHaveBeenCalled();
  });
});
