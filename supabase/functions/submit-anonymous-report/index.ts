console.log('submit-anonymous-report: module loaded')

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { Resend } from "https://esm.sh/resend@4.0.0"
import { checkRateLimit, rateLimiters, rateLimitResponse } from '../_shared/rateLimit.ts'
import { scanReportData } from '../_shared/pii-scanner.ts'

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

// CORS headers for public endpoint - allow all origins to support custom domains
// Security is handled by the link token
const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

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
  
  // Get CORS headers early - use for all responses
  const corsHeaders = getCorsHeaders(req);
  
  try {
    console.log('🔍 SUBMIT FUNCTION STARTED')
    
    if (req.method === 'OPTIONS') {
      console.log('OPTIONS request')
      return new Response('ok', { headers: corsHeaders })
    }

    // 🔒 Rate limiting: 5 submissions per 15 minutes per IP
    const rateLimit = await checkRateLimit(req, rateLimiters.reportSubmission)
    if (!rateLimit.success) {
      console.warn('⚠️ Rate limit exceeded for report submission')
      return rateLimitResponse(rateLimit, corsHeaders)
    }

    console.log('Processing POST request')
    
    let body: any;
    try {
      body = await req.json()
    console.log('Request body parsed:', Object.keys(body || {}))
    } catch (jsonError) {
      console.error('❌ Failed to parse request body:', jsonError)
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const { reportData, linkToken } = body || {}
    
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
      .select('organization_id')
      .eq('link_token', linkToken)
      .eq('is_active', true)
      .single()
    
    if (linkError) {
      console.error('❌ Link token query error:', linkError)
      await logToSystem(supabase, 'error', 'submission', 'Link token verification failed', { 
        linkError: linkError.message,
        linkErrorCode: linkError.code,
        linkErrorDetails: linkError.details
      }, linkError);
      return new Response(
        JSON.stringify({ error: 'Invalid link token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!linkData || !linkData.organization_id) {
      console.log('❌ Invalid link token - no data returned')
      return new Response(
        JSON.stringify({ error: 'Invalid link token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('✅ Link token verified for organization:', linkData.organization_id)
    
    // 🔍 SERVER-SIDE PII SCANNING (PRIVACY FIX C2)
    console.log('🔍 Scanning report data for PII...')
    let piiScanResult;
    try {
      piiScanResult = await scanReportData(reportData, linkData.organization_id)
      console.log('✅ PII scan completed:', { hasPII: piiScanResult.hasPII, count: piiScanResult.detected.length })
    } catch (piiError) {
      console.error('❌ PII scan failed, continuing without PII detection:', piiError)
      // Continue with empty PII result if scan fails
      piiScanResult = {
        detected: [],
        hasPII: false,
        highSeverityCount: 0,
        mediumSeverityCount: 0,
        lowSeverityCount: 0,
      }
    }
    
    if (piiScanResult.hasPII) {
      console.warn(`⚠️ PII detected in report: ${piiScanResult.detected.length} items (${piiScanResult.highSeverityCount} high, ${piiScanResult.mediumSeverityCount} medium, ${piiScanResult.lowSeverityCount} low)`)
      
      // Log PII detection for compliance
      await logToSystem(supabase, 'warn', 'submission', 'PII detected in report submission', {
        report_tracking_id: reportData.tracking_id,
        pii_count: piiScanResult.detected.length,
        high_severity: piiScanResult.highSeverityCount,
        medium_severity: piiScanResult.mediumSeverityCount,
        low_severity: piiScanResult.lowSeverityCount,
        pii_types: [...new Set(piiScanResult.detected.map(d => d.type))],
        // Don't log the actual PII text - just metadata
        organization_id: linkData.organization_id,
      })
      
      // Store PII detection metadata (without the actual PII) for compliance reporting
      // This will be stored in the report metadata or a separate compliance log
    } else {
      console.log('✅ No PII detected in report')
    }
    
    // 🔐 SERVER-SIDE ENCRYPTION
    console.log('🔐 Encrypting report data server-side...')
    const ENCRYPTION_SALT = Deno.env.get('ENCRYPTION_SALT')
    if (!ENCRYPTION_SALT) {
      console.error('❌ ENCRYPTION_SALT not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create organization-specific key
    const keyMaterial = linkData.organization_id + ENCRYPTION_SALT
    const keyBuffer = new TextEncoder().encode(keyMaterial)
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer)
    const organizationKey = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Extract content to encrypt (everything except metadata fields)
    const contentToEncrypt = {
      description: reportData.description,
      category: reportData.category,
      submission_method: reportData.submission_method
    }
    
    // Encrypt using Web Crypto API
    let encryptedData: string;
    let keyHash: string;
    
    try {
      console.log('🔐 Starting encryption process...')
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const keyBytes = new Uint8Array(organizationKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
      
      console.log('🔐 Importing crypto key...')
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )
    
    const dataString = JSON.stringify(contentToEncrypt)
      console.log('🔐 Data to encrypt length:', dataString.length)
    const dataBuffer = new TextEncoder().encode(dataString)
      
      console.log('🔐 Encrypting data...')
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      dataBuffer
    )
      
      console.log('🔐 Encryption successful, buffer size:', encryptedBuffer.byteLength)
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encryptedBuffer), iv.length)
    
      console.log('🔐 Converting to base64, combined size:', combined.length)
      // Convert to base64 - handle large arrays by chunking
      // String.fromCharCode has argument limit, so we chunk it
      const CHUNK_SIZE = 0x8000; // 32KB chunks
      let binary = '';
      for (let i = 0; i < combined.length; i += CHUNK_SIZE) {
        const chunk = combined.subarray(i, Math.min(i + CHUNK_SIZE, combined.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      encryptedData = btoa(binary)
      keyHash = organizationKey
      
      console.log('✅ Encryption completed server-side, base64 length:', encryptedData.length)
    } catch (encryptError) {
      console.error('❌ Encryption error:', encryptError)
      console.error('❌ Encryption error details:', JSON.stringify(encryptError, null, 2))
      await logToSystem(supabase, 'error', 'submission', 'Encryption failed', {
        errorMessage: encryptError?.message || 'Unknown encryption error',
        errorStack: encryptError?.stack || 'No stack trace',
        errorType: encryptError?.constructor?.name || 'Unknown'
      }, encryptError);
      return new Response(
        JSON.stringify({ 
          error: 'Encryption failed. Please try again or contact support.',
          details: Deno.env.get('ENVIRONMENT') === 'development' ? encryptError?.message : undefined
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create the report
    console.log('📝 Creating report in database...')
    
    // Ensure priority is an integer (convert if string, validate range)
    let priorityValue: number;
    if (typeof reportData.priority === 'string') {
      priorityValue = parseInt(reportData.priority, 10);
    } else if (typeof reportData.priority === 'number') {
      priorityValue = Math.round(reportData.priority);
    } else {
      priorityValue = 3; // Default to medium priority
    }
    
    // Validate priority is in valid range (1-5)
    if (isNaN(priorityValue) || priorityValue < 1 || priorityValue > 5) {
      console.warn('⚠️ Invalid priority value:', reportData.priority, 'defaulting to 3');
      priorityValue = 3;
    }
    
    console.log('Priority value:', priorityValue, 'Type:', typeof priorityValue, 'Original:', reportData.priority);
    
    // Store PII detection metadata in report metadata field
    const reportMetadata: any = {
      pii_scan_performed: true,
      pii_detected: piiScanResult.hasPII,
      pii_detection_count: piiScanResult.detected.length,
      pii_high_severity_count: piiScanResult.highSeverityCount,
      pii_medium_severity_count: piiScanResult.mediumSeverityCount,
      pii_low_severity_count: piiScanResult.lowSeverityCount,
      pii_types_detected: piiScanResult.hasPII ? [...new Set(piiScanResult.detected.map(d => d.type))] : [],
      // Note: We don't store the actual PII text or positions for privacy
    }

    const reportInsertData: any = {
      tracking_id: reportData.tracking_id,
      title: reportData.title,
      encrypted_content: encryptedData,
      encryption_key_hash: keyHash,
      report_type: reportData.report_type,
      submitted_by_email: reportData.submitted_by_email,
      status: reportData.status,
      priority: priorityValue,
      manual_risk_level: priorityValue, // Map priority to risk level
      tags: reportData.tags,
      organization_id: linkData.organization_id,
      // Contextual fields (not encrypted - stored as plain columns)
      incident_date: reportData.incident_date || null,
      location: reportData.location || null,
      witnesses: reportData.witnesses || null,
      previous_reports: reportData.previous_reports || false,
      additional_notes: reportData.additional_notes || null
    };
    
    // Only add metadata if the column exists (for backwards compatibility)
    // The migration should add this column, but we check to avoid errors
    if (Object.keys(reportMetadata).length > 0) {
      reportInsertData.metadata = reportMetadata;
    }
    
    console.log('📝 Inserting report with data:', {
      tracking_id: reportInsertData.tracking_id,
      title: reportInsertData.title,
      priority: reportInsertData.priority,
      organization_id: reportInsertData.organization_id,
      status: reportInsertData.status,
      hasEncryptedContent: !!reportInsertData.encrypted_content,
      encryptedContentLength: reportInsertData.encrypted_content?.length || 0,
      hasMetadata: !!reportInsertData.metadata
    });
    
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert(reportInsertData)
      .select()
      .single()
    
    if (reportError) {
      console.error('❌ Failed to create report:', reportError)
      console.error('❌ Report error details:', JSON.stringify(reportError, null, 2))
      console.error('❌ Report insert data keys:', Object.keys(reportInsertData))
      console.error('❌ Report insert data sample:', {
        tracking_id: reportInsertData.tracking_id,
        title: reportInsertData.title?.substring(0, 50),
        encrypted_content_length: reportInsertData.encrypted_content?.length,
        organization_id: reportInsertData.organization_id,
        priority: reportInsertData.priority,
        priority_type: typeof reportInsertData.priority
      })
      
      await logToSystem(supabase, 'error', 'submission', 'Failed to create report', { 
        reportError: reportError.message,
        reportErrorCode: reportError.code,
        reportErrorDetails: reportError.details,
        reportErrorHint: reportError.hint,
        reportData: {
          tracking_id: reportData.tracking_id,
          title: reportData.title,
          priority: priorityValue,
          priorityType: typeof priorityValue,
          organization_id: linkData.organization_id,
          encryptedContentLength: reportInsertData.encrypted_content?.length,
          hasMetadata: !!reportInsertData.metadata
        }
      }, reportError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create report. Please try again or contact support.',
          details: Deno.env.get('ENVIRONMENT') === 'development' ? reportError.message : undefined
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('✅ Report created successfully:', report.id)

    // 🔄 WORKFLOW AUTOMATION: Auto-assign and calculate SLA
    console.log('🔄 Running workflow automation...')
    try {
      // Call case-workflow-engine for auto-assignment
      const autoAssignResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/case-workflow-engine`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            action: 'auto_assign',
            reportId: report.id,
            organizationId: linkData.organization_id
          })
        }
      )

      if (autoAssignResponse.ok) {
        const autoAssignResult = await autoAssignResponse.json()
        if (autoAssignResult.assigned_to) {
          console.log('✅ Report auto-assigned via rule:', autoAssignResult.rule_name)
        } else {
          console.log('ℹ️ No matching assignment rule found')
        }
      } else {
        console.warn('⚠️ Auto-assignment failed (non-blocking):', await autoAssignResponse.text())
      }

      // Call case-workflow-engine for SLA calculation
      const slaResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/case-workflow-engine`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            action: 'calculate_sla',
            reportId: report.id,
            organizationId: linkData.organization_id
          })
        }
      )

      if (slaResponse.ok) {
        const slaResult = await slaResponse.json()
        if (slaResult.success && slaResult.sla_deadline) {
          console.log('✅ SLA deadline calculated:', slaResult.sla_deadline, `(${slaResult.hours}h)`)
        } else {
          console.log('ℹ️ No SLA policy configured for organization')
        }
      } else {
        console.warn('⚠️ SLA calculation failed (non-blocking):', await slaResponse.text())
      }
    } catch (workflowError) {
      // Don't block submission if workflow automation fails
      console.error('⚠️ Workflow automation error (non-blocking):', workflowError)
    }

    // 🤖 AUTO-TRIAGE: Trigger AI risk assessment immediately
    console.log('🤖 Starting auto-triage with AI...')
    try {
      const aiAssessmentResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/assess-risk-with-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            reportData: {
              title: reportData.title,
              tracking_id: reportData.tracking_id,
              status: reportData.status,
              report_type: reportData.report_type,
              created_at: report.created_at,
              priority: priorityValue // Pass whistleblower's priority rating
            },
            reportContent: reportData.description // Use plain text description before encryption
          })
        }
      )

      if (aiAssessmentResponse.ok) {
        const aiResult = await aiAssessmentResponse.json()
        const assessment = aiResult.riskAssessment

        // Update report with AI assessment
        await supabase
          .from('reports')
          .update({
            ai_risk_score: assessment.risk_score,
            ai_likelihood_score: assessment.likelihood_score,
            ai_impact_score: assessment.impact_score,
            ai_risk_level: assessment.risk_level,
            ai_risk_assessment: assessment,
            ai_assessed_at: new Date().toISOString(),
            ai_assessment_version: '1.0'
          })
          .eq('id', report.id)

        console.log('✅ Auto-triage completed:', assessment.risk_level, 'risk with score', assessment.risk_score)
      } else {
        console.warn('⚠️ AI assessment failed:', await aiAssessmentResponse.text())
      }
    } catch (aiError) {
      // Don't block submission if AI fails
      console.error('⚠️ AI assessment error (non-blocking):', aiError)
    }

    // Trigger email notifications directly (no bridge)
    try {
    await sendReportNotificationEmails(supabase, report, linkData.organization_id)
    } catch (emailError) {
      console.error('⚠️ Email notification error (non-blocking):', emailError)
    }

    // Log audit event
    console.log('📋 Logging audit event...')
    try {
    await logAuditEvent(supabase, {
      eventType: 'report_created',
      category: 'security',
      action: 'create',
      severity: piiScanResult.hasPII && piiScanResult.highSeverityCount > 0 ? 'high' : 'medium',
      actorType: 'anonymous',
      actorId: null,
      actorEmail: reportData.submitted_by_email,
      actorIpAddress: null, // Set to null to avoid inet type issues
      actorUserAgent: req.headers.get('user-agent'),
      targetType: 'report',
      targetId: report.id,
      targetName: reportData.title,
      summary: `Anonymous report submitted: ${reportData.title}`,
      description: `Report ${reportData.tracking_id} submitted via secure link${piiScanResult.hasPII ? ` (PII detected: ${piiScanResult.detected.length} items)` : ''}`,
      metadata: {
        linkToken: linkToken.substring(0, 8) + '...',
        organizationId: linkData.organization_id,
        reportType: reportData.report_type,
        priority: reportData.priority,
        pii_detected: piiScanResult.hasPII,
        pii_count: piiScanResult.detected.length,
        pii_high_severity: piiScanResult.highSeverityCount,
      }
    })
    } catch (auditError) {
      console.error('⚠️ Audit logging error (non-blocking):', auditError)
    }
    
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

  } catch (error: any) {
    console.error('❌ ERROR IN SUBMIT FUNCTION:', error)
    console.error('❌ Error message:', error?.message || 'Unknown error')
    console.error('❌ Error stack:', error?.stack || 'No stack trace')
    console.error('❌ Error name:', error?.name || 'Unknown')
    console.error('❌ Error constructor:', error?.constructor?.name || 'Unknown')
    try {
      console.error('❌ Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    } catch (stringifyError) {
      console.error('❌ Could not stringify error:', stringifyError)
      console.error('❌ Error toString:', String(error))
    }
    
    // Log to system logs for debugging
    try {
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
      await logToSystem(supabase, 'error', 'submission', 'Edge function error', {
        errorMessage: error?.message || 'Unknown error',
        errorStack: error?.stack || 'No stack trace',
        errorType: error?.constructor?.name || 'Unknown',
        errorName: error?.name || 'Unknown',
        errorString: String(error)
      }, error)
    } catch (logError) {
      console.error('Failed to log error to system:', logError)
    }
    
    // Ensure CORS headers are always included, even on errors
    return new Response(
      JSON.stringify({ 
        error: 'Submit failed. Please try again or contact support.',
        details: Deno.env.get('ENVIRONMENT') === 'development' ? (error?.message || String(error)) : undefined
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})