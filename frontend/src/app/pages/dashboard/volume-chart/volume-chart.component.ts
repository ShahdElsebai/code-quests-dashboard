import { Component, Input, signal, WritableSignal, AfterViewChecked, ChangeDetectionStrategy } from '@angular/core';
import { TimelineEvent } from '../dashboard.model';
import * as echarts from 'echarts';

@Component({
  selector: 'app-volume-chart',
  templateUrl: './volume-chart.component.html',
  styleUrls: ['./volume-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VolumeChartComponent implements AfterViewChecked {
  private _timeline: WritableSignal<TimelineEvent[]> = signal<TimelineEvent[]>([]);
  @Input() set timeline(value: TimelineEvent[]) {
    this._timeline.set(value);
    this.updateVolumeChart();
  }
  get timelineSignal(): WritableSignal<TimelineEvent[]> {
    return this._timeline;
  }

  volumeChart: echarts.ECharts | null = null;


  ngAfterViewChecked(): void {
    if (!this.volumeChart && document.getElementById('volumeChart')) {
      this.volumeChart = echarts.init(document.getElementById('volumeChart') as HTMLDivElement);
      this.updateVolumeChart();
    }
  }
  updateVolumeChart(): void {
    if (!this.volumeChart) return;
    const hours: number[] = Array.from({ length: 24 }, (_: unknown, i: number) => i);
    const counts: number[] = hours.map((h: number) => this._timeline().filter((e: TimelineEvent) => new Date(e.timestamp).getHours() === h).length);
    this.volumeChart.setOption({
      xAxis: { type: 'category', data: hours },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: counts }],
    });
  }
}
