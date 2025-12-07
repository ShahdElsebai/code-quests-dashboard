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
import { Anomaly, AnomalySeverity, Overview, TimelineEvent, TimelineEventType } from './dashboard.model';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';
import { OverviewComponent } from './overview/overview.component';
import { TimelineChartComponent } from './timeline-chart/timeline-chart.component';
import { VolumeChartComponent } from './volume-chart/volume-chart.component';
import { AnomalyHeatmapComponent } from './anomaly-heatmap/anomaly-heatmap.component';
@Component({
  selector: 'app-dashboard',
  imports: [OverviewComponent, TimelineChartComponent, VolumeChartComponent, AnomalyHeatmapComponent],
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
  activeFilters: Set<AnomalySeverity | TimelineEventType> = new Set();

  dashboardService: DashboardService = inject(DashboardService);

  anomalySeverity: typeof AnomalySeverity = AnomalySeverity;

  constructor() {
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
    });
  }

  ngOnInit(): void {
    this.refreshAll();

    if (this.liveUpdates()) this.dashboardService.connectSSE();
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

  refreshAll(): void {
    this.dashboardService.getOverview();
    this.dashboardService.getTimeline();
    this.dashboardService.getAnomalies();
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

  filterTimeline(type: TimelineEventType, checked: boolean) {
    if (checked) {
      this.activeFilters.delete(type);
    } else {
      this.activeFilters.add(type);
    }
    const filtered = this.dashboardService.timeline().filter(
      (e) => !this.activeFilters.has(e.type)
    );
    this.timeline.set(filtered);
  }
}