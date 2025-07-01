
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[AUTO-APPROVE] Starting auto-approval of erasure requests...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auto-approve erasure requests that are older than 24 hours
    // This gives users time to cancel if submitted accidentally
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: pendingRequests, error: fetchError } = await supabase
      .from('data_erasure_requests')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', oneDayAgo);

    if (fetchError) {
      console.error('[AUTO-APPROVE] Error fetching pending requests:', fetchError);
      throw fetchError;
    }

    let approvedCount = 0;
    for (const request of pendingRequests || []) {
      console.log(`[AUTO-APPROVE] Auto-approving erasure request ${request.id} for ${request.email_address}`);
      
      const { error: updateError } = await supabase
        .from('data_erasure_requests')
        .update({
          status: 'approved',
          reviewed_by: null, // System approval
          review_notes: 'Automatically approved after 24-hour review period',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (updateError) {
        console.error(`[AUTO-APPROVE] Error updating request ${request.id}:`, updateError);
      } else {
        approvedCount++;
      }
    }

    console.log(`[AUTO-APPROVE] Auto-approved ${approvedCount} erasure requests`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Auto-approved ${approvedCount} erasure requests` 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('[AUTO-APPROVE] Error in auto-approval process:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
