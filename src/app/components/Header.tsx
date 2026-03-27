'use client';

import { useState, useEffect } from 'react';
import { HardDrive, Settings, Timer } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface HeaderProps {
  connected: boolean;
  fileCount: number;
}

export default function Header({ connected, fileCount }: HeaderProps) {
  const [pollingMs, setPollingMs] = useState<number>(5000);
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.pollingIntervalMs) setPollingMs(data.pollingIntervalMs);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    const val = parseInt(inputVal, 10);
    if (isNaN(val) || val < 1000) return;
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollingIntervalMs: val }),
      });
      const data = await res.json();
      setPollingMs(data.pollingIntervalMs);
    } catch {}
    setEditing(false);
  };

  return (
    <header className="glass-panel-flat flex items-center justify-between px-6 py-3 border-b border-border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-accent/10 rounded-lg">
            <HardDrive size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-base font-semibold gradient-text">FTP Monitor</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Real-time Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* File count badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-full text-xs text-zinc-400 border border-border">
          <span className="font-mono font-medium text-zinc-200">{fileCount}</span>
          <span>files</span>
        </div>

        {/* Polling interval */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-full text-xs text-zinc-400 border border-border">
          <Timer size={12} />
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                className="w-16 bg-transparent text-zinc-200 text-xs outline-none font-mono"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
                min={1000}
                step={1000}
              />
              <span className="text-zinc-500">ms</span>
              <button
                onClick={handleSave}
                className="ml-1 text-accent hover:text-accent-light text-xs"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setInputVal(String(pollingMs));
                setEditing(true);
              }}
              className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
            >
              <span className="font-mono">{pollingMs / 1000}s</span>
              <Settings size={10} className="opacity-50" />
            </button>
          )}
        </div>

        <StatusBadge connected={connected} />
      </div>
    </header>
  );
}
