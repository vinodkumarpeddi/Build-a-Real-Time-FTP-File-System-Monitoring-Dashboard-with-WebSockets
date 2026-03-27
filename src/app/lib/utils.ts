export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function toBase64(str: string): string {
  if (typeof window !== 'undefined') {
    return btoa(str);
  }
  return Buffer.from(str).toString('base64');
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export function getFileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

export type FileIconType = 'code' | 'image' | 'text' | 'pdf' | 'archive' | 'data' | 'video' | 'audio' | 'folder' | 'file';

export function getFileIconType(name: string, type: 'file' | 'directory'): FileIconType {
  if (type === 'directory') return 'folder';
  const ext = getFileExtension(name);
  const codeExts = ['js', 'ts', 'tsx', 'jsx', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'css', 'scss', 'html', 'vue', 'svelte', 'php'];
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'];
  const textExts = ['txt', 'md', 'log', 'csv', 'env', 'yml', 'yaml', 'toml', 'ini', 'conf', 'cfg'];
  const dataExts = ['json', 'xml', 'sql'];
  const archiveExts = ['zip', 'tar', 'gz', 'rar', '7z'];
  const videoExts = ['mp4', 'avi', 'mov', 'mkv', 'webm'];
  const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac'];

  if (codeExts.includes(ext)) return 'code';
  if (imageExts.includes(ext)) return 'image';
  if (textExts.includes(ext)) return 'text';
  if (ext === 'pdf') return 'pdf';
  if (dataExts.includes(ext)) return 'data';
  if (archiveExts.includes(ext)) return 'archive';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  return 'file';
}

export function isPreviewable(name: string): boolean {
  const ext = getFileExtension(name);
  const previewable = [
    'txt', 'md', 'log', 'csv', 'json', 'xml', 'yml', 'yaml', 'toml', 'ini', 'conf', 'cfg',
    'js', 'ts', 'tsx', 'jsx', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'css', 'scss',
    'html', 'vue', 'svelte', 'php', 'sql', 'sh', 'bash', 'env',
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp',
  ];
  return previewable.includes(ext);
}

export function isImageFile(name: string): boolean {
  const ext = getFileExtension(name);
  return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'].includes(ext);
}
