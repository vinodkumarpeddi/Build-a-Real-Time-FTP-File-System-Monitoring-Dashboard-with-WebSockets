'use client';

import { useRef, useEffect } from 'react';
import { Activity, Zap } from 'lucide-react';
import ActivityItem from './ActivityItem';
import type { ActivityEntry } from '../hooks/useSocket';

interface ActivityFeedProps {
  activity: ActivityEntry[];
}

export default function ActivityFeed({ activity }: ActivityFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activity.length]);

  return (
    <div className="flex flex-col h-full" data-test-id="activity-feed">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-accent" />
          <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Activity</span>
        </div>
        {activity.length > 0 && (
          <span className="text-[10px] text-zinc-500 font-mono">{activity.length} events</span>
        )}
      </div>

      {/* Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-2">
        {activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-3 px-4">
            <Zap size={32} className="text-zinc-700" />
            <p className="text-xs text-center">No activity yet. Changes to the FTP server will appear here in real-time.</p>
          </div>
        ) : (
          activity.map((entry) => (
            <ActivityItem key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
