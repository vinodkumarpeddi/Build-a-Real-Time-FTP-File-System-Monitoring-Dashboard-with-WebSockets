'use client';

import { memo } from 'react';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileCode,
  FileImage,
  FileText,
  File,
  FileJson,
  FileArchive,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
} from 'lucide-react';
import { toBase64, formatBytes, getFileIconType } from '../lib/utils';
import type { TreeNode } from '../hooks/useFileTree';

interface FileTreeItemProps {
  node: TreeNode;
  isExpanded: (path: string) => boolean;
  selectedPath: string | null;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
  recentChanges: Set<string>;
}

const iconMap = {
  folder: Folder,
  'folder-open': FolderOpen,
  code: FileCode,
  image: FileImage,
  text: FileText,
  pdf: FileSpreadsheet,
  data: FileJson,
  archive: FileArchive,
  video: FileVideo,
  audio: FileAudio,
  file: File,
};

function FileTreeItemInner({
  node,
  isExpanded,
  selectedPath,
  onToggle,
  onSelect,
  recentChanges,
}: FileTreeItemProps) {
  const { file, children, depth } = node;
  const isDir = file.type === 'directory';
  const iconType = getFileIconType(file.name, file.type);
  const isRecent = recentChanges.has(file.path);
  const expanded = isDir && isExpanded(file.path);
  const isSelected = selectedPath === file.path;

  const IconComponent = isDir
    ? expanded
      ? iconMap['folder-open']
      : iconMap.folder
    : iconMap[iconType] || iconMap.file;

  const iconColor = isDir
    ? 'text-accent-light'
    : iconType === 'code'
    ? 'text-emerald-400'
    : iconType === 'image'
    ? 'text-pink-400'
    : iconType === 'data'
    ? 'text-amber-400'
    : 'text-zinc-400';

  const testId = `file-tree-item-${toBase64(file.path)}`;

  return (
    <div>
      <div
        data-test-id={testId}
        className={`tree-item group ${isSelected ? 'tree-item-selected' : ''} ${
          isRecent ? 'animate-glow' : ''
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => {
          if (isDir) {
            onToggle(file.path);
          } else {
            onSelect(file.path);
          }
        }}
      >
        {/* Expand chevron */}
        <span className={`transition-transform duration-200 ${isDir ? '' : 'invisible'} ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight size={14} className="text-zinc-500" />
        </span>

        {/* Icon */}
        <IconComponent size={16} className={iconColor} />

        {/* Name */}
        <span className="flex-1 truncate">{file.name}</span>

        {/* Size badge */}
        {file.type === 'file' && (
          <span className="text-[10px] text-zinc-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            {formatBytes(file.size)}
          </span>
        )}
      </div>

      {/* Children */}
      {isDir && expanded && (
        <div className="animate-fade-in">
          {children.map((child) => (
            <MemoizedFileTreeItem
              key={child.file.path}
              node={child}
              isExpanded={isExpanded}
              selectedPath={selectedPath}
              onToggle={onToggle}
              onSelect={onSelect}
              recentChanges={recentChanges}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const MemoizedFileTreeItem = memo(FileTreeItemInner);
export default MemoizedFileTreeItem;
