import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { FtpService } from './ftp-service';
import { PollingService } from './polling-service';
import { setGlobalState } from './state';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Socket.IO
  const io = new SocketIOServer(server, {
    cors: { origin: '*' },
    path: '/socket.io',
  });

  // FTP + Polling
  const ftpService = new FtpService();
  const pollingService = new PollingService(ftpService);

  // Register global state so API routes can access it
  setGlobalState(ftpService, pollingService);

  // Try to connect to FTP
  try {
    await ftpService.connect();
    console.log('Connected to FTP server');
  } catch (err) {
    console.error('Failed to connect to FTP server:', err);
  }

  // Broadcast diffs
  pollingService.setOnDiff((diff) => {
    io.emit('fs:diff', diff);
  });

  // Handle client connections
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send current snapshot
    const snapshot = pollingService.getSnapshot();
    socket.emit('fs:snapshot', { snapshot });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Start polling
  try {
    await pollingService.start();
    console.log('Polling started');
  } catch (err) {
    console.error('Failed to start polling:', err);
  }

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down...');
    pollingService.stop();
    await ftpService.disconnect();
    io.close();
    server.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
});
