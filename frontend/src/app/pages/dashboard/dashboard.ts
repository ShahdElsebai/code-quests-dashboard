import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  WritableSignal,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Anomaly, AnomalySeverity, Overview, TimelineEvent } from './dashboard.model';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';
import { OverviewComponent } from './overview/overview.component';
import { TimelineChartComponent } from './timeline-chart/timeline-chart.component';
import { VolumeChartComponent } from './volume-chart/volume-chart.component';
import { TitleCasePipe } from '@angular/common';
import * as echarts from 'echarts';
@Component({
  selector: 'app-dashboard',
  imports: [ OverviewComponent, TimelineChartComponent, VolumeChartComponent, TitleCasePipe],
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

  anomalyChart: echarts.ECharts | null = null;
  

  dashboardService: DashboardService = inject(DashboardService);

  anomalySeverity: typeof AnomalySeverity = AnomalySeverity;

  constructor() {
    // Bind service signals to component reactively
    effect(() => this.overview.set(this.dashboardService.overview()));
    effect(() => {
      this.timeline.set(this.dashboardService.timeline());
    });
    effect(() => {
      const data: Anomaly[] = this.dashboardService.anomalies();
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
     this.anomalyChart = echarts.init(document.getElementById('anomalyChart') as HTMLDivElement);
    
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
