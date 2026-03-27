# FTP Monitor Dashboard

A real-time web dashboard that monitors a remote FTP server, detects file system changes via periodic polling, and broadcasts changes to all connected clients using WebSockets.

## Architecture

```
[FTP Server (vsftpd)] <--polling--> [Next.js Custom Server]
                                      ├── FTP Service (basic-ftp)
                                      ├── Polling/Diffing Engine
                                      ├── WebSocket Server (socket.io)
                                      ├── REST API Routes
                                      └── React Frontend Dashboard
```

### Key Components

- **FTP Service** (`server/ftp-service.ts`): Manages FTP connections with auto-reconnect. Provides methods for listing directories, downloading files, and creating full file system snapshots.
- **Diffing Engine** (`server/diff.ts`): A pure function that compares two file system snapshots and returns the differences (added, modified, deleted files). Uses path-based mapping for O(n) comparison.
- **Polling Service** (`server/polling-service.ts`): Periodically polls the FTP server, computes diffs, and triggers callbacks when changes are detected. Configurable interval at runtime.
- **Custom Server** (`server/server.ts`): Integrates Next.js with a Socket.IO WebSocket server. Sends `fs:snapshot` on client connect and broadcasts `fs:diff` events on file changes.
- **Frontend Dashboard**: Dark-themed React UI with a file tree explorer, real-time activity feed, and file preview panel.

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd ftp-monitor-dashboard

# Copy environment config
cp .env.example .env

# Start everything
docker-compose up --build
```

The application will be available at `http://localhost:3000`.

### Local Development

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start a local FTP server (or use Docker for just the FTP)
docker run -d --name ftp \
  -p 20:20 -p 21:21 -p 21100-21110:21100-21110 \
  -e FTP_USER=testuser -e FTP_PASS=testpass \
  -e PASV_ADDRESS=127.0.0.1 -e PASV_MIN_PORT=21100 -e PASV_MAX_PORT=21110 \
  fauria/vsftpd

# Start the dev server
npm run dev
```

## Testing

```bash
# Run unit tests
npm test
```

Tests cover the snapshot diffing function with scenarios for:
- Initial load (empty to populated)
- No changes (identical snapshots)
- Added files only
- Modified files only
- Deleted files only
- Mixed changes

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ftp/list?path=/` | List directory contents |
| GET | `/api/ftp/preview?path=/file.txt` | Preview file contents |
| GET | `/api/health` | Health check with FTP status |
| GET | `/api/config` | Get polling configuration |
| POST | `/api/config` | Update polling interval |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `fs:snapshot` | Server → Client | Full file system state on connect |
| `fs:diff` | Server → Client | Incremental changes (added/modified/deleted) |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FTP_HOST` | FTP server hostname | `localhost` |
| `FTP_USER` | FTP username | `testuser` |
| `FTP_PASS` | FTP password | `testpass` |
| `FTP_SECURE` | Use FTPS | `false` |
| `POLLING_INTERVAL_MS` | Poll interval in ms | `5000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for clients | `ws://localhost:3000` |

## Design Decisions

1. **Custom Next.js Server**: Socket.IO requires access to the raw HTTP server, so a custom `server.ts` bootstraps Next.js alongside WebSocket support.
2. **In-Memory State**: File snapshots are stored in memory for simplicity and speed. This is suitable for monitoring a single FTP server.
3. **Pure Diffing Function**: The `diffSnapshots` function is side-effect-free, making it easy to test and reason about.
4. **Global Singleton Pattern**: FTP and polling services are singletons accessible to both the custom server and Next.js API routes via a shared state module.
5. **Dark Theme UI**: Premium monitoring dashboard aesthetic with animations for real-time change visibility.

## Tech Stack

- **Next.js 14** with TypeScript and App Router
- **Socket.IO** for WebSocket communication
- **basic-ftp** for FTP client operations
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Jest** for unit testing
- **Docker** for containerization
