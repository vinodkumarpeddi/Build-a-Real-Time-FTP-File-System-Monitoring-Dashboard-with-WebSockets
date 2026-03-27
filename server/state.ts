import { FtpService } from './ftp-service';
import { PollingService } from './polling-service';

// Global state accessible by both custom server and API routes
// We use globalThis to persist across hot reloads in dev

interface GlobalState {
  ftpService: FtpService | null;
  pollingService: PollingService | null;
}

const g = globalThis as unknown as { __ftpMonitorState: GlobalState };

if (!g.__ftpMonitorState) {
  g.__ftpMonitorState = {
    ftpService: null,
    pollingService: null,
  };
}

export function setGlobalState(ftp: FtpService, polling: PollingService): void {
  g.__ftpMonitorState.ftpService = ftp;
  g.__ftpMonitorState.pollingService = polling;
}

export function getFtpService(): FtpService {
  if (!g.__ftpMonitorState.ftpService) {
    // Create a new instance if not initialized yet (e.g., during build)
    g.__ftpMonitorState.ftpService = new FtpService();
  }
  return g.__ftpMonitorState.ftpService;
}

export function getPollingService(): PollingService {
  if (!g.__ftpMonitorState.pollingService) {
    const ftp = getFtpService();
    g.__ftpMonitorState.pollingService = new PollingService(ftp);
  }
  return g.__ftpMonitorState.pollingService;
}
