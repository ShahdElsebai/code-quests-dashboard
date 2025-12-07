import { Component, input, AfterViewChecked, InputSignal, ChangeDetectionStrategy } from '@angular/core';
import { TimelineEvent, TimelineEventType } from '../dashboard.model';
import * as echarts from 'echarts';

@Component({
  selector: 'app-timeline-chart',
  templateUrl: './timeline-chart.component.html',
  styleUrls: ['./timeline-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineChartComponent implements AfterViewChecked {
  timeline: InputSignal<TimelineEvent[]> = input.required<TimelineEvent[]>();

  timelineChart: echarts.ECharts | null = null;

  ngAfterViewChecked(): void {
    if (!this.timelineChart && document.getElementById('timelineChart')) {
      this.timelineChart = echarts.init(document.getElementById('timelineChart') as HTMLDivElement);
      this.updateTimelineChart();
    }
  }

  updateTimelineChart(): void {
    if (!this.timelineChart) return;
    const data: { value: [number, TimelineEventType]; itemStyle: { color: string } }[] = (this.timeline() ?? []).map((e: TimelineEvent) => ({
      value: [e.timestamp, e.type],
      itemStyle: {
        color: e.type === TimelineEventType.Completed ? 'green' : e.type === TimelineEventType.Pending ? 'yellow' : 'red',
      },
    }));
    this.timelineChart.setOption({
      xAxis: { type: 'time' },
      yAxis: { type: 'category', data: Object.values(TimelineEventType) },
      series: [{ type: 'scatter', data }],
    });
  }
}
