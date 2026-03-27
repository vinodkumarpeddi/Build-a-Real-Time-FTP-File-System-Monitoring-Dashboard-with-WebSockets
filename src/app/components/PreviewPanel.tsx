'use client';

import { useState, useEffect } from 'react';
import { Eye, FileText, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { formatBytes, isImageFile, getFileName, getFileExtension } from '../lib/utils';

interface FtpFile {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size: number;
  modifiedAt: string;
}

interface PreviewPanelProps {
  selectedPath: string | null;
  files: FtpFile[];
}

export default function PreviewPanel({ selectedPath, files }: PreviewPanelProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const selectedFile = files.find((f) => f.path === selectedPath);

  useEffect(() => {
    if (!selectedPath || !selectedFile || selectedFile.type === 'directory') {
      setContent(null);
      setImageUrl(null);
      setError(null);
      return;
    }

    setLoading(true);
    setContent(null);
    setImageUrl(null);
    setError(null);

    if (isImageFile(selectedFile.name)) {
      setImageUrl(`/api/ftp/preview?path=${encodeURIComponent(selectedPath)}`);
      setLoading(false);
      return;
    }

    fetch(`/api/ftp/preview?path=${encodeURIComponent(selectedPath)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load file');
        const text = await res.text();
        setContent(text);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedPath, selectedFile]);

  // Breadcrumb
  const breadcrumb = selectedPath ? selectedPath.split('/').filter(Boolean) : [];

  return (
    <div className="flex flex-col h-full" data-test-id="file-preview-panel">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Eye size={14} className="text-accent" />
        <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Preview</span>
      </div>

      {!selectedPath ? (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-zinc-600">
          <div className="p-6 rounded-2xl bg-surface-hover/50">
            <FileText size={48} className="text-zinc-700" />
          </div>
          <div className="text-center">
            <p className="text-sm text-zinc-400 mb-1">No file selected</p>
            <p className="text-xs text-zinc-600">Click a file in the explorer to preview its contents</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 px-4 py-2 text-xs text-zinc-500 border-b border-border/50 bg-surface/50">
            <span className="text-zinc-600">/</span>
            {breadcrumb.map((part, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={10} className="text-zinc-700" />}
                <span className={i === breadcrumb.length - 1 ? 'text-zinc-300' : ''}>
                  {part}
                </span>
              </span>
            ))}
          </div>

          {/* File info bar */}
          {selectedFile && (
            <div className="flex items-center gap-4 px-4 py-2 text-[10px] text-zinc-500 border-b border-border/50 font-mono">
              <span>Type: .{getFileExtension(selectedFile.name) || 'unknown'}</span>
              <span>Size: {formatBytes(selectedFile.size)}</span>
              <span>Modified: {new Date(selectedFile.modifiedAt).toLocaleString()}</span>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full gap-2 text-zinc-500">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Loading preview...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full gap-2 text-danger">
                <AlertCircle size={16} />
                <span className="text-xs">{error}</span>
              </div>
            ) : imageUrl ? (
              <div className="flex items-center justify-center h-full p-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={getFileName(selectedPath)}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              </div>
            ) : content !== null ? (
              <div className="relative">
                <pre className="p-4 text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                  {content.split('\n').map((line, i) => (
                    <div key={i} className="flex hover:bg-surface-hover/30">
                      <span className="select-none w-10 text-right pr-4 text-zinc-700 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1">{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
