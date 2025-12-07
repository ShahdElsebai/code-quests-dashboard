import { DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Anomaly, Overview, TimelineEvent, TimelineEventType } from '../../../pages/dashboard/dashboard.model';
import { environment } from '../../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  overview: WritableSignal<Overview | null> = signal<Overview | null>(null);
  timeline: WritableSignal<TimelineEvent[]> = signal<TimelineEvent[]>([]);
  anomalies: WritableSignal<Anomaly[]> = signal<Anomaly[]>([]);
  toasts: WritableSignal<{ id: string; title: string; message: string; timestamp: Date }[]> = signal([]);

  private eventSource: EventSource | null = null;
  private reconnectTimeout: number | null = null;
  private baseUrl: string = environment.apiBase;
  private toastr: ToastrService = inject(ToastrService);
  private http: HttpClient = inject(HttpClient);
  private destroyRef: DestroyRef = inject(DestroyRef);

  getOverview(): void {
    this.http.get<Overview>(`${this.baseUrl}/stats/overview`).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (o: Overview) => this.overview.set(o),
      error: (err: Error) => {
        this.toastr.error(err.message, 'Overview Fetch Error');
        this.overview.set(null);
      },
    });
  }

  getTimeline(): void {
    this.http.get<TimelineEvent[]>(`${this.baseUrl}/stats/timeline`).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (t: TimelineEvent[]) => this.timeline.set(t),
      error: (err: Error) => {
        this.toastr.error(err.message, 'Timeline Fetch Error');
        this.timeline.set([]);
      },
    });
  }

  getAnomalies(): void {
    this.http.get<Anomaly[]>(`${this.baseUrl}/stats/anomalies`).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (a: Anomaly[]) => this.anomalies.set(a),
      error: (err: Error) => {
        this.toastr.error(err.message, 'Anomalies Fetch Error');
        this.anomalies.set([]);
      },
    });
  }

  connectSSE(): void {
    if (this.eventSource) return;

    const connect: () => void = (): void => {
      this.eventSource = new EventSource(`${this.baseUrl}/events/stream`);

      this.eventSource.onmessage = (event: MessageEvent<string>): void => {
        const data: TimelineEvent = JSON.parse(event.data);
        this.timeline.update((t: TimelineEvent[]) => [...t, data]);

        if (data.type === TimelineEventType.Anomaly) {
          this.overview.update((o: Overview | null) =>
            o ? { ...o, activeAnomaliesCount: o.activeAnomaliesCount + 1 } : null
          );
          this.showToast('New Anomaly', `Event ${data.type} detected.`);
        }
      };

      this.eventSource.onerror = (): void => {
        console.error('SSE connection error. Reconnecting in 2s...');
        this.disconnectSSE();
        setTimeout(connect, 2000);
      };
    };

    connect();
  }

  disconnectSSE(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  showToast(title: string, message: string): void {
    const id: string = crypto.randomUUID();
    const timestamp: Date = new Date();
    this.toasts.update((t: { id: string; title: string; message: string; timestamp: Date }[]) => [
      ...t,
      { id, title, message, timestamp },
    ]);
    this.toastr.info(message, title, { timeOut: 3000 });
  }

  dismissToast(id: string): void {
    this.toasts.update((t: { id: string; title: string; message: string; timestamp: Date }[]) =>
      t.filter((toast: { id: string }) => toast.id !== id)
    );
  }
}
