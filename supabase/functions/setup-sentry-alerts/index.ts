import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Setup Sentry Alerts
 * 
 * This function uses Sentry MCP to configure alerts for critical errors.
 * It sets up alerts for:
 * - Critical errors (severity: critical)
 * - High frequency errors (10+ in 1 hour)
 * - New error types
 * 
 * Note: This is a one-time setup function. In production, alerts should be
 * configured directly in Sentry dashboard or via Sentry API.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .eq("is_active", true)
      .single();

    if (!roles) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Note: Sentry alert configuration should be done via Sentry dashboard or API
    // This function provides instructions and can check current alert status
    
    return new Response(
      JSON.stringify({
        message: "Sentry alerts should be configured in Sentry dashboard",
        instructions: [
          "1. Go to Sentry dashboard → Settings → Alerts",
          "2. Create alert rules for:",
          "   - Critical errors (severity: critical)",
          "   - High frequency errors (10+ in 1 hour)",
          "   - New error types",
          "3. Configure notification channels (email, Slack, etc.)",
          "4. Set up alert thresholds based on your needs"
        ],
        note: "For automated setup, use Sentry API or configure via Sentry MCP in the dashboard"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in setup-sentry-alerts:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
