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
  const dirCount = snapshot.filter((f) => f.type === 'directory').length;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-base bg-mesh-gradient">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-glow/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="relative flex flex-col h-full z-10">
        <Header connected={connected} fileCount={fileCount} dirCount={dirCount} />

        <div className="flex-1 flex overflow-hidden">
          {/* File Tree - Left Sidebar */}
          <div className="w-[280px] border-r border-border/40 flex-shrink-0 overflow-hidden panel-section">
            <FileTree
              files={snapshot}
              selectedPath={selectedPath}
              onSelect={setSelectedPath}
              activity={activity}
            />
          </div>

          {/* Preview Panel - Center */}
          <div className="flex-1 overflow-hidden bg-base/50">
            <PreviewPanel selectedPath={selectedPath} files={snapshot} />
          </div>

          {/* Activity Feed - Right Sidebar */}
          <div className="w-[320px] border-l border-border/40 flex-shrink-0 overflow-hidden panel-section">
            <ActivityFeed activity={activity} />
          </div>
        </div>

        <Footer fileCount={fileCount} dirCount={dirCount} connected={connected} />
      </div>
    </div>
  );
}
