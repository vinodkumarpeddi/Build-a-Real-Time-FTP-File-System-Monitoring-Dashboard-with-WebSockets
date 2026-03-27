'use client';

import { useMemo } from 'react';
import { FolderTree, Search, Inbox } from 'lucide-react';
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
      <div className="section-header">
        <div className="p-1.5 rounded-lg bg-accent/[0.08]">
          <FolderTree size={13} className="text-accent-light" />
        </div>
        <span className="section-title">Explorer</span>
        {files.length > 0 && (
          <span className="ml-auto text-[10px] font-mono text-zinc-600">{files.length}</span>
        )}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-4 px-6">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <Inbox size={28} className="text-zinc-700" />
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500 mb-1">No files found</p>
              <p className="text-[10px] text-zinc-700">Upload files to the FTP server to begin monitoring</p>
            </div>
          </div>
        ) : (
          tree.map(renderNode)
        )}
      </div>
    </div>
  );
}
