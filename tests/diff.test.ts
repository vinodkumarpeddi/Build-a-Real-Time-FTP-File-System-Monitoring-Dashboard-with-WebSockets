import { diffSnapshots } from '../server/diff';
import { FtpFile, FileSnapshot } from '../server/types';

function makeFile(path: string, size: number, modifiedAt: string): FtpFile {
  const name = path.split('/').pop() || path;
  return {
    path,
    name,
    type: 'file',
    size,
    modifiedAt,
  };
}

describe('diffSnapshots', () => {
  it('should detect all files as added when previous snapshot is empty (initial load)', () => {
    const previous: FileSnapshot = [];
    const current: FileSnapshot = [
      makeFile('/file1.txt', 100, '2024-01-01T00:00:00.000Z'),
      makeFile('/file2.txt', 200, '2024-01-01T00:00:00.000Z'),
      makeFile('/dir/file3.txt', 300, '2024-01-01T00:00:00.000Z'),
    ];

    const diff = diffSnapshots(previous, current);

    expect(diff.added).toHaveLength(3);
    expect(diff.modified).toHaveLength(0);
    expect(diff.deleted).toHaveLength(0);
    expect(diff.added.map((f) => f.path)).toEqual(['/file1.txt', '/file2.txt', '/dir/file3.txt']);
  });

  it('should return no changes when snapshots are identical', () => {
    const snapshot: FileSnapshot = [
      makeFile('/file1.txt', 100, '2024-01-01T00:00:00.000Z'),
      makeFile('/file2.txt', 200, '2024-01-02T00:00:00.000Z'),
    ];

    const diff = diffSnapshots(snapshot, [...snapshot]);

    expect(diff.added).toHaveLength(0);
    expect(diff.modified).toHaveLength(0);
    expect(diff.deleted).toHaveLength(0);
  });

  it('should detect only added files', () => {
    const previous: FileSnapshot = [
      makeFile('/file1.txt', 100, '2024-01-01T00:00:00.000Z'),
    ];
    const current: FileSnapshot = [
      makeFile('/file1.txt', 100, '2024-01-01T00:00:00.000Z'),
      makeFile('/file2.txt', 200, '2024-01-02T00:00:00.000Z'),
      makeFile('/file3.txt', 300, '2024-01-03T00:00:00.000Z'),
    ];

    const diff = diffSnapshots(previous, current);

    expect(diff.added).toHaveLength(2);
    expect(diff.modified).toHaveLength(0);
    expect(diff.deleted).toHaveLength(0);
    expect(diff.added.map((f) => f.path)).toEqual(['/file2.txt', '/file3.txt']);
  });

  it('should detect only modified files', () => {
    const previous: FileSnapshot = [
      makeFile('/file1.txt', 100, '2024-01-01T00:00:00.000Z'),
      makeFile('/file2.txt', 200, '2024-01-02T00:00:00.000Z'),
    ];
    const current: FileSnapshot = [
      makeFile('/file1.txt', 150, '2024-01-01T12:00:00.000Z'), // size and time changed
      makeFile('/file2.txt', 200, '2024-01-02T00:00:00.000Z'), // unchanged
    ];

    const diff = diffSnapshots(previous, current);

    expect(diff.added).toHaveLength(0);
    expect(diff.modified).toHaveLength(1);
    expect(diff.deleted).toHaveLength(0);
    expect(diff.modified[0].path).toBe('/file1.txt');
    expect(diff.modified[0].size).toBe(150);
  });

  it('should detect only deleted files', () => {
    const previous: FileSnapshot = [
      makeFile('/file1.txt', 100, '2024-01-01T00:00:00.000Z'),
      makeFile('/file2.txt', 200, '2024-01-02T00:00:00.000Z'),
      makeFile('/file3.txt', 300, '2024-01-03T00:00:00.000Z'),
    ];
    const current: FileSnapshot = [
      makeFile('/file1.txt', 100, '2024-01-01T00:00:00.000Z'),
    ];

    const diff = diffSnapshots(previous, current);

    expect(diff.added).toHaveLength(0);
    expect(diff.modified).toHaveLength(0);
    expect(diff.deleted).toHaveLength(2);
    expect(diff.deleted.map((f) => f.path).sort()).toEqual(['/file2.txt', '/file3.txt']);
  });

  it('should detect mixed changes: additions, modifications, and deletions', () => {
    const previous: FileSnapshot = [
      makeFile('/existing.txt', 100, '2024-01-01T00:00:00.000Z'),
      makeFile('/to-modify.txt', 200, '2024-01-01T00:00:00.000Z'),
      makeFile('/to-delete.txt', 300, '2024-01-01T00:00:00.000Z'),
    ];
    const current: FileSnapshot = [
      makeFile('/existing.txt', 100, '2024-01-01T00:00:00.000Z'), // unchanged
      makeFile('/to-modify.txt', 250, '2024-01-02T00:00:00.000Z'), // modified
      makeFile('/new-file.txt', 400, '2024-01-03T00:00:00.000Z'), // added
    ];

    const diff = diffSnapshots(previous, current);

    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].path).toBe('/new-file.txt');

    expect(diff.modified).toHaveLength(1);
    expect(diff.modified[0].path).toBe('/to-modify.txt');
    expect(diff.modified[0].size).toBe(250);

    expect(diff.deleted).toHaveLength(1);
    expect(diff.deleted[0].path).toBe('/to-delete.txt');
  });
});
