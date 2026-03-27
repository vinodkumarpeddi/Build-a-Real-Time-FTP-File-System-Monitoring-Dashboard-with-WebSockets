'use client';

import { useEffect, useState } from 'react';
import { Clock, Database, Radio } from 'lucide-react';

interface FooterProps {
  fileCount: number;
  connected: boolean;
}

export default function Footer({ fileCount, connected }: FooterProps) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    setTimeStr(new Date().toLocaleTimeString());
    const timer = setInterval(() => setTimeStr(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="glass-panel-flat flex items-center justify-between px-6 py-2 border-t border-border text-[10px] text-zinc-500">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Database size={10} />
          <span>{fileCount} files monitored</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={10} />
          <span>{timeStr || '--:--:--'}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Radio size={10} className={connected ? 'text-success' : 'text-danger'} />
        <span>{connected ? 'Live' : 'Offline'}</span>
      </div>
    </footer>
  );
}
