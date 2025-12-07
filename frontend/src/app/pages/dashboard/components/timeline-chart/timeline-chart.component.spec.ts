import { describe, it, beforeEach, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TimelineChartComponent } from './timeline-chart.component';
import { TimelineEvent, TimelineEventType } from '../../dashboard.model';
import { signal } from '@angular/core';

const mockTimeline: TimelineEvent[] = [
  { id: 1, type: TimelineEventType.Anomaly, timestamp: new Date().toISOString() },
  { id: 2, type: TimelineEventType.Completed, timestamp: new Date().toISOString() },
];

describe('TimelineChartComponent', () => {
  let component: TimelineChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineChartComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TimelineChartComponent);
    component = fixture.componentInstance;

    (component as any).timeline = signal(mockTimeline);

    component.timelineChart = { setOption: vi.fn() } as any;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should update chart', () => {
    component.updateTimelineChart();
    expect(component.timelineChart?.setOption).toHaveBeenCalled();
  });
});
