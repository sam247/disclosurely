import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("Missing Supabase env vars");
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const body = await req.json();
    const action = String(body?.action || '').toLowerCase();
    const trackingId = String(body?.trackingId || '').toUpperCase().replace(/\s+/g, '');

    if (!/^DIS-[A-Z0-9]{8}$/.test(trackingId)) {
      return new Response(JSON.stringify({ error: "Invalid tracking ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Helper to fetch report and org branding
    const getReportWithOrg = async () => {
      const { data: report } = await supabase
        .from("reports")
        .select(
          "id, tracking_id, title, status, created_at, organization_id, organizations(name, brand_color, logo_url, custom_logo_url)"
        )
        .eq("tracking_id", trackingId)
        .neq("status", "archived") // Exclude archived reports
        .maybeSingle();
      return report;
    };

    if (action === 'load') {
      const report = await getReportWithOrg();

      if (!report) {
        return new Response(JSON.stringify({ error: "Report not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: messages } = await supabase
        .from("report_messages")
        .select("id, sender_type, encrypted_message, created_at, is_read")
        .eq("report_id", report.id)
        .order("created_at", { ascending: true })
        .limit(100);

      return new Response(
        JSON.stringify({
          report,
          organization: report.organizations,
          messages: messages || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'send') {
      const message = String(body?.message || '').trim();
      if (!message) {
        return new Response(JSON.stringify({ error: "Message is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (message.length > 2000) {
        return new Response(JSON.stringify({ error: "Message too long" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const report = await getReportWithOrg();
      if (!report) {
        return new Response(JSON.stringify({ error: "Report not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("report_messages")
        .insert({
          report_id: report.id,
          sender_type: 'whistleblower',
          encrypted_message: message,
        })
        .select("id, sender_type, encrypted_message, created_at, is_read")
        .single();

      if (error) {
        console.error('Insert message error', error);
        // Log failed attempt
        await supabase.rpc('log_messaging_attempt', {
          p_report_id: report.id,
          p_sender_type: 'whistleblower',
          p_success: false,
          p_failure_reason: error.message?.slice(0, 200) || 'insert_failed',
          p_ip_address: req.headers.get('x-forwarded-for') || null,
          p_user_agent: req.headers.get('user-agent') || null,
        });
        return new Response(JSON.stringify({ error: "Unable to send message" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Log successful attempt
      await supabase.rpc('log_messaging_attempt', {
        p_report_id: report.id,
        p_sender_type: 'whistleblower',
        p_success: true,
        p_failure_reason: null,
        p_ip_address: req.headers.get('x-forwarded-for') || null,
        p_user_agent: req.headers.get('user-agent') || null,
      });

      return new Response(JSON.stringify({ message: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("anonymous-report-messaging error", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});