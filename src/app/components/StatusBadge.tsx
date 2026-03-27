'use client';

import { Wifi, WifiOff } from 'lucide-react';

interface StatusBadgeProps {
  connected: boolean;
}

export default function StatusBadge({ connected }: StatusBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-500 ${
        connected
          ? 'bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20 shadow-glow-success'
          : 'bg-red-500/[0.08] text-red-400 border border-red-500/20 shadow-glow-danger'
      }`}
    >
      <span className="relative flex h-2 w-2">
        {connected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            connected ? 'bg-emerald-400' : 'bg-red-400'
          }`}
        />
      </span>
      {connected ? (
        <>
          <Wifi size={12} />
          <span>Live</span>
        </>
      ) : (
        <>
          <WifiOff size={12} />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}
