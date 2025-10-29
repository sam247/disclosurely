console.log('submit-anonymous-report: module loaded')

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { Resend } from "https://esm.sh/resend@4.0.0"

const DISCLOSURELY_PRIMARY_COLOR = '#2563eb'
const DISCLOSURELY_LOGO_URL = 'https://app.disclosurely.com/lovable-uploads/416d39db-53ff-402e-a2cf-26d1a3618601.png'

// Disclosurely brand email template builder
function buildDisclosurelyEmailTemplate(options: {
  title: string
  subtitle?: string
  bodyHtml: string
  cta?: { text: string; url: string }
  footerText?: string
}) {
  const { title, subtitle, bodyHtml, cta, footerText } = options

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="margin:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#111827;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden;box-shadow:0 15px 35px rgba(15,23,42,.08);">
                <tr>
                  <td style="background:${DISCLOSURELY_PRIMARY_COLOR};padding:32px 24px;text-align:center;">
                    <img src="${DISCLOSURELY_LOGO_URL}" alt="Disclosurely" width="160" style="display:block;margin:0 auto 16px auto;" />
                    <h1 style="margin:0;font-size:24px;line-height:1.3;color:#ffffff;font-weight:700;">${title}</h1>
                    ${subtitle ? `<p style=\"margin:12px 0 0 0;font-size:15px;color:rgba(255,255,255,0.9);\">${subtitle}</p>` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 28px;">
                    ${bodyHtml}
                    ${cta ? `
                      <div style=\"text-align:center;margin:36px 0 8px 0;\">
                        <a href=\"${cta.url}\" style=\"display:inline-block;background:${DISCLOSURELY_PRIMARY_COLOR};color:#ffffff;font-weight:600;padding:14px 36px;text-decoration:none;border-radius:8px;box-shadow:0 10px 20px rgba(37,99,235,0.22);\">${cta.text}</a>
                      </div>
                    ` : ''}
                    <p style="margin:40px 0 0 0;font-size:13px;line-height:1.6;color:#6b7280;text-align:center;">
                      ${footerText || 'This is an automated notification from Disclosurely. If you believe you received this email in error, please contact your administrator.'}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;text-align:center;padding:20px 24px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">
                    © ${new Date().getFullYear()} Disclosurely. Secure whistleblowing & compliance management platform.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

// Enhanced logging function
async function logToSystem(supabase: any, level: string, context: string, message: string, data?: any, error?: any) {
  try {
    await supabase.from('system_logs').insert({
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data: data ? JSON.stringify(data) : null,
      stack_trace: error?.stack || null,
      created_at: new Date().toISOString()
    });
  } catch (logError) {
    console.error('Failed to log to system:', logError);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Audit logging function - simplified to avoid type issues
async function logAuditEvent(supabase: any, event: any) {
  try {
    // Skip audit logging for now to avoid type issues
    console.log('📋 Audit event (skipped):', event.eventType, event.action);
    return;
    
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        event_type: event.eventType,
        category: event.category,
        action: event.action,
        severity: event.severity,
        actor_type: event.actorType,
        actor_id: event.actorId,
        actor_email: event.actorEmail,
        actor_ip_address: null, // Always null to avoid inet type issues
        actor_user_agent: event.actorUserAgent,
        target_type: event.targetType,
        target_id: event.targetId,
        target_name: event.targetName,
        summary: event.summary,
        description: event.description,
        metadata: event.metadata
      })
    
    if (error) {
      console.error('Failed to log audit event:', error)
    }
  } catch (error) {
    console.error('Error logging audit event:', error)
  }
}

async function sendReportNotificationEmails(supabase: any, report: any, organizationId: string) {
  try {
    const resendClient = new Resend(Deno.env.get('RESEND_API_KEY') || '')

    // Fetch organization info for branding / fallback email
    const { data: organization } = await supabase
      .from('organizations')
      .select('name, brand_color, notification_email, settings')
      .eq('id', organizationId)
      .maybeSingle()

    // Fetch org members with roles that should receive notifications
    const { data: members } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        user_roles!inner(role, is_active)
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .in('user_roles.role', ['admin', 'case_handler', 'org_admin'])
      .eq('user_roles.is_active', true)

    const recipients: { email: string; name: string; source: string; userId: string | null }[] = []

    if (members && members.length > 0) {
      for (const member of members) {
        if (member.email) {
          recipients.push({
            email: member.email,
            name: member.first_name || 'Team Member',
            source: 'org_member',
            userId: member.id
          })
        }
      }
    }

    // Fallback to organization notification email if defined
    if (recipients.length === 0) {
      const fallbackEmail = organization?.notification_email || organization?.settings?.notification_email
      if (fallbackEmail) {
        recipients.push({
          email: fallbackEmail,
          name: organization?.name || 'Administrator',
          source: 'org_notification',
          userId: null
        })
      }
    }

    if (recipients.length === 0) {
      console.warn('No email recipients found for organization', organizationId)
      return
    }

    const subject = `New Report Submitted - ${report.tracking_id}`

    for (const recipient of recipients) {
      const bodyHtml = `
        <p style=\"font-size:15px;line-height:1.7;color:#1f2937;margin:0 0 18px 0;\">Hello ${recipient.name},</p>
        <p style=\"font-size:15px;line-height:1.7;color:#1f2937;margin:0 0 18px 0;\">A new report has been submitted and needs your attention:</p>
        <div style=\"background:#f3f4f6;border:1px solid #e5e7eb;border-radius:10px;padding:18px 20px;margin:24px 0;\">
          <p style=\"margin:0 0 8px 0;font-size:14px;color:#111827;\"><strong>Title:</strong> ${report.title}</p>
          <p style=\"margin:0 0 8px 0;font-size:14px;color:#111827;\"><strong>Tracking ID:</strong> ${report.tracking_id}</p>
          <p style=\"margin:0 0 8px 0;font-size:14px;color:#111827;\"><strong>Type:</strong> ${report.report_type}</p>
          <p style=\"margin:0;font-size:14px;color:#111827;\"><strong>Submitted:</strong> ${new Date(report.created_at).toLocaleString()}</p>
        </div>
        <p style=\"font-size:15px;line-height:1.7;color:#1f2937;margin:0;\">Please log in to your dashboard to review and take action.</p>
      `

      try {
        const emailHtml = buildDisclosurelyEmailTemplate({
          title: 'New Report Submitted',
          subtitle: organization?.name ? `${organization.name} Compliance Team` : undefined,
          bodyHtml,
          cta: {
            text: 'View Dashboard',
            url: 'https://app.disclosurely.com/dashboard'
          }
        })

        const emailResponse = await resendClient.emails.send({
          from: 'Disclosurely <notifications@disclosurely.com>',
          to: [recipient.email],
          subject,
          html: emailHtml,
        })

        console.log('Notification email sent to', recipient.email, emailResponse?.data?.id)

        await supabase
          .from('email_notifications')
          .insert({
            user_id: recipient.userId,
            organization_id: organizationId,
            report_id: report.id,
            notification_type: 'new_report',
            email_address: recipient.email,
            subject,
            status: emailResponse?.data?.id ? 'sent' : 'unknown',
            metadata: {
              tracking_id: report.tracking_id,
              resend_id: emailResponse?.data?.id || null,
              recipient_source: recipient.source,
              template: 'disclosurely-default'
            }
          })
      } catch (emailError) {
        console.error('Failed to send notification email to', recipient.email, emailError)
        await supabase
          .from('email_notifications')
          .insert({
            user_id: recipient.userId,
            organization_id: organizationId,
            report_id: report.id,
            notification_type: 'new_report',
            email_address: recipient.email,
            subject,
            status: 'failed',
            metadata: {
              tracking_id: report.tracking_id,
              error: (emailError as Error).message,
              recipient_source: recipient.source,
              template: 'disclosurely-default'
            }
          })
      }
    }
  } catch (error) {
    console.error('Failed to send report notification emails:', error)
  }
}

serve(async (req) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log('submit-anonymous-report: request start', { url: new URL(req.url).pathname, requestId })
  
  try {
    console.log('🔍 SUBMIT FUNCTION STARTED')
    
    if (req.method === 'OPTIONS') {
      console.log('OPTIONS request')
      return new Response('ok', { headers: corsHeaders })
    }

    console.log('Processing POST request')
    
    const body = await req.json()
    console.log('Request body parsed:', Object.keys(body || {}))
    
    const { reportData, linkToken } = body
    
    // Initialize Supabase client inside handler (following Supabase AI recommendations)
    console.log('🔗 Initializing Supabase client...')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    console.log('✅ Supabase client initialized')
    
    // Validate inputs
    if (!reportData || !linkToken) {
      console.log('❌ Missing required data')
      await logToSystem(supabase, 'error', 'submission', 'Missing required data', { reportData: !!reportData, linkToken: !!linkToken });
      return new Response(
        JSON.stringify({ error: 'Missing report data or link token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Verify the link token and get organization info
    console.log('🔍 Verifying link token...')
    const { data: linkData, error: linkError } = await supabase
      .from('organization_links')
      .select('organization_id, organization:organizations(*)')
      .eq('link_token', linkToken)
      .eq('is_active', true)
      .single()
    
    if (linkError || !linkData) {
      console.log('❌ Invalid link token')
      return new Response(
        JSON.stringify({ error: 'Invalid link token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('✅ Link token verified for organization:', linkData.organization_id)
    
    // Create the report
    console.log('📝 Creating report in database...')
    
    // Ensure priority is an integer (convert if string)
    const priorityValue = typeof reportData.priority === 'string' 
      ? parseInt(reportData.priority, 10) 
      : reportData.priority;
    
    console.log('Priority value:', priorityValue, 'Type:', typeof priorityValue);
    
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert({
        tracking_id: reportData.tracking_id,
        title: reportData.title,
        encrypted_content: reportData.encrypted_content,
        encryption_key_hash: reportData.encryption_key_hash,
        report_type: reportData.report_type,
        submitted_by_email: reportData.submitted_by_email,
        status: reportData.status,
        priority: priorityValue,
        tags: reportData.tags,
        organization_id: linkData.organization_id
      })
      .select()
      .single()
    
    if (reportError) {
      console.error('❌ Failed to create report:', reportError)
      await logToSystem(supabase, 'error', 'submission', 'Failed to create report', { 
        reportError: reportError.message,
        reportData: {
          tracking_id: reportData.tracking_id,
          title: reportData.title,
          priority: priorityValue,
          priorityType: typeof priorityValue
        }
      }, reportError);
      return new Response(
        JSON.stringify({ error: 'Failed to create report', details: reportError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('✅ Report created successfully:', report.id)
    
    // Trigger email notifications directly (no bridge)
    await sendReportNotificationEmails(supabase, report, linkData.organization_id)

    // Log audit event
    console.log('📋 Logging audit event...')
    await logAuditEvent(supabase, {
      eventType: 'report_created',
      category: 'security',
      action: 'create',
      severity: 'medium',
      actorType: 'anonymous',
      actorId: null,
      actorEmail: reportData.submitted_by_email,
      actorIpAddress: null, // Set to null to avoid inet type issues
      actorUserAgent: req.headers.get('user-agent'),
      targetType: 'report',
      targetId: report.id,
      targetName: reportData.title,
      summary: `Anonymous report submitted: ${reportData.title}`,
      description: `Report ${reportData.tracking_id} submitted via secure link`,
      metadata: {
        linkToken: linkToken.substring(0, 8) + '...',
        organizationId: linkData.organization_id,
        reportType: reportData.report_type,
        priority: reportData.priority
      }
    })
    
    console.log('🎉 Report submission completed successfully!')
    
    return new Response(
      JSON.stringify({ 
        success: true,
        report: {
          id: report.id,
          tracking_id: report.tracking_id,
          status: report.status,
          created_at: report.created_at
        },
        message: 'Report submitted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ ERROR IN SUBMIT FUNCTION:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: 'Submit failed', 
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})