'use client';

import { useMemo } from 'react';
import { FolderTree, Search } from 'lucide-react';
import { useFileTree } from '../hooks/useFileTree';
import FileTreeItem from './FileTreeItem';
import type { ActivityEntry } from '../hooks/useSocket';

interface FtpFile {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size: number;
  modifiedAt: string;
}

interface FileTreeProps {
  files: FtpFile[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  activity: ActivityEntry[];
}

export default function FileTree({ files, selectedPath, onSelect, activity }: FileTreeProps) {
  const { tree, toggleExpanded, isExpanded } = useFileTree(files);

  // Track recently changed files (within last 5 seconds)
  const recentChanges = useMemo(() => {
    const now = Date.now();
    const recent = new Set<string>();
    for (const entry of activity) {
      if (now - new Date(entry.timestamp).getTime() < 5000) {
        recent.add(entry.file.path);
      }
    }
    return recent;
  }, [activity]);

  const renderNode = (node: ReturnType<typeof useFileTree>['tree'][number]) => {
    return (
      <FileTreeItem
        key={node.file.path}
        node={node}
        isExpanded={isExpanded}
        selectedPath={selectedPath}
        onToggle={toggleExpanded}
        onSelect={onSelect}
        recentChanges={recentChanges}
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <FolderTree size={14} className="text-accent" />
        <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">File Explorer</span>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-3 px-4">
            <Search size={32} className="text-zinc-700" />
            <p className="text-xs text-center">No files found. Add files to the FTP server to see them here.</p>
          </div>
        ) : (
          tree.map(renderNode)
        )}
      </div>
    </div>
  );
}
