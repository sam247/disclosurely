import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Instantly.ai API base URL
const INSTANTLY_API_BASE = "https://api.instantly.ai/api/v2";

interface SendEmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  campaign_id?: string;
  lead_id?: string;
  variables?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const instantlyApiKey = Deno.env.get("INSTANTLY_API_KEY");
    if (!instantlyApiKey) {
      return new Response(
        JSON.stringify({ error: "INSTANTLY_API_KEY not configured" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const body: SendEmailRequest = await req.json();

    // Validate required fields
    if (!body.to || !body.subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: 'to' and 'subject' are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Convert single email to array
    const recipients = Array.isArray(body.to) ? body.to : [body.to];

    // Prepare email data for Instantly.ai API
    // Instantly.ai API v2 structure may vary - adjust based on their docs
    const emailData: any = {
      emails: recipients.map((email) => ({
        email: email,
        subject: body.subject,
        html_content: body.html || body.text || "",
        text_content: body.text || "",
        from_name: body.from_name || "Disclosurely",
        from_email: body.from_email || "support@disclosurely.com",
        reply_to: body.reply_to || body.from_email || "support@disclosurely.com",
        ...(body.variables && { variables: body.variables }),
      })),
    };

    // If campaign_id is provided, add leads to campaign
    if (body.campaign_id) {
      const campaignUrl = `${INSTANTLY_API_BASE}/campaign/${body.campaign_id}/leads/add`;
      
      const campaignResponse = await fetch(campaignUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${instantlyApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: recipients,
          ...(body.variables && { variables: body.variables }),
        }),
      });

      if (!campaignResponse.ok) {
        const errorText = await campaignResponse.text();
        console.error("[INSTANTLY] Campaign API error:", errorText);
        return new Response(
          JSON.stringify({ 
            error: "Failed to add leads to campaign",
            details: errorText 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: campaignResponse.status,
          }
        );
      }

      const campaignResult = await campaignResponse.json();
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Leads added to campaign",
          campaign_id: body.campaign_id,
          result: campaignResult 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Otherwise, send individual email(s)
    // Note: Instantly.ai API v2 structure - adjust endpoint based on actual API docs
    const sendUrl = `${INSTANTLY_API_BASE}/email/send`;
    
    const response = await fetch(sendUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${instantlyApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[INSTANTLY] Send API error:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email via Instantly.ai",
          details: errorText 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status,
        }
      );
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Email sent via Instantly.ai",
        result: result 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[INSTANTLY] Error:", error);
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

