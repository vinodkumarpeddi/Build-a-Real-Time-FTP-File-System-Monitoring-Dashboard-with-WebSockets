import { NextRequest, NextResponse } from 'next/server';
import { getPollingService } from '../../../../server/state';

export async function GET() {
  try {
    const pollingService = getPollingService();
    return NextResponse.json({
      pollingIntervalMs: pollingService.getIntervalMs(),
    });
  } catch {
    return NextResponse.json({
      pollingIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS || '5000', 10),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pollingIntervalMs } = body;

    if (typeof pollingIntervalMs !== 'number' || pollingIntervalMs < 1000) {
      return NextResponse.json(
        { error: 'pollingIntervalMs must be a number >= 1000' },
        { status: 400 }
      );
    }

    const pollingService = getPollingService();
    await pollingService.setIntervalMs(pollingIntervalMs);

    return NextResponse.json({
      pollingIntervalMs: pollingService.getIntervalMs(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update config';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
