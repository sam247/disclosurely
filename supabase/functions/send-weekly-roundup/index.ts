import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "https://esm.sh/resend@4.0.0";

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
    console.log('Weekly roundup notification function started');
    
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Calculate date range for the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    console.log('Generating weekly roundup for period:', oneWeekAgo.toISOString(), 'to', new Date().toISOString());

    // Get all active organizations
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('is_active', true);

    if (orgsError) {
      throw new Error('Failed to fetch organizations');
    }

    let totalEmailsSent = 0;

    // Process each organization
    for (const org of organizations || []) {
      try {
        console.log(`Processing weekly roundup for organization: ${org.name}`);

        // Get organization users
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('organization_id', org.id)
          .eq('is_active', true)
          .in('role', ['admin', 'org_admin', 'case_handler']);

        if (usersError || !users?.length) {
          console.log(`No users found for organization ${org.name}`);
          continue;
        }

        // Get weekly statistics
        
        // 1. New cases this week
        const { data: newCases, error: newCasesError } = await supabase
          .from('reports')
          .select('id, tracking_id, title, created_at, status, priority')
          .eq('organization_id', org.id)
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false });

        // 2. Cases resolved this week
        const { data: resolvedCases, error: resolvedError } = await supabase
          .from('reports')
          .select('id, tracking_id, title, resolved_at')
          .eq('organization_id', org.id)
          .gte('resolved_at', oneWeekAgo.toISOString())
          .order('resolved_at', { ascending: false });

        // 3. Open cases (current total)
        const { data: openCases, error: openError } = await supabase
          .from('reports')
          .select('id')
          .eq('organization_id', org.id)
          .in('status', ['new', 'in_review', 'investigating']);

        // 4. New messages this week
        const { data: newMessages, error: messagesError } = await supabase
          .from('report_messages')
          .select(`
            id,
            created_at,
            sender_type,
            reports!inner(
              tracking_id,
              title,
              organization_id
            )
          `)
          .eq('reports.organization_id', org.id)
          .gte('created_at', oneWeekAgo.toISOString());

        // Skip if no data errors
        if (newCasesError || resolvedError || openError || messagesError) {
          console.error(`Error fetching data for ${org.name}:`, { newCasesError, resolvedError, openError, messagesError });
          continue;
        }

        // Calculate statistics
        const stats = {
          newCasesCount: newCases?.length || 0,
          resolvedCasesCount: resolvedCases?.length || 0,
          openCasesCount: openCases?.length || 0,
          newMessagesCount: newMessages?.length || 0,
          organizationMessages: newMessages?.filter(m => m.sender_type === 'organization').length || 0,
          whistleblowerMessages: newMessages?.filter(m => m.sender_type === 'whistleblower').length || 0
        };

        // Generate HTML content
        const htmlContent = generateWeeklyRoundupHTML(org.name, stats, newCases, resolvedCases, oneWeekAgo);

        // Send email to each user
        for (const user of users) {
          if (user.email) {
            try {
              const { error: emailError } = await resend.emails.send({
                from: 'Disclosurely <notifications@disclosurely.com>',
                to: [user.email],
                subject: `Weekly Roundup - ${org.name}`,
                html: htmlContent.replace('{{USER_NAME}}', user.first_name || 'Team Member'),
              });

              if (emailError) {
                console.error(`Error sending weekly roundup to ${user.email}:`, emailError);
              } else {
                console.log(`Weekly roundup sent successfully to ${user.email}`);
                totalEmailsSent++;
              }
            } catch (emailSendError) {
              console.error(`Failed to send weekly roundup to ${user.email}:`, emailSendError);
            }
          }
        }

        // Log the notification
        await supabase
          .from('email_notifications')
          .insert({
            organization_id: org.id,
            notification_type: 'weekly_roundup',
            email_address: users.map(u => u.email).join(', '),
            subject: `Weekly Roundup - ${org.name}`,
            metadata: {
              ...stats,
              emails_sent: users.length,
              week_start: oneWeekAgo.toISOString(),
              week_end: new Date().toISOString()
            }
          });

      } catch (orgError) {
        console.error(`Error processing organization ${org.name}:`, orgError);
      }
    }

    console.log(`Weekly roundup completed. Total emails sent: ${totalEmailsSent}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Weekly roundup sent to ${organizations?.length} organizations`,
      totalEmailsSent,
      organizationsProcessed: organizations?.length || 0
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-weekly-roundup function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: (error as Error).message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateWeeklyRoundupHTML(orgName: string, stats: any, newCases: any[], resolvedCases: any[], weekStart: Date): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Weekly Roundup</h1>
        <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">${orgName}</p>
        <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.8;">
          ${weekStart.toLocaleDateString()} - ${new Date().toLocaleDateString()}
        </p>
      </div>
      
      <!-- Content -->
      <div style="background-color: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; margin-bottom: 25px;">Hello {{USER_NAME}},</p>
        
        <p style="margin-bottom: 25px;">Here's your weekly summary of case activity:</p>
        
        <!-- Statistics Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 25px 0;">
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #10b981;">${stats.newCasesCount}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">New Cases</div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${stats.resolvedCasesCount}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Resolved Cases</div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${stats.openCasesCount}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Open Cases</div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #8b5cf6;">${stats.newMessagesCount}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">New Messages</div>
          </div>
        </div>
        
        <!-- Message Breakdown -->
        ${stats.newMessagesCount > 0 ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px; color: #1f2937;">Message Activity</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #6b7280;">Messages from Organization:</span>
            <span style="font-weight: bold; color: #2563eb;">${stats.organizationMessages}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #6b7280;">Messages from Whistleblowers:</span>
            <span style="font-weight: bold; color: #059669;">${stats.whistleblowerMessages}</span>
          </div>
        </div>
        ` : ''}
        
        <!-- Recent Cases -->
        ${stats.newCasesCount > 0 ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px; color: #1f2937;">Recent New Cases</h3>
          ${newCases.slice(0, 5).map(case_ => `
            <div style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
              <div style="font-weight: bold; color: #1f2937;">${case_.tracking_id}</div>
              <div style="font-size: 14px; color: #6b7280; margin-top: 2px;">${case_.title}</div>
              <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">
                ${new Date(case_.created_at).toLocaleDateString()} • Priority: ${case_.priority}/5
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <!-- Resolved Cases -->
        ${stats.resolvedCasesCount > 0 ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px; color: #1f2937;">Recently Resolved Cases</h3>
          ${resolvedCases.slice(0, 5).map(case_ => `
            <div style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
              <div style="font-weight: bold; color: #10b981;">${case_.tracking_id}</div>
              <div style="font-size: 14px; color: #6b7280; margin-top: 2px;">${case_.title}</div>
              <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">
                Resolved: ${new Date(case_.resolved_at).toLocaleDateString()}
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://app.disclosurely.com/dashboard" 
             style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
            View Full Dashboard
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          This is an automated weekly roundup from ${orgName}.<br>
          You are receiving this because you are registered as a case handler for this organization.
        </p>
      </div>
    </div>
  `;
}