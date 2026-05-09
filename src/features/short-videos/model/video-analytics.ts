
type ViewEvent = {
  videoId: number;
  durationMs: number;
  timestamp: number;
};

class VideoAnalytics {
  private queue: ViewEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  sendViewEvent(videoId: number | undefined, durationMs: number) {
    if (!videoId || durationMs < 500) return;
    this.queue.push({ videoId, durationMs, timestamp: Date.now() });
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => this.flush(), 5000);
  }

  private async flush() {
    if (this.queue.length === 0) return;
    const events = [...this.queue];
    this.queue = [];
    this.flushTimer = null;
    try {
      await fetch('/api/shorts/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('Analytics error', error);
    }
  }
}

export const videoAnalytics = new VideoAnalytics();