import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createEmailTemplate } from "../shared/email-template.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('New case notification function triggered');
    
    const { reportId } = await req.json();
    
    if (!reportId) {
      throw new Error('Report ID is required');
    }
    
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get report details and organization users
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        id,
        tracking_id,
        title,
        created_at,
        report_type,
        priority,
        organization_id,
        organizations!inner(
          name
        )
      `)
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      console.error('Error fetching report:', reportError);
      throw new Error('Report not found');
    }

    // Get organization users who should be notified
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('organization_id', report.organization_id)
      .eq('is_active', true)
      .in('role', ['admin', 'org_admin', 'case_handler']);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw new Error('Failed to fetch organization users');
    }

    console.log(`Found ${users?.length || 0} users to notify for new case ${report.tracking_id}`);

    let emailsSent = 0;

    // Send email to each user
    for (const user of users || []) {
      if (user.email) {
        try {
          // Create email template utility
          const createEmailTemplate = (options: {
            title: string;
            content: string;
            organizationName?: string;
            brandColor?: string;
            ctaButton?: {
              text: string;
              url: string;
            };
            footerText?: string;
          }) => {
            const { title, content, organizationName, brandColor = '#000000', ctaButton, footerText } = options;
            
            return `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>${title}</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 40px 0;">
                        <table role="presentation" style="width: 600px; border-collapse: collapse; background: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
                          <!-- Header with Disclosurely logo -->
                          <tr>
                            <td style="background: #000000; padding: 20px 30px; text-align: center;">
                              <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                                <div style="background: white; padding: 8px 12px; border-radius: 4px; margin-right: 12px;">
                                  <span style="color: #000000; font-weight: bold; font-size: 16px;">DISCLOSURELY</span>
                                </div>
                              </div>
                              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">${title}</h1>
                              ${organizationName ? `<p style="color: rgba(255, 255, 255, 0.8); margin: 5px 0 0 0; font-size: 14px;">${organizationName}</p>` : ''}
                            </td>
                          </tr>
                          
                          <!-- Main content -->
                          <tr>
                            <td style="padding: 40px 30px;">
                              ${content}
                              
                              ${ctaButton ? `
                                <div style="text-align: center; margin: 32px 0;">
                                  <a href="${ctaButton.url}" style="background: ${brandColor}; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                                    ${ctaButton.text}
                                  </a>
                                </div>
                              ` : ''}
                              
                              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                              
                              <p style="font-size: 12px; color: #9ca3af; margin: 0; text-align: center;">
                                ${footerText || 'This is an automated notification from Disclosurely. If you believe you received this email in error, please contact your administrator.'}
                              </p>
                            </td>
                          </tr>
                          
                          <!-- Footer -->
                          <tr>
                            <td style="background: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                              <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0;">
                                © ${new Date().getFullYear()} Disclosurely. All rights reserved.
                              </p>
                              <p style="font-size: 11px; color: #9ca3af; margin: 0;">
                                Secure whistleblowing and compliance management platform
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
              </html>
            `;
          };

          const emailHtml = createEmailTemplate({
            title: 'New Case Received',
            organizationName: (report as any).organizations?.name,
            brandColor: '#2563eb',
            content: `
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                Hello ${user.first_name || 'Team Member'},
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                A new case has been submitted to your organization dashboard:
              </p>
              
              <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
                <p style="margin: 0 0 8px 0;"><strong>Tracking ID:</strong> ${report.tracking_id}</p>
                <p style="margin: 0 0 8px 0;"><strong>Title:</strong> ${report.title}</p>
                <p style="margin: 0 0 8px 0;"><strong>Type:</strong> ${report.report_type}</p>
                <p style="margin: 0 0 8px 0;"><strong>Priority:</strong> ${report.priority}/5</p>
                <p style="margin: 0 0 8px 0;"><strong>Submitted:</strong> ${new Date(report.created_at).toLocaleString()}</p>
                <p style="margin: 0;"><strong>Organization:</strong> ${(report as any).organizations?.name}</p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                Please log in to your dashboard to review and take action on this case.
              </p>
            `,
            ctaButton: {
              text: 'View Dashboard',
              url: 'https://app.disclosurely.com/dashboard'
            },
            footerText: `This is an automated notification from ${(report as any).organizations?.name || 'Disclosurely'}. You are receiving this because you are registered as a case handler for this organization.`
          });

          const { error: emailError } = await resend.emails.send({
            from: 'Disclosurely <notifications@disclosurely.com>',
            to: [user.email],
            subject: `New Case Received: ${report.tracking_id}`,
            html: emailHtml,
          });

          if (emailError) {
            console.error(`Error sending email to ${user.email}:`, emailError);
          } else {
            console.log(`Email sent successfully to ${user.email}`);
            emailsSent++;
          }
        } catch (emailSendError) {
          console.error(`Failed to send email to ${user.email}:`, emailSendError);
        }
      }
    }

    // Log the notification
    await supabase
      .from('email_notifications')
      .insert({
        // @ts-ignore
        user_id: (users as any)?.[0]?.id || null,
        organization_id: report.organization_id,
        report_id: report.id,
        notification_type: 'new_case',
        email_address: users?.map(u => u.email).join(', ') || '',
        subject: `New Case Received: ${report.tracking_id}`,
        metadata: {
          tracking_id: report.tracking_id,
          emails_sent: emailsSent,
          recipients_count: users?.length || 0
        }
      });

    console.log(`New case notification completed. Emails sent: ${emailsSent}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Notification sent for case ${report.tracking_id}`,
      emailsSent,
      reportId: report.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-new-case-notification function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: (error as Error).message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});