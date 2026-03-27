'use client';

import { useState, useEffect } from 'react';
import { Eye, FileText, ChevronRight, Loader2, AlertCircle, Code, ImageIcon, FileQuestion } from 'lucide-react';
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

  const breadcrumb = selectedPath ? selectedPath.split('/').filter(Boolean) : [];
  const ext = selectedFile ? getFileExtension(selectedFile.name) : '';

  return (
    <div className="flex flex-col h-full" data-test-id="file-preview-panel">
      {/* Header */}
      <div className="section-header">
        <div className="p-1.5 rounded-lg bg-accent/[0.08]">
          <Eye size={13} className="text-accent-light" />
        </div>
        <span className="section-title">Preview</span>
        {selectedFile && (
          <span className="ml-auto text-[10px] font-mono text-zinc-600">.{ext || '?'}</span>
        )}
      </div>

      {!selectedPath ? (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center gap-5 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/[0.05] rounded-3xl blur-xl" />
            <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.04]">
              <FileQuestion size={40} className="text-zinc-700" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-zinc-400 font-medium mb-1">No file selected</p>
            <p className="text-xs text-zinc-600">Select a file from the explorer to preview its contents</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 px-4 py-2.5 text-xs text-zinc-500 border-b border-border/30 bg-white/[0.01]">
            <span className="text-zinc-700 font-mono">/</span>
            {breadcrumb.map((part, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={10} className="text-zinc-700" />}
                <span className={`${i === breadcrumb.length - 1 ? 'text-zinc-300 font-medium' : 'text-zinc-500'}`}>
                  {part}
                </span>
              </span>
            ))}
          </div>

          {/* File info bar */}
          {selectedFile && (
            <div className="flex items-center gap-3 px-4 py-2 text-[10px] text-zinc-600 border-b border-border/30 bg-white/[0.01]">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03]">
                <Code size={10} className="text-zinc-600" />
                <span className="font-mono uppercase">{ext || 'unknown'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-zinc-500">{formatBytes(selectedFile.size)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-600">Modified {new Date(selectedFile.modifiedAt).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/10 rounded-full blur-lg" />
                  <Loader2 size={24} className="relative animate-spin text-accent-light" />
                </div>
                <span className="text-xs font-medium">Loading preview...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="p-4 rounded-2xl bg-red-500/[0.05] border border-red-500/10">
                  <AlertCircle size={24} className="text-red-400" />
                </div>
                <span className="text-xs text-red-400 font-medium">{error}</span>
              </div>
            ) : imageUrl ? (
              <div className="flex items-center justify-center h-full p-8 animate-scale-in">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={getFileName(selectedPath)}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-elevation-3 border border-white/[0.05]"
                />
              </div>
            ) : content !== null ? (
              <div className="relative">
                <pre className="p-4 text-[13px] leading-6 whitespace-pre-wrap break-words" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {content.split('\n').map((line, i) => (
                    <div key={i} className="flex hover:bg-white/[0.02] rounded-sm group">
                      <span className="select-none w-12 text-right pr-4 text-zinc-700/50 group-hover:text-zinc-600 flex-shrink-0 transition-colors">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-zinc-300">{line || ' '}</span>
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
