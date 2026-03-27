'use client';

import { useRef, useEffect } from 'react';
import { Activity, Zap, Radio } from 'lucide-react';
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
      <div className="section-header justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-accent/[0.08]">
            <Activity size={13} className="text-accent-light" />
          </div>
          <span className="section-title">Activity</span>
        </div>
        {activity.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.04]">
            <Radio size={9} className="text-accent-light/60" />
            <span className="text-[10px] font-mono text-zinc-500">{activity.length}</span>
          </div>
        )}
      </div>

      {/* Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-2">
        {activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-4 px-6">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/[0.03] rounded-2xl blur-lg" />
              <div className="relative p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <Zap size={28} className="text-zinc-700" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500 mb-1">Waiting for activity</p>
              <p className="text-[10px] text-zinc-700">File changes will appear here in real-time</p>
            </div>
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
