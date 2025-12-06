import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Anomaly, Overview, TimelineEvent, TimelineEventType } from '../../../pages/dashboard/dashboard.model';
import { environment } from '../../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';


@Injectable({ providedIn: 'root' })
export class DashboardService {

  overview = signal<Overview | null>(null);
  timeline = signal<TimelineEvent[]>([]);
  anomalies = signal<Anomaly[]>([]);
  toasts = signal<{ id: string; title: string; message: string; timestamp: Date }[]>([]);

  private eventSource: EventSource | null = null;

  private baseUrl = environment.apiBase;
  private toastr: ToastrService = inject(ToastrService);
  private http: HttpClient = inject(HttpClient);

    getOverview(): void {
    this.http.get<Overview>(`${this.baseUrl}/stats/overview`).subscribe(o => this.overview.set(o));
  }

  getTimeline(): void {
    this.http.get<TimelineEvent[]>(`${this.baseUrl}/stats/timeline`).subscribe(t => this.timeline.set(t));
  }

  getAnomalies(): void {
    this.http.get<Anomaly[]>(`${this.baseUrl}/stats/anomalies`).subscribe(a => this.anomalies.set(a));
  }

  connectSSE(): void {
    if (this.eventSource) return;

    this.eventSource = new EventSource(`${this.baseUrl}/events/stream`);

    this.eventSource.onmessage = (event: MessageEvent<string>) => {
      const data: TimelineEvent = JSON.parse(event.data);
      this.timeline.update(t => [...t, data]);

      if (data.type === TimelineEventType.Anomaly) {
        this.overview.update(o => o ? { ...o, activeAnomalies: o.activeAnomalies + 1 } : null);
        this.showToast('New Anomaly', `Event ${data.type} detected.`);
      }
    };

    this.eventSource.onerror = () => {
      console.error('SSE connection error.');
      this.disconnectSSE();
    };
  }

  disconnectSSE(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  showToast(title: string, message: string): void {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    this.toasts.update(t => [...t, { id, title, message, timestamp }]);
    this.toastr.info(message, title, { timeOut: 3000 });
  }

  dismissToast(id: string): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}