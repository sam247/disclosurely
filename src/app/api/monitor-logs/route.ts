import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { alertThresholds = {}, enableRealTimeAnalysis = true } = await request.json();

    // Call the real-time monitoring Edge Function
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/monitor-logs-realtime`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        alertThresholds,
        enableRealTimeAnalysis
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Monitoring Edge Function error:', errorData);
      return NextResponse.json(
        { error: 'Monitoring failed', details: errorData },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in monitor-logs API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
