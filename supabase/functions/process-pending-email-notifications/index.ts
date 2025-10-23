import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AI Logging utility
const logToSystem = async (level: string, context: string, message: string, data?: any) => {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data: data || {},
      sessionId: 'email-sender',
      requestId: `email-send-${Date.now()}`
    };

    // Send to logs Edge Function
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify(logEntry)
    });
  } catch (error) {
    console.error('Failed to log to system:', error);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing pending email notifications...');
    await logToSystem('INFO', 'EMAIL_SENDING', 'Starting email sending process');

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    await logToSystem('INFO', 'EMAIL_SENDING', 'Resend client initialized', { 
      hasApiKey: Boolean(Deno.env.get('RESEND_API_KEY')) 
    });

    // Get pending email notifications
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('email_notifications')
      .select(`
        id,
        report_id,
        organization_id,
        notification_type,
        email_address,
        subject,
        metadata,
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
      await logToSystem('ERROR', 'EMAIL_SENDING', 'Failed to fetch pending notifications', { error: fetchError });
      throw fetchError;
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log('No pending email notifications found');
      await logToSystem('INFO', 'EMAIL_SENDING', 'No pending notifications found');
      return new Response(JSON.stringify({ 
        message: 'No pending notifications',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Found', pendingNotifications.length, 'pending notifications');
    await logToSystem('INFO', 'EMAIL_SENDING', `Found ${pendingNotifications.length} pending notifications`, { 
      count: pendingNotifications.length 
    });

    let emailsSent = 0;
    let emailsFailed = 0;

    // Process each notification individually
    for (const notification of pendingNotifications) {
      try {
        console.log('Processing notification', notification.id, 'for email', notification.email_address);
        await logToSystem('INFO', 'EMAIL_SENDING', 'Processing individual notification', { 
          notificationId: notification.id, 
          emailAddress: notification.email_address 
        });

        const report = notification.reports;
        const organization = notification.organizations;

        if (!notification.email_address) {
          console.log('No email address for notification', notification.id);
          await logToSystem('WARN', 'EMAIL_SENDING', 'No email address for notification', { 
            notificationId: notification.id 
          });
          continue;
        }

        try {
          const emailResponse = await resend.emails.send({
            from: 'Disclosurely <notifications@disclosurely.com>',
            to: [notification.email_address],
            subject: notification.subject || `New Report Submitted - ${(report as any)?.tracking_id}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h1 style="color: #2563eb; margin: 0;">New Report Submitted</h1>
                  <p style="color: #6b7280; margin: 10px 0 0 0;">${(organization as any)?.name || 'Your organization'} Compliance Team</p>
                </div>
                
                <div style="padding: 20px 0;">
                  <p>Hello,</p>
                  
                  <p>A new report has been submitted and requires your attention:</p>
                  
                  <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <strong>Report Details:</strong><br>
                    <strong>Tracking ID:</strong> ${(report as any)?.tracking_id}<br>
                    <strong>Title:</strong> ${(report as any)?.title}<br>
                    <strong>Type:</strong> ${(report as any)?.report_type}<br>
                    <strong>Submitted:</strong> ${new Date((report as any)?.created_at).toLocaleDateString()}<br>
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
            console.error(`Failed to send email to ${notification.email_address}:`, emailResponse.error);
            await logToSystem('ERROR', 'EMAIL_SENDING', 'Failed to send email', { 
              notificationId: notification.id, 
              emailAddress: notification.email_address, 
              error: emailResponse.error 
            });
            emailsFailed++;
            
            // Update notification status to failed
            await supabase
              .from('email_notifications')
              .update({ status: 'failed' })
              .eq('id', notification.id);
          } else {
            console.log('Email sent successfully to', notification.email_address);
            await logToSystem('INFO', 'EMAIL_SENDING', 'Email sent successfully', { 
              notificationId: notification.id, 
              emailAddress: notification.email_address,
              emailId: emailResponse.data?.id 
            });
            emailsSent++;
            
            // Update notification status to sent
            await supabase
              .from('email_notifications')
              .update({ 
                status: 'sent',
                sent_at: new Date().toISOString()
              })
              .eq('id', notification.id);
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          await logToSystem('ERROR', 'EMAIL_SENDING', 'Email sending error', { 
            notificationId: notification.id, 
            emailAddress: notification.email_address, 
            error: emailError 
          });
          emailsFailed++;
          
          // Update notification status to failed
          await supabase
            .from('email_notifications')
            .update({ status: 'failed' })
            .eq('id', notification.id);
        }
      } catch (error) {
        console.error('Error processing notification:', error);
        await logToSystem('ERROR', 'EMAIL_SENDING', 'Error processing notification', { 
          notificationId: notification.id, 
          error: error 
        });
        emailsFailed++;
      }
    }

    console.log('Email processing complete. Sent:', emailsSent, 'Failed:', emailsFailed);
    await logToSystem('INFO', 'EMAIL_SENDING', 'Email processing complete', { 
      emailsSent, 
      emailsFailed, 
      total: pendingNotifications.length 
    });

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
    await logToSystem('CRITICAL', 'EMAIL_SENDING', 'Critical error in email processing', { error });
    return new Response(JSON.stringify({
      error: (error as Error).message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});