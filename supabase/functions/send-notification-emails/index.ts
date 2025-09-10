import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://disclosurely.com, https://*.disclosurely.com, https://app.disclosurely.com',
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

    // Get report details and organization
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .select(`
        id,
        title,
        tracking_id,
        report_type,
        organization_id,
        organizations!inner(name, brand_color)
      `)
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      console.error('Failed to fetch report:', reportError)
      return new Response(JSON.stringify({ error: 'Report not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get users to notify
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('organization_id', report.organization_id)
      .eq('is_active', true)
      .in('role', ['admin', 'case_handler', 'org_admin'])

    if (usersError) {
      console.error('Failed to fetch users:', usersError)
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Send emails to each user
    const emailPromises = users?.map(async (user) => {
      try {
        const emailResponse = await resend.emails.send({
          from: 'Disclosurely <notifications@disclosurely.com>',
          to: [user.email],
          subject: `New Report: ${report.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: ${report.organizations.brand_color || '#2563eb'}; color: white; padding: 20px; text-align: center;">
                <h1>New Report Submitted</h1>
              </div>
              <div style="padding: 30px; background-color: #f9fafb;">
                <p>Hello ${user.first_name || 'Team Member'},</p>
                <p>A new report has been submitted to ${report.organizations.name}:</p>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${report.organizations.brand_color || '#2563eb'};">
                  <h3 style="margin-top: 0;">${report.title}</h3>
                  <p><strong>Tracking ID:</strong> ${report.tracking_id}</p>
                  <p><strong>Report Type:</strong> ${report.report_type}</p>
                </div>
                
                <p>Please log in to your dashboard to review and manage this report.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://app.disclosurely.com/dashboard" 
                     style="background-color: ${report.organizations.brand_color || '#2563eb'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
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

        // Log successful email notification
        await supabaseAdmin
          .from('email_notifications')
          .insert({
            user_id: user.id,
            organization_id: report.organization_id,
            report_id: reportId,
            notification_type: 'new_report',
            email_address: user.email,
            subject: `New Report: ${report.title}`,
            metadata: {
              resend_id: emailResponse.data?.id,
              tracking_id: report.tracking_id
            }
          })

        console.log(`Email sent to ${user.email}:`, emailResponse.data?.id)
        return { success: true, user: user.email, id: emailResponse.data?.id }
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error)
        return { success: false, user: user.email, error: error.message }
      }
    }) || []

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
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})