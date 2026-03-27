import * as ftp from 'basic-ftp';
import { Writable } from 'stream';
import { FtpFile, FileSnapshot } from './types';

export class FtpService {
  private client: ftp.Client;
  private _isConnected: boolean = false;
  private connecting: boolean = false;

  constructor() {
    this.client = new ftp.Client();
    this.client.ftp.verbose = false;
  }

  async connect(): Promise<void> {
    if (this._isConnected || this.connecting) return;
    this.connecting = true;
    try {
      await this.client.access({
        host: process.env.FTP_HOST || 'localhost',
        port: 21,
        user: process.env.FTP_USER || 'testuser',
        password: process.env.FTP_PASS || 'testpass',
        secure: process.env.FTP_SECURE === 'true',
      });
      this._isConnected = true;
    } catch (err) {
      this._isConnected = false;
      throw err;
    } finally {
      this.connecting = false;
    }
  }

  async ensureConnected(): Promise<void> {
    if (!this._isConnected) {
      await this.connect();
    }
    // Test connection with a simple command
    try {
      await this.client.pwd();
    } catch {
      this._isConnected = false;
      await this.connect();
    }
  }

  isConnected(): boolean {
    return this._isConnected;
  }

  async disconnect(): Promise<void> {
    this.client.close();
    this._isConnected = false;
  }

  async listDirectory(dirPath: string): Promise<FtpFile[]> {
    await this.ensureConnected();
    const items = await this.client.list(dirPath);
    const normalizedDir = dirPath.endsWith('/') ? dirPath : dirPath + '/';
    const prefix = normalizedDir === '/' ? '/' : normalizedDir;

    return items.map((item) => ({
      path: prefix + item.name,
      name: item.name,
      type: item.isDirectory ? 'directory' as const : 'file' as const,
      size: item.size,
      modifiedAt: item.modifiedAt
        ? item.modifiedAt.toISOString()
        : new Date().toISOString(),
    }));
  }

  async getSnapshot(basePath: string = '/'): Promise<FileSnapshot> {
    await this.ensureConnected();
    const snapshot: FtpFile[] = [];
    await this.recursiveList(basePath, snapshot, 0);
    return snapshot;
  }

  private async recursiveList(
    dirPath: string,
    accumulator: FtpFile[],
    depth: number
  ): Promise<void> {
    if (depth > 10) return; // Safety limit

    try {
      const items = await this.listDirectory(dirPath);
      for (const item of items) {
        accumulator.push(item);
        if (item.type === 'directory') {
          await this.recursiveList(item.path, accumulator, depth + 1);
        }
      }
    } catch (err) {
      console.error(`Error listing ${dirPath}:`, err);
    }
  }

  async getFileContent(filePath: string): Promise<Buffer> {
    await this.ensureConnected();
    const chunks: Buffer[] = [];
    const writable = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      },
    });

    await this.client.downloadTo(writable, filePath);
    return Buffer.concat(chunks);
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await this.ensureConnected();
      await this.client.size(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
