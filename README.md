# Real-Time FTP File System Monitoring Dashboard with WebSockets

A real-time web dashboard that monitors a remote FTP server, automatically detects file changes (additions, modifications, deletions) through periodic polling, and instantly pushes updates to all connected browser clients using WebSockets. Think of it as a live file explorer for your FTP server.

## What Does This Do?

Imagine you have an FTP server where files are constantly being uploaded, modified, or deleted by various users or automated processes. This dashboard gives you a **live view** of everything happening on that server:

- **See files appear in real-time** as they're uploaded to the FTP server
- **Get instant notifications** when files are modified or deleted
- **Browse the file tree** just like a local file explorer
- **Preview file contents** directly in the browser (text, images, etc.)
- **Track all activity** with a timestamped activity feed

## How It Works

```
┌─────────────┐    Polls every 5s    ┌──────────────────────────┐    WebSocket     ┌─────────────┐
│  FTP Server  │ ◄──────────────────► │   Next.js Custom Server  │ ◄──────────────► │   Browser    │
│  (vsftpd)    │    via basic-ftp     │                          │   via Socket.IO  │  Dashboard   │
└─────────────┘                       │  1. Takes FTP snapshot   │                  │              │
                                      │  2. Diffs with previous  │                  │  - File Tree │
                                      │  3. Broadcasts changes   │                  │  - Activity  │
                                      │  4. Serves REST APIs     │                  │  - Preview   │
                                      └──────────────────────────┘                  └─────────────┘
```

### Key Components

| Component | File | What It Does |
|-----------|------|-------------|
| **FTP Service** | `server/ftp-service.ts` | Connects to the FTP server with auto-reconnect. Lists directories, downloads files, and creates full file system snapshots. |
| **Diffing Engine** | `server/diff.ts` | Compares two snapshots and finds what changed (added, modified, deleted). Uses O(n) path-based comparison. |
| **Polling Service** | `server/polling-service.ts` | Runs on a configurable timer, polls the FTP server, computes diffs, and triggers change callbacks. |
| **Custom Server** | `server/server.ts` | Boots Next.js + Socket.IO together. Sends full state on connect, broadcasts diffs on changes. |
| **Frontend Dashboard** | `src/app/components/` | Dark-themed React UI with file tree explorer, live activity feed, and file preview panel. |

## Quick Start

### Option 1: Docker Compose (Recommended)

Spins up both the FTP server and the dashboard in one command.

```bash
# Clone the repository
git clone https://github.com/vinodkumarpeddi/Build-a-Real-Time-FTP-File-System-Monitoring-Dashboard-with-WebSockets.git
cd Build-a-Real-Time-FTP-File-System-Monitoring-Dashboard-with-WebSockets

# Copy environment config
cp .env.example .env

# Start everything (FTP server + Dashboard)
docker-compose up --build
```

Open **http://localhost:3000** in your browser.

### Option 2: Local Development

Run the dashboard locally and use Docker only for the FTP server.

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start a local FTP server via Docker
docker run -d --name ftp \
  -p 20:20 -p 21:21 -p 21100-21110:21100-21110 \
  -e FTP_USER=testuser -e FTP_PASS=testpass \
  -e PASV_ADDRESS=127.0.0.1 -e PASV_MIN_PORT=21100 -e PASV_MAX_PORT=21110 \
  fauria/vsftpd

# Start the dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Try It Out

Once the app is running, try adding or modifying files on the FTP server to see real-time updates:

```bash
# Upload a test file to the FTP server
curl -T myfile.txt ftp://localhost:21/ --user testuser:testpass
```

You should see the file appear instantly in the dashboard.

## Testing

```bash
npm test
```

Tests cover the snapshot diffing engine with scenarios for:
- Initial load (empty to populated)
- No changes (identical snapshots)
- Added, modified, and deleted files
- Mixed changes in a single diff

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ftp/list?path=/` | List contents of a directory on the FTP server |
| `GET` | `/api/ftp/preview?path=/file.txt` | Preview a file's contents (text, images, etc.) |
| `GET` | `/api/health` | Health check — returns FTP connection status |
| `GET` | `/api/config` | Get current polling configuration |
| `POST` | `/api/config` | Update polling interval at runtime |

### WebSocket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `fs:snapshot` | Server -> Client | Full file tree | Sent once when a client connects |
| `fs:diff` | Server -> Client | `{ added, modified, deleted }` | Sent whenever the FTP server's files change |

## Configuration

All settings are controlled via environment variables (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `FTP_HOST` | FTP server hostname | `localhost` |
| `FTP_USER` | FTP username | `testuser` |
| `FTP_PASS` | FTP password | `testpass` |
| `FTP_SECURE` | Use FTPS (true/false) | `false` |
| `POLLING_INTERVAL_MS` | How often to check for changes (in ms) | `5000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for browser clients | `ws://localhost:3000` |

## Design Decisions

1. **Custom Next.js Server** — Socket.IO needs access to the raw HTTP server, so a custom `server.ts` bootstraps Next.js alongside WebSocket support on the same port.
2. **In-Memory State** — File snapshots are stored in memory for speed. No database needed — this is designed for monitoring a single FTP server.
3. **Pure Diffing Function** — `diffSnapshots` is a pure function with no side effects, making it easy to test and reason about.
4. **Singleton Services** — FTP and polling services are shared singletons accessible to both the custom server and Next.js API routes via a state module.
5. **Dark Theme UI** — A clean monitoring dashboard aesthetic with subtle animations to highlight real-time changes.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with TypeScript and App Router |
| **Socket.IO** | Real-time WebSocket communication |
| **basic-ftp** | FTP client for connecting to the FTP server |
| **Tailwind CSS** | Utility-first CSS styling |
| **Lucide React** | Icon library |
| **Jest** | Unit testing |
| **Docker** | Containerization for easy setup |
