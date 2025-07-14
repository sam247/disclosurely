import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@4.0.0";

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
          const { error: emailError } = await resend.emails.send({
            from: 'Disclosurely <notifications@disclosurely.com>',
            to: [user.email],
            subject: `New Case Received: ${report.tracking_id}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; font-size: 24px;">New Case Received</h1>
                </div>
                
                <div style="background-color: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                  <p>Hello ${user.first_name || 'Team Member'},</p>
                  
                  <p>A new case has been submitted to your organization dashboard:</p>
                  
                  <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
                    <p><strong>Tracking ID:</strong> ${report.tracking_id}</p>
                    <p><strong>Title:</strong> ${report.title}</p>
                    <p><strong>Type:</strong> ${report.report_type}</p>
                    <p><strong>Priority:</strong> ${report.priority}/5</p>
                    <p><strong>Submitted:</strong> ${new Date(report.created_at).toLocaleString()}</p>
                    <p><strong>Organization:</strong> ${report.organizations.name}</p>
                  </div>
                  
                  <p>Please log in to your dashboard to review and take action on this case:</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://app.disclosurely.com/dashboard" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                      View Dashboard
                    </a>
                  </div>
                  
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                  
                  <p style="font-size: 12px; color: #6b7280;">
                    This is an automated notification from ${report.organizations.name}. 
                    You are receiving this because you are registered as a case handler for this organization.
                  </p>
                </div>
              </div>
            `,
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
        user_id: users?.[0]?.id || null,
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
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});