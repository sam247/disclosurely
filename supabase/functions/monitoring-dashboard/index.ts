import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EdgeFunctionError {
  function: string;
  errorCount: number;
  lastError: string;
  avgExecutionTime: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = userData.user;
    
    // Check if user is the owner (only sampettiford@googlemail.com)
    if (user.email !== 'sampettiford@googlemail.com') {
      return new Response(JSON.stringify({ error: "Access denied" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Get edge function logs from the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Note: Supabase doesn't expose edge function logs via API directly
    // This would need to be implemented via a database table that stores logs
    // For now, we'll return a structure that can be populated
    
    const edgeFunctionErrors: EdgeFunctionError[] = [];
    
    // Get API logs (if available)
    // This would require querying Supabase's internal logs table
    // which may not be accessible via the API
    
    const response = {
      sentry: {
        errorsLast24h: 0, // Would be fetched from Sentry API
        errorsLast7d: 0, // Would be fetched from Sentry API
        unresolvedIssues: 0, // Would be fetched from Sentry API
        lastUpdated: new Date().toISOString(),
      },
      supabase: {
        edgeFunctionErrors: edgeFunctionErrors,
        apiErrors: 0, // Would be calculated from logs
        lastUpdated: new Date().toISOString(),
      },
      system: {
        status: 'healthy' as const,
        alerts: [] as string[],
        lastUpdated: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

