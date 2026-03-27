import { NextRequest, NextResponse } from 'next/server';
import { getFtpService } from '../../../../../server/state';
import mime from 'mime-types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
  }

  try {
    const ftpService = getFtpService();

    const exists = await ftpService.fileExists(path);
    if (!exists) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const content = await ftpService.getFileContent(path);
    const contentType = mime.lookup(path) || 'application/octet-stream';

    return new NextResponse(new Uint8Array(content), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': content.length.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to preview file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
