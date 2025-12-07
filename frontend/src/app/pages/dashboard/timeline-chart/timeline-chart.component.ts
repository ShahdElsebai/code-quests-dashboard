import {
  Component,
  input,
  AfterViewInit,
  InputSignal,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { TimelineEvent, TimelineEventType, AnomalySeverity } from '../dashboard.model';
import * as echarts from 'echarts';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-timeline-chart',
  templateUrl: './timeline-chart.component.html',
  styleUrls: ['./timeline-chart.component.scss'],
  imports: [TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TimelineChartComponent implements AfterViewInit, OnChanges {
  timeline: InputSignal<TimelineEvent[]> = input.required<TimelineEvent[]>();
  activeFilters: InputSignal<Set<AnomalySeverity | TimelineEventType> | undefined> =
    input<Set<AnomalySeverity | TimelineEventType>>();
  timeLineEvent: typeof TimelineEventType = TimelineEventType;

  @Output() filterChange: EventEmitter<{ timeline: TimelineEventType; checked: boolean }> = new EventEmitter<{
    timeline: TimelineEventType;
    checked: boolean;
  }>();

  @ViewChild('timelineChartContainer', { static: false }) timelineChartContainer!: ElementRef<HTMLDivElement>;
  timelineChart: echarts.ECharts | null = null;

  ngAfterViewInit(): void {
    this.initChart();
    this.updateTimelineChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['timeline'] || changes['activeFilters']) {
      this.updateTimelineChart();
    }
  }

  initChart(): void {
    if (!this.timelineChart && this.timelineChartContainer) {
      this.timelineChart = echarts.init(this.timelineChartContainer.nativeElement);
    }
  }

  updateTimelineChart(): void {
    if (!this.timelineChart) return;

    const filters: Set<AnomalySeverity | TimelineEventType> = this.activeFilters() ?? new Set<TimelineEventType>();
    const data: { value: [number, TimelineEventType]; itemStyle: { color: string } }[] = (this.timeline() ?? [])
      .filter((e: TimelineEvent) => !filters.has(e.type))
      .map((e: TimelineEvent) => ({
        value: [new Date(e.timestamp).getTime(), e.type],
        itemStyle: {
          color:
            e.type === TimelineEventType.Completed ? 'green' : e.type === TimelineEventType.Pending ? 'yellow' : 'red',
        },
      }));

    this.timelineChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const date: Date = new Date(params.value[0]);
          return `Time: ${date.toLocaleTimeString()}<br/>Type: ${params.value[1]}`;
        },
      },
      xAxis: { type: 'time' },
      yAxis: { type: 'category', data: Object.values(TimelineEventType) },
      series: [{ type: 'scatter', data }],
      dataZoom: [{ type: 'slider', xAxisIndex: 0, start: 80, end: 100 }],
    });

    if (data.length > 0) {
      this.timelineChart.dispatchAction({ type: 'dataZoom', start: Math.max(0, 100 - 20), end: 100 });
    }
  }

  onFilterChange(type: TimelineEventType, checked: boolean): void {
    this.filterChange.emit({ timeline: type, checked });
  }
}
