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
    color: 'text-success',
    borderColor: 'border-l-success',
    bgColor: 'bg-success/5',
    label: 'Added',
    badgeClass: 'badge-added',
  },
  modified: {
    icon: FileEdit,
    color: 'text-warning',
    borderColor: 'border-l-warning',
    bgColor: 'bg-warning/5',
    label: 'Modified',
    badgeClass: 'badge-modified',
  },
  deleted: {
    icon: FileX,
    color: 'text-danger',
    borderColor: 'border-l-danger',
    bgColor: 'bg-danger/5',
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
      className={`animate-slide-in mx-3 mb-2 p-3 rounded-lg border-l-2 ${config.borderColor} ${config.bgColor} hover:bg-surface-hover transition-colors duration-150`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`mt-0.5 ${config.color}`}>
          <Icon size={14} />
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
          <p className="text-xs text-zinc-300 truncate" title={entry.file.path}>
            {getFileName(entry.file.path)}
          </p>
          <p className="text-[10px] text-zinc-600 truncate mt-0.5" title={entry.file.path}>
            {entry.file.path}
          </p>
        </div>
      </div>
    </div>
  );
}

export default memo(ActivityItemInner);
