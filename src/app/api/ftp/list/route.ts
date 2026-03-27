import { NextRequest, NextResponse } from 'next/server';
import { getFtpService } from '../../../../../server/state';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '/';

  try {
    const ftpService = getFtpService();
    const files = await ftpService.listDirectory(path);
    return NextResponse.json({ files });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to list directory';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
