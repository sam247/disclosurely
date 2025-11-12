import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Uptics.io API base URL
const UPTICS_API_BASE = "https://api.uptics.io/v1";

interface SendEmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  campaign_id?: string;
  variables?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const upticsApiKey = Deno.env.get("UPTICS_API_KEY");
    if (!upticsApiKey) {
      return new Response(
        JSON.stringify({ error: "UPTICS_API_KEY not configured" }),
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

    // Prepare email data for Uptics.io API
    // Uptics.io API structure - adjust based on their actual API docs
    const emailData: any = {
      to: recipients,
      subject: body.subject,
      html: body.html || body.text || "",
      text: body.text || "",
      from_name: body.from_name || "Disclosurely",
      from_email: body.from_email || "support@disclosurely.com",
      reply_to: body.reply_to || body.from_email || "support@disclosurely.com",
      ...(body.variables && { variables: body.variables }),
      ...(body.campaign_id && { campaign_id: body.campaign_id }),
    };

    // Uptics.io email send endpoint
    const sendUrl = `${UPTICS_API_BASE}/email/send`;
    
    const response = await fetch(sendUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${upticsApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[UPTICS] Send API error:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email via Uptics.io",
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
        message: "Email sent via Uptics.io",
        result: result 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[UPTICS] Error:", error);
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

