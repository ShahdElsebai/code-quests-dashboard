import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  input,
  InputSignal,
} from '@angular/core';
import { Anomaly, AnomalySeverity } from '../dashboard.model';
import * as echarts from 'echarts';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-anomaly-heatmap',
  standalone: true,
  templateUrl: './anomaly-heatmap.component.html',
  styleUrls: ['./anomaly-heatmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TitleCasePipe],
})
export class AnomalyHeatmapComponent implements OnChanges, AfterViewInit {
  anomalies: InputSignal<Anomaly[] | undefined> = input<Anomaly[]>();
  activeFilters: InputSignal<Set<AnomalySeverity> | undefined> = input<Set<AnomalySeverity>>();
  anomalySeverity: typeof AnomalySeverity = AnomalySeverity;
  @Output() filterChange: EventEmitter<{
    severity: AnomalySeverity;
    checked: boolean;
  }> = new EventEmitter<{ severity: AnomalySeverity; checked: boolean }>();

  @ViewChild('anomalyChartContainer', { static: false }) anomalyChartContainer!: ElementRef<HTMLDivElement>;
  anomalyChart: echarts.ECharts | null = null;

  ngAfterViewInit(): void {
    this.initChart();
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['anomalies']) {
      this.updateChart();
    }
  }

  initChart(): void {
    if (!this.anomalyChart && this.anomalyChartContainer) {
      this.anomalyChart = echarts.init(this.anomalyChartContainer.nativeElement);
    }
  }

  updateChart(): void {
    if (!this.anomalyChart) return;
    const hours: number[] = Array.from({ length: 24 }, (_: unknown, i: number) => i);
    const severityLevels: AnomalySeverity[] = Object.values(this.anomalySeverity ?? AnomalySeverity);
    const seriesData: number[][] = (this.anomalies() ?? []).map((anomaly: Anomaly) => {
      const hour: number = new Date(anomaly.timestamp).getHours();
      const severityIndex: number = severityLevels.indexOf(anomaly.severity);
      return [hour, severityIndex, 1];
    });
    this.anomalyChart.setOption({
      xAxis: { type: 'category', data: hours },
      yAxis: { type: 'category', data: severityLevels },
      visualMap: [
        {
          min: 0,
          max: 1,
          show: false,
          inRange: { color: ['green', 'yellow', 'red'] },
        },
      ],
      series: [{ type: 'heatmap', data: seriesData }],
    });
  }

  onFilterChange(severity: AnomalySeverity, checked: boolean): void {
    this.filterChange.emit({ severity, checked });
  }
}
