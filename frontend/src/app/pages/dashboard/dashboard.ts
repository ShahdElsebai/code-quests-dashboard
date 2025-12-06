import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  effect,
  ChangeDetectionStrategy,
  WritableSignal,
} from '@angular/core';
import { Anomaly, AnomalySeverity, Overview, TimelineEvent, TimelineEventType } from './dashboard.model';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';
import * as echarts from 'echarts';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [TitleCasePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit, OnDestroy {
  overview: WritableSignal<Overview | null> = signal<Overview | null>(null);
  timeline: WritableSignal<TimelineEvent[]> = signal<TimelineEvent[]>([]);
  anomalies: WritableSignal<Anomaly[]> = signal<Anomaly[]>([]);
  darkMode: WritableSignal<boolean> = signal(false);
  liveUpdates: WritableSignal<boolean> = signal(true);
  originalAnomalies: Anomaly[] = [];
  activeFilters: Set<AnomalySeverity> = new Set<AnomalySeverity>();

  timelineChart: echarts.ECharts | null = null;
  anomalyChart: echarts.ECharts | null = null;
  volumeChart: echarts.ECharts | null = null;

  dashboardService: DashboardService = inject(DashboardService);

  overviewKeys: (keyof Overview)[] = [
    'totalWorkflowsToday',
    'avgCycleTimeHours',
    'slaCompliancePercent',
    'activeAnomaliesCount',
  ];
  anomalySeverity: typeof AnomalySeverity = AnomalySeverity;

  constructor() {
    // Bind service signals to component reactively
    effect(() => this.overview.set(this.dashboardService.overview()));
    effect(() => {
      this.timeline.set(this.dashboardService.timeline());
      this.updateTimelineChart();
      this.updateVolumeChart();
    });
    effect(() => {
      const data = this.dashboardService.anomalies();
      this.originalAnomalies = data;

      if (this.activeFilters.size > 0) {
        const filtered: Anomaly[] = data.filter((a: Anomaly) => !this.activeFilters.has(a.severity));
        this.anomalies.set(filtered);
      } else {
        this.anomalies.set(data);
      }

      this.updateAnomalyChart();
    });
  }

  ngOnInit(): void {
    this.dashboardService.getOverview();
    this.dashboardService.getTimeline();
    this.dashboardService.getAnomalies();

    // Connect SSE only if liveUpdates is true
    if (this.liveUpdates()) this.dashboardService.connectSSE();

    this.timelineChart = echarts.init(document.getElementById('timelineChart') as HTMLDivElement);
    this.anomalyChart = echarts.init(document.getElementById('anomalyChart') as HTMLDivElement);
    this.volumeChart = echarts.init(document.getElementById('volumeChart') as HTMLDivElement);
  }

  ngOnDestroy(): void {
    this.dashboardService.disconnectSSE();
  }

  toggleDarkMode(): void {
    this.darkMode.set(!this.darkMode());
  }

  toggleLiveUpdates(): void {
    this.liveUpdates.set(!this.liveUpdates());

    if (this.liveUpdates()) {
      this.dashboardService.connectSSE();
    } else {
      this.dashboardService.disconnectSSE();
    }
  }

  getOverviewKeyLabel(key: keyof Overview): string {
    const labels: Record<keyof Overview, string> = {
      totalWorkflowsToday: 'Total Workflows Today',
      avgCycleTimeHours: 'Avg. Cycle Time (Hours)',
      slaCompliancePercent: 'SLA Compliance (%)',
      activeAnomaliesCount: 'Active Anomalies',
    };
    return labels[key] || key;
  }
  private updateTimelineChart(): void {
    if (!this.timelineChart) return;

    const data: {
      value: (number | TimelineEventType)[];
      itemStyle: {
        color: string;
      };
    }[] = this.timeline().map((e: TimelineEvent) => ({
      value: [e.timestamp, e.type],
      itemStyle: {
        color:
          e.type === TimelineEventType.Completed ? 'green' : e.type === TimelineEventType.Pending ? 'yellow' : 'red',
      },
    }));

    this.timelineChart.setOption({
      xAxis: { type: 'time' },
      yAxis: { type: 'category', data: Object.values(TimelineEventType) },
      series: [{ type: 'scatter', data }],
    });
  }

  private updateAnomalyChart(): void {
    if (!this.anomalyChart) return;

    const hours: number[] = Array.from({ length: 24 }, (_: unknown, i: number) => i);
    const severityLevels: AnomalySeverity[] = Object.values(AnomalySeverity);

    const seriesData: number[][] = this.anomalies().map((anomaly: Anomaly) => {
      const hour: number = new Date(anomaly.timestamp).getHours();
      const severityIndex: number = severityLevels.indexOf(anomaly.severity);
      return [hour, severityIndex, 1];
    });

    this.anomalyChart.setOption({
      xAxis: { typec: 'category', data: hours },
      yAxis: { type: 'category', data: severityLevels },
      visualMap: {
        min: 0,
        max: 1,
        show: false,
        inRange: { color: ['green', 'yellow', 'red'] },
      },
      series: [{ type: 'heatmap', data: seriesData }],
    });
  }

  private updateVolumeChart(): void {
    if (!this.volumeChart) return;

    const hours: number[] = Array.from({ length: 24 }, (_: unknown, i: number) => i);
    const counts: number[] = hours.map(
      (h: number) => this.timeline().filter((e: TimelineEvent) => new Date(e.timestamp).getHours() === h).length
    );

    this.volumeChart.setOption({
      xAxis: { type: 'category', data: hours },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: counts }],
    });
  }

  filterAnomaliesBySeverity(severity: AnomalySeverity, checked: boolean): void {
    if (checked) {
      this.activeFilters.delete(severity);
    } else {
      this.activeFilters.add(severity);
    }

    const filtered: Anomaly[] = this.originalAnomalies.filter((a: Anomaly) => !this.activeFilters.has(a.severity));
    this.anomalies.set(filtered);
  }
}
