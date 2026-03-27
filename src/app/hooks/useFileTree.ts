'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';

interface FtpFile {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size: number;
  modifiedAt: string;
}

export interface TreeNode {
  file: FtpFile;
  children: TreeNode[];
  depth: number;
}

function buildTree(files: FtpFile[]): TreeNode[] {
  // Separate directories and files
  const dirs = files.filter((f) => f.type === 'directory');
  const regularFiles = files.filter((f) => f.type === 'file');

  // Build a map of path -> TreeNode for directories
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Sort directories by path depth to process parents first
  const sortedDirs = [...dirs].sort((a, b) => a.path.split('/').length - b.path.split('/').length);

  for (const dir of sortedDirs) {
    const node: TreeNode = { file: dir, children: [], depth: 0 };
    nodeMap.set(dir.path, node);

    const parentPath = getParentPath(dir.path);
    const parentNode = parentPath ? nodeMap.get(parentPath) : null;

    if (parentNode) {
      node.depth = parentNode.depth + 1;
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Place files under their parent directories
  for (const file of regularFiles) {
    const node: TreeNode = { file, children: [], depth: 0 };
    const parentPath = getParentPath(file.path);
    const parentNode = parentPath ? nodeMap.get(parentPath) : null;

    if (parentNode) {
      node.depth = parentNode.depth + 1;
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort children: directories first, then files, alphabetically
  const sortChildren = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.file.type !== b.file.type) {
        return a.file.type === 'directory' ? -1 : 1;
      }
      return a.file.name.localeCompare(b.file.name);
    });
    for (const node of nodes) {
      sortChildren(node.children);
    }
  };

  sortChildren(roots);
  return roots;
}

function getParentPath(filePath: string): string | null {
  const parts = filePath.split('/').filter(Boolean);
  if (parts.length <= 1) return null;
  return '/' + parts.slice(0, -1).join('/');
}

export function useFileTree(files: FtpFile[]) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildTree(files), [files]);

  // Auto-expand root directories
  useEffect(() => {
    const rootDirs = tree.filter((n) => n.file.type === 'directory').map((n) => n.file.path);
    if (rootDirs.length > 0) {
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        for (const p of rootDirs) next.add(p);
        return next;
      });
    }
  }, [tree]);

  const toggleExpanded = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const isExpanded = useCallback(
    (path: string) => expandedPaths.has(path),
    [expandedPaths]
  );

  return { tree, toggleExpanded, isExpanded };
}
