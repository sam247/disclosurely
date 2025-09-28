import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reportId } = await req.json()
    
    console.log('Triggering notification emails for report:', reportId)

    // Call the email notification function
    const emailResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification-emails`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({ reportId })
      }
    )

    const result = await emailResponse.json()
    
    if (!emailResponse.ok) {
      console.error('Email notification failed:', result)
      return new Response(JSON.stringify({
        error: 'Failed to send notifications',
        details: result
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Email notifications triggered successfully:', result)

    return new Response(JSON.stringify({
      success: true,
      emailResult: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Notification trigger error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: (error as Error).message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})