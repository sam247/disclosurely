console.log('submit-anonymous-report: module loaded')

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { Resend } from "https://esm.sh/resend@4.0.0"

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
    const brandColor = organization?.brand_color || '#2563eb'

    for (const recipient of recipients) {
      try {
        const emailResponse = await resendClient.emails.send({
          from: 'Disclosurely <notifications@disclosurely.com>',
          to: [recipient.email],
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto;">
              <div style="background:${brandColor}; color:white; padding:20px; border-radius:8px 8px 0 0;">
                <h1 style="margin:0; font-size:22px;">New Report Submitted</h1>
                <p style="margin:6px 0 0 0; font-size:14px; opacity:0.9;">${organization?.name || 'Disclosurely'} Compliance Team</p>
              </div>
              <div style="background:#f9fafb; padding:24px; border:1px solid #e5e7eb; border-top:none; border-radius:0 0 8px 8px;">
                <p style="font-size:15px; color:#1f2937;">Hello ${recipient.name},</p>
                <p style="font-size:15px; color:#374151;">A new report has been submitted and needs your attention:</p>
                <div style="background:white; border:1px solid #e5e7eb; border-radius:6px; padding:16px; margin:18px 0;">
                  <p style="margin:0 0 8px 0; font-size:14px;"><strong>Title:</strong> ${report.title}</p>
                  <p style="margin:0 0 8px 0; font-size:14px;"><strong>Tracking ID:</strong> ${report.tracking_id}</p>
                  <p style="margin:0 0 8px 0; font-size:14px;"><strong>Type:</strong> ${report.report_type}</p>
                  <p style="margin:0; font-size:14px;"><strong>Submitted:</strong> ${new Date(report.created_at).toLocaleString()}</p>
                </div>
                <p style="font-size:14px; color:#374151;">Please log in to the dashboard to review and take action.</p>
                <div style="text-align:center; margin:26px 0;">
                  <a href="https://app.disclosurely.com/dashboard" style="background:${brandColor}; color:white; padding:12px 28px; border-radius:6px; text-decoration:none; display:inline-block; font-weight:600;">View Dashboard</a>
                </div>
                <p style="font-size:12px; color:#6b7280;">This is an automated notification from ${organization?.name || 'Disclosurely'}. If you believe you received this in error, please contact your administrator.</p>
              </div>
            </div>
          `
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
              recipient_source: recipient.source
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
              recipient_source: recipient.source
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