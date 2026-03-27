'use client';

import { Wifi, WifiOff } from 'lucide-react';

interface StatusBadgeProps {
  connected: boolean;
}

export default function StatusBadge({ connected }: StatusBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
        connected
          ? 'bg-success/10 text-success border border-success/20'
          : 'bg-danger/10 text-danger border border-danger/20'
      }`}
    >
      <span
        className={`status-dot ${
          connected ? 'status-dot-connected' : 'status-dot-disconnected'
        }`}
      />
      {connected ? (
        <>
          <Wifi size={12} />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff size={12} />
          <span>Disconnected</span>
        </>
      )}
    </div>
  );
}
