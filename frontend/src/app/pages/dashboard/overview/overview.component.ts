import { Component, Input, signal, WritableSignal, input, InputSignal } from '@angular/core';
import { Overview } from '../dashboard.model';

@Component({
  selector: 'dashboard-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent {
  overview: InputSignal<Overview | null> = input.required<Overview | null>();

    getOverviewKeyLabel(key: keyof Overview): string {
      const labels: Record<keyof Overview, string> = {
        totalWorkflowsToday: 'Total Workflows Today',
        avgCycleTimeHours: 'Avg. Cycle Time (Hours)',
        slaCompliancePercent: 'SLA Compliance (%)',
        activeAnomaliesCount: 'Active Anomalies',
      };
      return labels[key] || key;
    }
    overviewKeys: (keyof Overview)[] = [
        'totalWorkflowsToday',
        'avgCycleTimeHours',
        'slaCompliancePercent',
        'activeAnomaliesCount',
      ];
}
