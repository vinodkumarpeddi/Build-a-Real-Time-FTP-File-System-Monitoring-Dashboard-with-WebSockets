import { FtpFile, FileSnapshot, SnapshotDiff } from './types';

export function diffSnapshots(previous: FileSnapshot, current: FileSnapshot): SnapshotDiff {
  const previousMap = new Map<string, FtpFile>();
  for (const file of previous) {
    previousMap.set(file.path, file);
  }

  const added: FtpFile[] = [];
  const modified: FtpFile[] = [];

  for (const file of current) {
    const prev = previousMap.get(file.path);
    if (!prev) {
      added.push(file);
    } else {
      if (prev.size !== file.size || prev.modifiedAt !== file.modifiedAt) {
        modified.push(file);
      }
      previousMap.delete(file.path);
    }
  }

  const deleted: FtpFile[] = Array.from(previousMap.values());

  return { added, modified, deleted };
}
