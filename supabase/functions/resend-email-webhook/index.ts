import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Get raw body for logging
    const rawBody = await req.text();
    console.log("[RESEND-WEBHOOK] Raw payload:", rawBody);

    // Parse the webhook payload from Resend
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("[RESEND-WEBHOOK] Failed to parse JSON:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log("[RESEND-WEBHOOK] Parsed payload type:", payload.type || payload.event || "unknown");
    console.log("[RESEND-WEBHOOK] Full payload structure:", JSON.stringify(payload, null, 2));

    // Resend webhook format may vary - handle different possible structures
    // Common formats:
    // 1. { type: "email.received", data: {...} }
    // 2. { event: "email.received", payload: {...} }
    // 3. Direct email data structure
    
    let emailData: any = null;
    const eventType = payload.type || payload.event || "unknown";

    if (eventType === "email.received" || eventType === "email.received.inbound") {
      emailData = payload.data || payload.payload || payload;
    } else if (payload.from || payload.to) {
      // Direct email structure
      emailData = payload;
    }

    if (emailData) {
      // Extract email fields (handle different possible field names)
      const emailId = emailData.email_id || emailData.id || emailData.message_id || `email-${Date.now()}`;
      const fromEmail = emailData.from || emailData.from_email || emailData.sender || "";
      const toEmails = Array.isArray(emailData.to) 
        ? emailData.to 
        : (emailData.to_email ? [emailData.to_email] : (emailData.to ? [emailData.to] : []));
      const subject = emailData.subject || emailData.subject_line || "";
      const htmlContent = emailData.html || emailData.html_content || emailData.body_html || null;
      const textContent = emailData.text || emailData.text_content || emailData.body_text || emailData.body || null;
      const headers = emailData.headers || emailData.email_headers || {};
      const receivedAt = emailData.created_at || emailData.received_at || emailData.timestamp || new Date().toISOString();

      console.log("[RESEND-WEBHOOK] Processing email:", {
        email_id: emailId,
        from: fromEmail,
        to: toEmails,
        subject: subject,
      });

      // Store the email in the database
      const { data, error } = await supabaseClient
        .from("incoming_emails")
        .insert({
          email_id: emailId,
          from_email: fromEmail,
          to_emails: toEmails,
          subject: subject,
          html_content: htmlContent,
          text_content: textContent,
          headers: headers,
          received_at: receivedAt,
          processed: false,
          metadata: {
            raw_payload: payload, // Store full payload for debugging
            event_type: eventType,
          },
        })
        .select()
        .single();

      if (error) {
        console.error("[RESEND-WEBHOOK] Error storing email:", error);
        console.log("[RESEND-WEBHOOK] Email data (not stored):", JSON.stringify(emailData, null, 2));
        
        // Return 200 to prevent Resend from retrying
        // Log error for manual investigation
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Failed to store email",
            message: error.message,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200, // Return 200 so Resend doesn't retry
          }
        );
      }

      console.log("[RESEND-WEBHOOK] Email stored successfully:", data.id);

      // TODO: Add logic here to:
      // - Send notification to support team
      // - Auto-reply if needed
      // - Route to appropriate handler based on subject/from

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email received and stored",
          email_id: emailId,
          stored_id: data.id
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Handle other webhook types or unknown formats
    console.log("[RESEND-WEBHOOK] Unhandled webhook format. Event type:", eventType);
    console.log("[RESEND-WEBHOOK] Full payload:", JSON.stringify(payload, null, 2));

    // Still return 200 to acknowledge receipt
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Webhook received but format not recognized",
        event_type: eventType
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[RESEND-WEBHOOK] Error processing webhook:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

