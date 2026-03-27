'use client';

import { useEffect, useState } from 'react';
import { Clock, Database, Radio, FolderTree, Zap } from 'lucide-react';

interface FooterProps {
  fileCount: number;
  dirCount: number;
  connected: boolean;
}

export default function Footer({ fileCount, dirCount, connected }: FooterProps) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    setTimeStr(new Date().toLocaleTimeString());
    const timer = setInterval(() => setTimeStr(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="glass-panel-flat flex items-center justify-between px-6 py-2 border-t border-border/40 text-[11px] text-zinc-500">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <Database size={11} className="text-accent-light/50" />
          <span className="font-mono text-zinc-400">{fileCount}</span>
          <span>files</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FolderTree size={11} className="text-cyan-400/50" />
          <span className="font-mono text-zinc-400">{dirCount}</span>
          <span>folders</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-violet-400/50" />
          <span className="font-mono text-zinc-400">{timeStr || '--:--:--'}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${
          connected ? 'bg-emerald-500/[0.06]' : 'bg-red-500/[0.06]'
        }`}>
          {connected ? (
            <Zap size={10} className="text-emerald-400" />
          ) : (
            <Radio size={10} className="text-red-400" />
          )}
          <span className={connected ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
    </footer>
  );
}
