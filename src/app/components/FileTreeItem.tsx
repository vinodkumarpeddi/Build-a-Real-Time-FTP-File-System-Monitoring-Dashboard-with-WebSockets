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

const iconColors: Record<string, string> = {
  folder: 'text-cyan-400',
  'folder-open': 'text-cyan-400',
  code: 'text-emerald-400',
  image: 'text-pink-400',
  text: 'text-blue-400',
  pdf: 'text-orange-400',
  data: 'text-amber-400',
  archive: 'text-violet-400',
  video: 'text-rose-400',
  audio: 'text-teal-400',
  file: 'text-zinc-500',
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
    ? iconColors['folder']
    : iconColors[iconType] || iconColors.file;

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
        <span className={`transition-transform duration-200 flex-shrink-0 ${isDir ? '' : 'invisible'} ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight size={13} className="text-zinc-600" />
        </span>

        {/* Icon */}
        <IconComponent size={15} className={`${iconColor} flex-shrink-0 transition-colors`} />

        {/* Name */}
        <span className="flex-1 truncate text-[13px]">{file.name}</span>

        {/* Size badge on hover */}
        {file.type === 'file' && (
          <span className="text-[10px] text-zinc-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
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
