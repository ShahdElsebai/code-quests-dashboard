import { Component, inject, OnInit, OnDestroy, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { Anomaly, AnomalySeverity, Overview, TimelineEvent, TimelineEventType } from './dashboard.model';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, TitleCasePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit, OnDestroy {
  overview = signal<Overview | null>(null);
  timeline = signal<TimelineEvent[]>([]);
  anomalies = signal<Anomaly[]>([]);
  darkMode = signal(false);
  liveUpdates = signal(true);
  private originalAnomalies: Anomaly[] = [];
  private activeFilters = new Set<AnomalySeverity>();

  timelineChart: echarts.ECharts | null = null;
  anomalyChart: echarts.ECharts | null = null;
  volumeChart: echarts.ECharts | null = null;

  dashboardService: DashboardService = inject(DashboardService);

  overviewKeys: (keyof Overview)[] = [
    'totalWorkflowsToday',
    'averageCycleTime',
    'slaCompliance',
    'activeAnomalies'
  ];
  anomalySeverity: typeof AnomalySeverity = AnomalySeverity;

  constructor() {
    // Bind component signals to service signals reactively
    effect(() => {
      this.overview.set(this.dashboardService.overview());
    });
    effect(() => {
      this.timeline.set(this.dashboardService.timeline());
      this.updateTimelineChart();
      this.updateVolumeChart();
    });
    effect(() => {
      const data = this.dashboardService.anomalies();

      // Always store raw data
      this.originalAnomalies = data;

      // If filters are active → keep filtered view
      if (this.activeFilters.size > 0) {
        const filtered = data.filter(a => !this.activeFilters.has(a.severity));
        this.anomalies.set(filtered);
      } else {
        // No filters → show all
        this.anomalies.set(data);
      }

      this.updateAnomalyChart();
    });

  }
  ngOnInit(): void {
    this.dashboardService.getOverview();
    this.dashboardService.getTimeline();
    this.dashboardService.getAnomalies();
    this.dashboardService.connectSSE();

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
    if (this.liveUpdates()) this.dashboardService.connectSSE();
    else this.dashboardService.disconnectSSE();
  }

  private updateCharts(): void {
    this.updateTimelineChart();
    this.updateAnomalyChart();
    this.updateVolumeChart();
  }

  private updateTimelineChart(): void {
    if (!this.timelineChart) return;
    const data = this.timeline().map(e => ({
      value: [e.timestamp, e.type],
      itemStyle: { color: e.type === TimelineEventType.Completed ? 'green' : e.type === TimelineEventType.Pending ? 'yellow' : 'red' }
    }));

    this.timelineChart.setOption({
      xAxis: { type: 'time' },
      yAxis: { type: 'category', data: Object.values(TimelineEventType) },
      series: [{ type: 'scatter', data }]
    });
  }

  private updateAnomalyChart(): void {
    if (!this.anomalyChart) return;

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const severityLevels = Object.values(AnomalySeverity);

    const seriesData = this.anomalies().map(anomaly => {
      const hour = new Date(anomaly.timestamp).getHours();
      const severityIndex = severityLevels.indexOf(anomaly.severity);
      return [hour, severityIndex, 1]; // <- IMPORTANT FIX
    });

    this.anomalyChart.setOption({
      xAxis: { type: 'category', data: hours },
      yAxis: { type: 'category', data: severityLevels },

      visualMap: {
        min: 0,
        max: 1,
        show: false,
        inRange: { color: ['green', 'yellow', 'red'] }
      },

      series: [
        {
          type: 'heatmap',
          data: seriesData,
        }
      ]
    });
  }

  private updateVolumeChart(): void {
    if (!this.volumeChart) return;
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const counts = hours.map(h => this.timeline().filter(e => new Date(e.timestamp).getHours() === h).length);

    this.volumeChart.setOption({
      xAxis: { type: 'category', data: hours },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: counts }]
    });
  }


  filterAnomaliesBySeverity(severity: AnomalySeverity, checked: boolean): void {
    if (checked) {
      this.activeFilters.delete(severity);
    } else {
      this.activeFilters.add(severity);
    }

    const filtered = this.originalAnomalies.filter(a => !this.activeFilters.has(a.severity));
    this.anomalies.set(filtered);
  }

}