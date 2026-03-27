'use client';

import { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import Header from './Header';
import FileTree from './FileTree';
import PreviewPanel from './PreviewPanel';
import ActivityFeed from './ActivityFeed';
import Footer from './Footer';

export default function Dashboard() {
  const { connected, snapshot, activity } = useSocket();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const fileCount = snapshot.filter((f) => f.type === 'file').length;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header connected={connected} fileCount={fileCount} />

      <div className="flex-1 flex overflow-hidden">
        {/* File Tree - Left Sidebar */}
        <div className="w-72 border-r border-border flex-shrink-0 overflow-hidden bg-surface/30">
          <FileTree
            files={snapshot}
            selectedPath={selectedPath}
            onSelect={setSelectedPath}
            activity={activity}
          />
        </div>

        {/* Preview Panel - Center */}
        <div className="flex-1 overflow-hidden bg-base">
          <PreviewPanel selectedPath={selectedPath} files={snapshot} />
        </div>

        {/* Activity Feed - Right Sidebar */}
        <div className="w-80 border-l border-border flex-shrink-0 overflow-hidden bg-surface/30">
          <ActivityFeed activity={activity} />
        </div>
      </div>

      <Footer fileCount={fileCount} connected={connected} />
    </div>
  );
}
