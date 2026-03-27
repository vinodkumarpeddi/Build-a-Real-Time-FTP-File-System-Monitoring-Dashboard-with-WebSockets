'use client';

import { useState, useEffect } from 'react';
import { HardDrive, Settings, Timer, FolderTree, FileText, Gauge } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface HeaderProps {
  connected: boolean;
  fileCount: number;
  dirCount: number;
}

export default function Header({ connected, fileCount, dirCount }: HeaderProps) {
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
    <header className="glass-panel-flat flex items-center justify-between px-6 py-3 border-b border-border/40">
      {/* Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 rounded-xl blur-md" />
            <div className="relative p-2.5 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl border border-accent/20">
              <HardDrive size={18} className="text-accent-light" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold gradient-text tracking-tight">FTP Monitor</h1>
            <p className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">Real-time Dashboard</p>
          </div>
        </div>
      </div>

      {/* Metrics & Controls */}
      <div className="flex items-center gap-3">
        {/* File count */}
        <div className="metric-card">
          <FileText size={13} className="text-accent-light/70" />
          <span className="font-mono font-semibold text-zinc-200 text-sm">{fileCount}</span>
          <span className="text-zinc-500">files</span>
        </div>

        {/* Dir count */}
        <div className="metric-card">
          <FolderTree size={13} className="text-cyan-400/70" />
          <span className="font-mono font-semibold text-zinc-200 text-sm">{dirCount}</span>
          <span className="text-zinc-500">folders</span>
        </div>

        {/* Polling interval */}
        <div className="metric-card">
          <Gauge size={13} className="text-violet-400/70" />
          {editing ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                className="w-16 bg-transparent text-zinc-200 text-xs outline-none font-mono"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') setEditing(false);
                }}
                autoFocus
                min={1000}
                step={1000}
              />
              <span className="text-zinc-600 text-[10px]">ms</span>
              <button
                onClick={handleSave}
                className="ml-1 text-accent hover:text-accent-light text-[10px] font-semibold uppercase tracking-wider"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-zinc-600 hover:text-zinc-400 text-[10px] font-semibold uppercase tracking-wider"
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
              className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors group"
            >
              <span className="font-mono font-semibold text-zinc-200 text-sm">{pollingMs / 1000}s</span>
              <span className="text-zinc-500">poll</span>
              <Settings size={10} className="text-zinc-600 group-hover:text-zinc-400 group-hover:rotate-90 transition-all duration-300" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border/60 mx-1" />

        <StatusBadge connected={connected} />
      </div>
    </header>
  );
}
