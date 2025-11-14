import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { createOrUpdatePartneroCustomer, getOrCreateReferralLink } from "../_shared/partnero.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Get auth token from header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user?.email) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Get email from request body or use authenticated user's email
    const { email } = await req.json();
    const userEmail = email || user.email;

    // Create or update customer in Partnero
    const partneroCustomer = await createOrUpdatePartneroCustomer(
      userEmail,
      {
        customerKey: user.id,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
      }
    );

    // Get or create referral link
    const referralLink = await getOrCreateReferralLink(partneroCustomer);

    // Get origin to construct full URL
    const origin = req.headers.get("origin") || "https://app.disclosurely.com";
    const fullReferralUrl = referralLink.url.startsWith('http')
      ? referralLink.url
      : `${origin}/pricing?ref=${referralLink.key}`;

    return new Response(
      JSON.stringify({
        referralLink: fullReferralUrl,
        referralCode: referralLink.key,
        partneroCustomerId: partneroCustomer.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[GET-REFERRAL-LINK] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

