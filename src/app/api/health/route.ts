import { NextResponse } from 'next/server';
import * as ftp from 'basic-ftp';

export async function GET() {
  let connected = false;
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: process.env.FTP_HOST || 'localhost',
      port: 21,
      user: process.env.FTP_USER || 'testuser',
      password: process.env.FTP_PASS || 'testpass',
      secure: process.env.FTP_SECURE === 'true',
    });
    await client.pwd();
    connected = true;
  } catch {
    connected = false;
  } finally {
    client.close();
  }

  return NextResponse.json({
    status: 'ok',
    ftpConnection: connected ? 'connected' : 'disconnected',
  });
}
