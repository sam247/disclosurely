
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  try {
    console.log("Checking for unread messages...");

    // Get all organizations
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('id')
      .eq('is_active', true);

    if (orgsError || !organizations) {
      console.error('Error fetching organizations:', orgsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch organizations' }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check each organization for unread messages
    for (const org of organizations) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: unreadMessages, error: messagesError } = await supabase
        .from('report_messages')
        .select(`
          *,
          reports!inner (organization_id)
        `)
        .eq('is_read', false)
        .eq('sender_type', 'whistleblower')
        .eq('reports.organization_id', org.id)
        .lt('created_at', twentyFourHoursAgo);

      if (messagesError) {
        console.error('Error fetching unread messages for org', org.id, ':', messagesError);
        continue;
      }

      if (unreadMessages && unreadMessages.length > 0) {
        console.log(`Found ${unreadMessages.length} unread messages for org ${org.id}`);
        
        // Call the notification function
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/send-notification-emails`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              type: 'unread_messages',
              organizationId: org.id,
            }),
          });

          if (!response.ok) {
            console.error('Failed to send notification emails for org', org.id);
          }
        } catch (notificationError) {
          console.error('Error calling notification function:', notificationError);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Unread messages check completed',
      organizationsChecked: organizations.length 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in check-unread-messages:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
