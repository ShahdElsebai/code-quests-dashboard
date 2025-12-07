import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { TimelineChartComponent } from './timeline-chart.component';
import { TimelineEvent, TimelineEventType } from '../dashboard.model';

const mockTimeline: TimelineEvent[] = [
  { id: 1, timestamp: Date.now(), type: TimelineEventType.Completed },
  { id: 2, timestamp: Date.now(), type: TimelineEventType.Pending },
];

@Component({
  selector: 'host-comp',
  template: `<dashboard-timeline-chart [timeline]="timeline"></dashboard-timeline-chart>`,
  standalone: true,
  imports: [TimelineChartComponent]
})
class HostComponent {
  timeline = signal(mockTimeline);
}

describe('TimelineChartComponent (integration)', () => {
  it('should render and accept timeline input signal', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Real-Time Event Timeline');
  });
});
