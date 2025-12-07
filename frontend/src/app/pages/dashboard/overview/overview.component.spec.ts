import { Component, signal } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { OverviewComponent } from './overview.component';
import { Overview } from '../dashboard.model';
import { TestBed } from '@angular/core/testing';

const mockOverview: Overview = {
  totalWorkflowsToday: 10,
  avgCycleTimeHours: 5,
  slaCompliancePercent: 99,
  activeAnomaliesCount: 2,
};

@Component({
  selector: 'host-comp',
  template: `<dashboard-overview [overview]="overview" [overviewKeys]="overviewKeys" [getOverviewKeyLabel]="getOverviewKeyLabel"></dashboard-overview>`,
  standalone: true,
  imports: [OverviewComponent],
})
class HostComponent {
  overview = signal(mockOverview);
  overviewKeys = [
    'totalWorkflowsToday',
    'avgCycleTimeHours',
    'slaCompliancePercent',
    'activeAnomaliesCount',
  ];
  getOverviewKeyLabel = (key: keyof Overview) => key;
}

describe('OverviewComponent', () => {
  it('should create the component', () => {
    const component = new OverviewComponent();
    expect(component).toBeTruthy();
  });

  it('should accept overview input signal (using any for test)', () => {
    const component = new OverviewComponent();
    (component.overview as any).set(mockOverview);
    expect(component.overview()).toEqual(mockOverview);
  });

  it('should accept overviewKeys input', () => {
    const component = new OverviewComponent();
    component.overviewKeys = ['totalWorkflowsToday'];
    expect(component.overviewKeys).toContain('totalWorkflowsToday');
  });
});

describe('OverviewComponent (integration)', () => {
  it('should render overview values from signal input', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('10');
    expect(el.textContent).toContain('5');
    expect(el.textContent).toContain('99');
    expect(el.textContent).toContain('2');
  });
});
