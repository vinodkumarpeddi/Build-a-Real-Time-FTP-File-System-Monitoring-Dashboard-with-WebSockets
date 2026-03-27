'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface FtpFile {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size: number;
  modifiedAt: string;
}

interface SnapshotDiff {
  added: FtpFile[];
  modified: FtpFile[];
  deleted: FtpFile[];
}

export interface ActivityEntry {
  id: string;
  changeType: 'added' | 'modified' | 'deleted';
  file: FtpFile;
  timestamp: string;
}

const MAX_ACTIVITY = 50;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [snapshot, setSnapshot] = useState<FtpFile[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  const addActivities = useCallback((diff: SnapshotDiff) => {
    const now = new Date().toISOString();
    const entries: ActivityEntry[] = [];

    for (const file of diff.added) {
      entries.push({
        id: `added-${file.path}-${Date.now()}`,
        changeType: 'added',
        file,
        timestamp: now,
      });
    }
    for (const file of diff.modified) {
      entries.push({
        id: `modified-${file.path}-${Date.now()}`,
        changeType: 'modified',
        file,
        timestamp: now,
      });
    }
    for (const file of diff.deleted) {
      entries.push({
        id: `deleted-${file.path}-${Date.now()}`,
        changeType: 'deleted',
        file,
        timestamp: now,
      });
    }

    setActivity((prev) => [...entries, ...prev].slice(0, MAX_ACTIVITY));
  }, []);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
    const socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('fs:snapshot', (data: { snapshot: FtpFile[] }) => {
      setSnapshot(data.snapshot);
    });

    socket.on('fs:diff', (diff: SnapshotDiff) => {
      // Update snapshot
      setSnapshot((prev) => {
        let updated = [...prev];

        // Remove deleted
        const deletedPaths = new Set(diff.deleted.map((f) => f.path));
        updated = updated.filter((f) => !deletedPaths.has(f.path));

        // Update modified
        for (const mod of diff.modified) {
          const idx = updated.findIndex((f) => f.path === mod.path);
          if (idx >= 0) {
            updated[idx] = mod;
          }
        }

        // Add new
        updated.push(...diff.added);

        return updated;
      });

      addActivities(diff);
    });

    return () => {
      socket.disconnect();
    };
  }, [addActivities]);

  return { connected, snapshot, activity };
}
