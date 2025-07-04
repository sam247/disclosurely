
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'new_report' | 'unread_messages';
  reportId?: string;
  organizationId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, reportId, organizationId }: NotificationRequest = await req.json();

    if (type === 'new_report' && reportId) {
      await handleNewReportNotification(reportId);
    } else if (type === 'unread_messages' && organizationId) {
      await handleUnreadMessagesNotification(organizationId);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-notification-emails:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

async function handleNewReportNotification(reportId: string) {
  // Get report details
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select(`
      *,
      organizations (name, id)
    `)
    .eq('id', reportId)
    .single();

  if (reportError || !report) {
    console.error('Error fetching report:', reportError);
    return;
  }

  // Get organization users who should be notified
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', report.organization_id)
    .eq('is_active', true)
    .in('role', ['admin', 'case_handler', 'org_admin']);

  if (usersError || !users) {
    console.error('Error fetching users:', usersError);
    return;
  }

  // Send emails to all relevant users
  for (const user of users) {
    try {
      await resend.emails.send({
        from: "Disclosurely <notifications@disclosurely.com>",
        to: [user.email],
        subject: `New Report Submitted - ${report.tracking_id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Report Submitted</h2>
            <p>Hello ${user.first_name || user.email},</p>
            <p>A new report has been submitted to your organization.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Report Details</h3>
              <p><strong>Tracking ID:</strong> ${report.tracking_id}</p>
              <p><strong>Title:</strong> ${report.title}</p>
              <p><strong>Type:</strong> ${report.report_type}</p>
              <p><strong>Status:</strong> ${report.status}</p>
              <p><strong>Submitted:</strong> ${new Date(report.created_at).toLocaleDateString()}</p>
            </div>
            
            <p>Please log in to your dashboard to review this report.</p>
            
            <div style="margin: 30px 0;">
              <a href="https://app.disclosurely.com/dashboard/reports" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Report
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from Disclosurely. 
              Please do not reply to this email.
            </p>
          </div>
        `,
      });

      console.log(`New report notification sent to ${user.email}`);
    } catch (emailError) {
      console.error(`Failed to send email to ${user.email}:`, emailError);
    }
  }
}

async function handleUnreadMessagesNotification(organizationId: string) {
  // Get reports with unread messages older than 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: reportsWithUnreadMessages, error } = await supabase
    .from('report_messages')
    .select(`
      *,
      reports (
        *,
        organizations (name, id)
      )
    `)
    .eq('is_read', false)
    .eq('sender_type', 'whistleblower')
    .lt('created_at', twentyFourHoursAgo);

  if (error || !reportsWithUnreadMessages) {
    console.error('Error fetching unread messages:', error);
    return;
  }

  // Group messages by report
  const reportGroups = reportsWithUnreadMessages.reduce((acc, message) => {
    const reportId = message.report_id;
    if (!acc[reportId]) {
      acc[reportId] = {
        report: message.reports,
        messages: []
      };
    }
    acc[reportId].messages.push(message);
    return acc;
  }, {} as any);

  // Get organization users
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .in('role', ['admin', 'case_handler', 'org_admin']);

  if (usersError || !users) {
    console.error('Error fetching users:', usersError);
    return;
  }

  // Send notifications for each report with unread messages
  for (const [reportId, group] of Object.entries(reportGroups)) {
    const { report, messages } = group as any;
    
    for (const user of users) {
      try {
        await resend.emails.send({
          from: "Disclosurely <notifications@disclosurely.com>",
          to: [user.email],
          subject: `Unread Messages - ${report.tracking_id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Unread Messages Reminder</h2>
              <p>Hello ${user.first_name || user.email},</p>
              <p>You have ${messages.length} unread message(s) that have been waiting for more than 24 hours.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">Report Details</h3>
                <p><strong>Tracking ID:</strong> ${report.tracking_id}</p>
                <p><strong>Title:</strong> ${report.title}</p>
                <p><strong>Unread Messages:</strong> ${messages.length}</p>
                <p><strong>oldest Message:</strong> ${new Date(messages[0].created_at).toLocaleDateString()}</p>
              </div>
              
              <p>Please review and respond to these messages promptly to maintain trust with the whistleblower.</p>
              
              <div style="margin: 30px 0;">
                <a href="https://app.disclosurely.com/dashboard/reports" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Messages
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                This is an automated notification from Disclosurely. 
                Please do not reply to this email.
              </p>
            </div>
          `,
        });

        console.log(`Unread messages notification sent to ${user.email} for report ${report.tracking_id}`);
      } catch (emailError) {
        console.error(`Failed to send unread messages email to ${user.email}:`, emailError);
      }
    }
  }
}

serve(handler);
