import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { analysisType = 'recent', timeRange = '24h', logLevel = 'ERROR', context = null } = await request.json();

    // Call the AI analysis Edge Function
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-logs-with-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        analysisType,
        timeRange,
        logLevel,
        context
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('AI analysis Edge Function error:', errorData);
      return NextResponse.json(
        { error: 'AI analysis failed', details: errorData },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in analyze-logs API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
