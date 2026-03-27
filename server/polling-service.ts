import { FtpService } from './ftp-service';
import { diffSnapshots } from './diff';
import { FileSnapshot, SnapshotDiff } from './types';

export type DiffCallback = (diff: SnapshotDiff) => void;
export type SnapshotCallback = (snapshot: FileSnapshot) => void;

export class PollingService {
  private ftpService: FtpService;
  private intervalMs: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private currentSnapshot: FileSnapshot = [];
  private onDiff: DiffCallback | null = null;
  private onSnapshot: SnapshotCallback | null = null;
  private polling: boolean = false;
  private lastPollTime: string | null = null;

  constructor(ftpService: FtpService, intervalMs?: number) {
    this.ftpService = ftpService;
    this.intervalMs = intervalMs || parseInt(process.env.POLLING_INTERVAL_MS || '5000', 10);
  }

  setOnDiff(cb: DiffCallback): void {
    this.onDiff = cb;
  }

  setOnSnapshot(cb: SnapshotCallback): void {
    this.onSnapshot = cb;
  }

  getSnapshot(): FileSnapshot {
    return this.currentSnapshot;
  }

  getIntervalMs(): number {
    return this.intervalMs;
  }

  async setIntervalMs(ms: number): Promise<void> {
    this.intervalMs = ms;
    if (this.timer) {
      this.stop();
      await this.start();
    }
  }

  getLastPollTime(): string | null {
    return this.lastPollTime;
  }

  async start(): Promise<void> {
    // Do initial poll
    await this.poll();
    // Start interval
    this.timer = setInterval(() => this.poll(), this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async poll(): Promise<void> {
    if (this.polling) return;
    this.polling = true;

    try {
      const newSnapshot = await this.ftpService.getSnapshot('/');
      this.lastPollTime = new Date().toISOString();

      const diff = diffSnapshots(this.currentSnapshot, newSnapshot);
      this.currentSnapshot = newSnapshot;

      const hasChanges =
        diff.added.length > 0 ||
        diff.modified.length > 0 ||
        diff.deleted.length > 0;

      if (hasChanges && this.onDiff) {
        this.onDiff(diff);
      }

      if (this.onSnapshot) {
        this.onSnapshot(newSnapshot);
      }
    } catch (err) {
      console.error('Polling error:', err);
    } finally {
      this.polling = false;
    }
  }
}
