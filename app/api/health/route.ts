import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'urcheck API',
      version: '1.0.0',
    },
    { status: 200 }
  );
}
