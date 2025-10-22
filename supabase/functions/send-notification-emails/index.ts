import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { Resend } from "https://esm.sh/resend@4.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { reportId } = await req.json()
    console.log('Sending notification emails for report:', reportId)
    console.log('RESEND key present:', Boolean(Deno.env.get('RESEND_API_KEY')))

// Get report details first (no FK join)
const { data: report, error: reportError } = await supabaseAdmin
  .from('reports')
  .select('id, title, tracking_id, report_type, organization_id')
  .eq('id', reportId)
  .maybeSingle()

if (reportError || !report) {
  console.error('Failed to fetch report:', reportError)
  return new Response(JSON.stringify({ error: 'Report not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Fetch organization branding separately
const { data: org, error: orgError } = await supabaseAdmin
  .from('organizations')
  .select('name, brand_color, notification_email, settings')
  .eq('id', report.organization_id)
  .maybeSingle()

if (orgError) {
  console.error('Failed to fetch organization for report:', orgError)
}

    // Get users to notify using user_roles table
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, 
        email, 
        first_name, 
        last_name,
        user_roles!inner(role)
      `)
      .eq('organization_id', report.organization_id)
      .eq('is_active', true)
      .in('user_roles.role', ['admin', 'case_handler', 'org_admin'])

    if (usersError) {
      console.error('Failed to fetch users:', usersError)
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // If no primary recipients, try fallbacks
    let recipientEmails = []
    if (users && users.length > 0) {
      recipientEmails = users.map(user => ({ email: user.email, name: user.first_name || 'Team Member', source: 'org_member' }))
    } else {
      console.warn('No active org members found, trying fallbacks for organization:', report.organization_id)
      
      // Fallback A: Check organization notification email
      const notificationEmail = org?.notification_email || org?.settings?.notification_email;
      if (notificationEmail) {
        recipientEmails.push({ email: notificationEmail, name: 'Admin', source: 'org_notification' })
        console.log('Using organization notification email:', notificationEmail)
      }
      
      // Fallback B: Check subscribed admins  
      if (recipientEmails.length === 0) {
        const { data: subscribers } = await supabaseAdmin
          .from('subscribers')
          .select('email, user_id')
          .eq('subscribed', true)
          .not('user_id', 'is', null)
        
        if (subscribers && subscribers.length > 0) {
          // Check which subscribers are admins for this organization
          const { data: adminProfiles } = await supabaseAdmin
            .from('profiles')
            .select(`
              id, 
              email, 
              first_name,
              user_roles!inner(role)
            `)
            .eq('organization_id', report.organization_id)
            .eq('user_roles.role', 'admin')
            .eq('user_roles.is_active', true)
            .in('id', subscribers.map(s => s.user_id))
          
          if (adminProfiles && adminProfiles.length > 0) {
            recipientEmails = adminProfiles.map(admin => ({ 
              email: admin.email, 
              name: admin.first_name || 'Admin', 
              source: 'subscribed_admin' 
            }))
            console.log('Using subscribed admin emails:', recipientEmails.map(r => r.email))
          }
        }
      }
      
      // If still no recipients, log and return
      if (recipientEmails.length === 0) {
        console.error('No email recipients found after all fallbacks for organization:', report.organization_id)
        return new Response(JSON.stringify({ success: true, sent: 0, failed: 0, reason: 'no_recipients' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    console.log('Resolved recipients:', recipientEmails)

    // Send emails to each recipient
    const emailPromises = recipientEmails.map(async (recipient) => {
      try {
        const emailResponse = await resend.emails.send({
          from: 'Disclosurely <support@disclosurely.com>',
          to: [recipient.email],
          subject: `New Report: ${report.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: ${org?.brand_color || '#2563eb'}; color: white; padding: 20px; text-align: center;">
                <h1>New Report Submitted</h1>
              </div>
              <div style="padding: 30px; background-color: #f9fafb;">
                <p>Hello ${recipient.name},</p>
                <p>A new report has been submitted to ${org?.name || 'your organization'}:</p>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${org?.brand_color || '#2563eb'};">
                  <h3 style="margin-top: 0;">${report.title}</h3>
                  <p><strong>Tracking ID:</strong> ${report.tracking_id}</p>
                  <p><strong>Report Type:</strong> ${report.report_type}</p>
                </div>
                
                <p>Please log in to your dashboard to review and manage this report.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://app.disclosurely.com/dashboard" 
                     style="background-color: ${org?.brand_color || '#2563eb'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    View Dashboard
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  This is an automated notification from Disclosurely. If you believe you received this email in error, please contact your administrator.
                </p>
              </div>
            </div>
          `,
        })

        // Log full Resend response for debugging
        console.log('Resend response for', recipient.email, JSON.stringify(emailResponse))

        // Treat missing ID or explicit error as failure
        if (!emailResponse?.data?.id) {
          const errMsg = emailResponse?.error?.message || 'Resend did not return a message ID';
          console.error('Resend send failure', { recipient: recipient.email, error: emailResponse?.error })

          const relatedUserIdOnFailure = recipient.source === 'org_member'
            ? users?.find(u => u.email === recipient.email)?.id
            : null;

          // Record failure for observability
          await supabaseAdmin
            .from('email_notifications')
            .insert({
              user_id: relatedUserIdOnFailure,
              organization_id: report.organization_id,
              report_id: reportId,
              notification_type: 'new_report',
              email_address: recipient.email,
              subject: `New Report: ${report.title}`,
              status: 'failed',
              metadata: {
                error: emailResponse?.error || errMsg,
                tracking_id: report.tracking_id,
                recipient_source: recipient.source
              }
            })

          // Throw to fall into catch return format
          throw new Error(errMsg)
        }

        // Log successful email notification  
        const relatedUserId = recipient.source === 'org_member' 
          ? users?.find(u => u.email === recipient.email)?.id 
          : null;
          
        await supabaseAdmin
          .from('email_notifications')
          .insert({
            user_id: relatedUserId,
            organization_id: report.organization_id,
            report_id: reportId,
            notification_type: 'new_report',
            email_address: recipient.email,
            subject: `New Report: ${report.title}`,
            status: 'sent',
            metadata: {
              resend_id: emailResponse.data.id,
              tracking_id: report.tracking_id,
              recipient_source: recipient.source
            }
          })

        console.log(`Email sent to ${recipient.email} (${recipient.source}):`, emailResponse.data.id)
        return { success: true, user: recipient.email, id: emailResponse.data.id, source: recipient.source }
      } catch (error: any) {
        console.error(`Failed to send email to ${recipient.email}:`, error)
        return { success: false, user: recipient.email, error: error.message, source: recipient.source }
      }
    })

    const results = await Promise.all(emailPromises)
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    console.log(`Email notifications: ${successful} sent, ${failed} failed`)

    return new Response(JSON.stringify({
      success: true,
      sent: successful,
      failed: failed,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Email notification error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: (error as Error).message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})