import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

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
    console.log('Processing pending email notifications...');

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Get pending email notifications
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('email_notifications')
      .select(`
        id,
        report_id,
        organization_id,
        notification_type,
        reports (
          title,
          tracking_id,
          report_type,
          created_at
        ),
        organizations (
          name,
          custom_logo_url,
          logo_url
        )
      `)
      .eq('status', 'pending')
      .limit(10);

    if (fetchError) {
      console.error('Error fetching pending notifications:', fetchError);
      throw fetchError;
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log('No pending email notifications found');
      return new Response(JSON.stringify({ 
        message: 'No pending notifications',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${pendingNotifications.length} pending notifications`);

    let emailsSent = 0;
    let emailsFailed = 0;

    // Process each notification
    for (const notification of pendingNotifications) {
      try {
        console.log(`Processing notification ${notification.id} for report ${notification.report_id}`);

        // Get users to notify for this organization
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, email, display_name, role')
          .eq('organization_id', notification.organization_id)
          .eq('is_active', true)
          .in('role', ['admin', 'case_handler', 'org_admin']);

        if (usersError) {
          console.error('Error fetching users:', usersError);
          continue;
        }

        if (!users || users.length === 0) {
          console.log(`No active users found for organization ${notification.organization_id}`);
          continue;
        }

        const report = notification.reports;
        const organization = notification.organizations;

        // Send email to each user
        for (const user of users) {
          if (!user.email) {
            console.log(`No email address for user ${user.id}`);
            continue;
          }

          try {
            const emailResponse = await resend.emails.send({
              from: 'Disclosurely <notifications@disclosurely.com>',
              to: [user.email],
              // @ts-ignore
              subject: `New Report Submitted - ${(report as any).tracking_id}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h1 style="color: #2563eb; margin: 0;">New Report Submitted</h1>
                    // @ts-ignore
                    <p style="color: #6b7280; margin: 10px 0 0 0;">${(organization as any)?.name || 'Your organization'} Compliance Team</p>
                  </div>
                  
                  <div style="padding: 20px 0;">
                    <p>Hello ${user.display_name || user.email},</p>
                    
                    <p>A new report has been submitted and requires your attention:</p>
                    
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                      <strong>Report Details:</strong><br>
                      // @ts-ignore
                      <strong>Tracking ID:</strong> ${(report as any).tracking_id}<br>
                      // @ts-ignore
                      <strong>Title:</strong> ${(report as any).title}<br>
                      // @ts-ignore
                      <strong>Type:</strong> ${(report as any).report_type}<br>
                      // @ts-ignore
                      <strong>Submitted:</strong> ${new Date((report as any).created_at).toLocaleDateString()}<br>
                    </div>
                    
                    <p>Please log into your dashboard to review this report and take appropriate action.</p>
                    
                    <div style="margin: 30px 0;">
                      <a href="https://app.disclosurely.com/login" 
                         style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        View Report Dashboard
                      </a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                      This is an automated notification. Please do not reply to this email.
                    </p>
                  </div>
                </div>
              `,
            });

            if (emailResponse.error) {
              console.error(`Failed to send email to ${user.email}:`, emailResponse.error);
              emailsFailed++;
            } else {
              console.log(`Email sent successfully to ${user.email}`);
              emailsSent++;
            }

          } catch (emailError) {
            console.error(`Error sending email to ${user.email}:`, emailError);
            emailsFailed++;
          }
        }

        // Mark notification as sent
        const { error: updateError } = await supabase
          .from('email_notifications')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString(),
            emails_sent: emailsSent,
            emails_failed: emailsFailed
          })
          .eq('id', notification.id);

        if (updateError) {
          console.error('Error updating notification status:', updateError);
        }

      } catch (notificationError) {
        console.error(`Error processing notification ${notification.id}:`, notificationError);
        
        // Mark notification as failed
        await supabase
          .from('email_notifications')
          .update({ 
            status: 'failed',
            error_message: (notificationError as Error).message
          })
          .eq('id', notification.id);
      }
    }

    console.log(`Email processing complete. Sent: ${emailsSent}, Failed: ${emailsFailed}`);

    return new Response(JSON.stringify({
      success: true,
      processed: pendingNotifications.length,
      emailsSent,
      emailsFailed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-pending-email-notifications:', error);
    return new Response(JSON.stringify({
      error: (error as Error).message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});