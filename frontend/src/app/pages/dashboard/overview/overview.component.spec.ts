import { describe, it, beforeEach, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { OverviewComponent } from './overview.component';
import { signal, WritableSignal } from '@angular/core';
import { Overview } from '../dashboard.model';

const mockOverview: Overview = {
  activeAnomaliesCount: 10,
  avgCycleTimeHours: 20,
  slaCompliancePercent: 95,
  totalWorkflowsToday: 150,
};

describe('OverviewComponent', () => {
  let component: OverviewComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;

    (component as any).overview = signal(mockOverview) as WritableSignal<Overview>;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct overview keys', () => {
    expect(Object.keys(component.overview() ?? {})).toEqual([
      'activeAnomaliesCount',
      'avgCycleTimeHours',
      'slaCompliancePercent',
      'totalWorkflowsToday',
    ]);
  });
});
