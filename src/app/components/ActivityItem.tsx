'use client';

import { memo } from 'react';
import { FilePlus, FileEdit, FileX } from 'lucide-react';
import { toBase64, timeAgo, getFileName } from '../lib/utils';
import type { ActivityEntry } from '../hooks/useSocket';

interface ActivityItemProps {
  entry: ActivityEntry;
}

const changeConfig = {
  added: {
    icon: FilePlus,
    color: 'text-emerald-400',
    borderColor: 'border-l-emerald-500/60',
    bgColor: 'bg-emerald-500/[0.04]',
    hoverBg: 'hover:bg-emerald-500/[0.06]',
    label: 'Added',
    badgeClass: 'badge-added',
  },
  modified: {
    icon: FileEdit,
    color: 'text-amber-400',
    borderColor: 'border-l-amber-500/60',
    bgColor: 'bg-amber-500/[0.04]',
    hoverBg: 'hover:bg-amber-500/[0.06]',
    label: 'Modified',
    badgeClass: 'badge-modified',
  },
  deleted: {
    icon: FileX,
    color: 'text-red-400',
    borderColor: 'border-l-red-500/60',
    bgColor: 'bg-red-500/[0.04]',
    hoverBg: 'hover:bg-red-500/[0.06]',
    label: 'Deleted',
    badgeClass: 'badge-deleted',
  },
};

function ActivityItemInner({ entry }: ActivityItemProps) {
  const config = changeConfig[entry.changeType];
  const Icon = config.icon;
  const testId = `activity-item-${entry.changeType}-${toBase64(entry.file.path)}`;

  return (
    <div
      data-test-id={testId}
      className={`animate-slide-in mx-3 mb-2 p-3 rounded-xl border-l-2 ${config.borderColor} ${config.bgColor} ${config.hoverBg} transition-all duration-200 group`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`mt-0.5 p-1 rounded-md ${config.bgColor} ${config.color}`}>
          <Icon size={12} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`activity-badge ${config.badgeClass}`}>
              {config.label}
            </span>
            <span className="text-[10px] text-zinc-600 font-mono">
              {timeAgo(entry.timestamp)}
            </span>
          </div>
          <p className="text-[13px] text-zinc-300 truncate font-medium" title={entry.file.path}>
            {getFileName(entry.file.path)}
          </p>
          <p className="text-[10px] text-zinc-600 truncate mt-0.5 font-mono" title={entry.file.path}>
            {entry.file.path}
          </p>
        </div>
      </div>
    </div>
  );
}

export default memo(ActivityItemInner);
