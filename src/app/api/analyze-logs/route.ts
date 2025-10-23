export async function POST(request: Request) {
  try {
    const { analysisType, timeRange, logLevel } = await request.json();

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase URL or Service Role Key not configured for AI analysis API route.');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-logs-with-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ analysisType, timeRange, logLevel }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to trigger AI log analysis Edge Function:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to get AI analysis', details: errorData }), { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data));
  } catch (error) {
    console.error('API route /api/analyze-logs error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: (error as Error).message }), { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(JSON.stringify({}), {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}