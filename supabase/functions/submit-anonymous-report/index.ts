
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to log audit events
async function logAuditEvent(supabase: any, data: any) {
  try {
    await supabase.from('audit_logs').insert({
      event_type: data.eventType,
      category: data.category,
      action: data.action,
      severity: data.severity || 'low',
      actor_type: data.actorType,
      actor_id: data.actorId || null,
      actor_email: data.actorEmail || null,
      actor_ip_address: data.actorIpAddress || null,
      actor_user_agent: data.actorUserAgent || null,
      target_type: data.targetType || null,
      target_id: data.targetId || null,
      target_name: data.targetName || null,
      summary: data.summary,
      description: data.description || null,
      metadata: data.metadata || {},
      before_state: data.beforeState || null,
      after_state: data.afterState || null,
      organization_id: data.organizationId,
      hash: '',
      previous_hash: '',
      chain_index: 0
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

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

    const { reportData, linkToken } = await req.json()

    // Validate input
    if (!linkToken || typeof linkToken !== 'string' || linkToken.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Invalid link token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!reportData || typeof reportData !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid report data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate encrypted content
    if (!reportData.encrypted_content || typeof reportData.encrypted_content !== 'string' || reportData.encrypted_content.length > 50000) {
      return new Response(
        JSON.stringify({ error: 'Invalid encrypted content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use secure RPC function to validate link
    const { data: linkValidation, error: linkError } = await supabaseAdmin
      .rpc('validate_submission_link', { p_link_token: linkToken })
      .single()

    if (linkError || !linkValidation || !linkValidation.is_valid) {
      const reason = linkValidation?.reason || 'Link validation failed'
      
      // Log security event for invalid link attempt
      await supabaseAdmin.rpc('log_link_validation_failure', {
        p_link_token: linkToken,
        p_failure_reason: reason,
        p_organization_id: linkValidation?.organization_id || null,
        p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        p_user_agent: req.headers.get('user-agent')
      })
      
      return new Response(
        JSON.stringify({ error: reason }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const linkData = {
      id: linkValidation.link_id,
      organization_id: linkValidation.organization_id,
      custom_fields: linkValidation.custom_fields
    }

    // Determine organization subscription via org admin emails
    let orgSubscription: { subscribed: boolean; subscription_tier: string | null } = { subscribed: false, subscription_tier: null };

    // Find active admins for this organization
    const { data: orgAdmins, error: adminsError } = await supabaseAdmin
      .from('profiles')
      .select('email, role, is_active')
      .eq('organization_id', linkData.organization_id)
      .eq('is_active', true)
      .in('role', ['admin', 'org_admin']);

    if (adminsError) {
      console.error('Failed to fetch org admins for subscription check:', adminsError);
    }

    const adminEmails = (orgAdmins || []).map(a => a.email).filter((e): e is string => Boolean(e));

    if (adminEmails.length > 0) {
      const { data: subs, error: subsError } = await supabaseAdmin
        .from('subscribers')
        .select('email, subscribed, subscription_tier')
        .in('email', adminEmails);

      if (subsError) {
        console.error('Failed to fetch subscribers for org admins:', subsError);
      }

      const anyActive = subs?.some(s => s.subscribed) ?? false;
      const tierRaw = subs?.find(s => s.subscribed)?.subscription_tier ?? subs?.[0]?.subscription_tier ?? null;
      const normalizedTier = tierRaw === 'starter' ? 'basic' : tierRaw; // normalize historic values

      orgSubscription = { subscribed: anyActive, subscription_tier: normalizedTier };
    }


    // Get current month's report count for this organization
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: reportsThisMonth } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', linkData.organization_id)
      .gte('created_at', startOfMonth.toISOString())

    // Check if organization has reached their limits
    if (!orgSubscription.subscribed) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Case submission requires an active subscription. Please contact the organization to resolve this issue.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    if ((orgSubscription.subscription_tier ?? 'basic') === 'basic' && (reportsThisMonth || 0) >= 5) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'This organization has reached their monthly case limit. Please try again next month or contact them directly.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Insert the report using admin privileges (bypasses RLS)
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .insert({
        ...reportData,
        submitted_via_link_id: linkData.id,
        organization_id: linkData.organization_id
      })
      .select()

    if (reportError) {
      console.error('Report insertion error:', reportError)
      return new Response(
        JSON.stringify({ error: 'Failed to create report', details: reportError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Link usage count is updated by database trigger automatically

    // Log report creation to audit trail
    await logAuditEvent(supabaseAdmin, {
      eventType: 'report.created',
      category: 'case_management',
      action: 'Anonymous report submitted',
      severity: 'medium',
      actorType: 'user',
      actorEmail: 'anonymous_whistleblower',
      actorIpAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
      actorUserAgent: req.headers.get('user-agent') || null,
      targetType: 'report',
      targetId: report[0].id,
      targetName: report[0].tracking_id,
      summary: `Anonymous report ${report[0].tracking_id} created`,
      description: `New ${report[0].report_type} report: "${report[0].title}"`,
      afterState: {
        tracking_id: report[0].tracking_id,
        title: report[0].title,
        status: report[0].status,
        report_type: report[0].report_type,
        priority: report[0].priority,
      },
      metadata: {
        submitted_via_link: true,
        link_id: linkData.id,
        report_type: report[0].report_type,
        has_attachments: false,
      },
      organizationId: linkData.organization_id,
    });

    // Trigger AI analysis for the new report in the background
    try {
      console.log('Triggering AI analysis for new report...')
      
      // Get the decrypted content for AI analysis
      const { decryptReport } = await import('https://esm.sh/@supabase/supabase-js@2.50.0')
      
      // Call the AI risk assessment function
      const aiAnalysisResponse = await supabaseAdmin.functions.invoke('assess-risk-with-ai', {
        body: {
          reportData: {
            title: report[0].title,
            tracking_id: report[0].tracking_id,
            status: report[0].status,
            report_type: report[0].report_type,
            created_at: report[0].created_at
          },
          reportContent: `Title: ${report[0].title}\nCategory: ${report[0].tags?.[0] || 'Not specified'}\nPriority: ${report[0].priority}\nStatus: ${report[0].status}`
        }
      })

      if (aiAnalysisResponse.error) {
        console.error('AI analysis failed:', aiAnalysisResponse.error)
        // Don't fail the report creation if AI analysis fails
      } else {
        console.log('AI analysis completed successfully')
        
        // Update the report with AI risk assessment
        await supabaseAdmin
          .from('reports')
          .update({
            ai_risk_score: aiAnalysisResponse.data.riskAssessment.risk_score,
            ai_likelihood_score: aiAnalysisResponse.data.riskAssessment.likelihood_score,
            ai_impact_score: aiAnalysisResponse.data.riskAssessment.impact_score,
            ai_risk_level: aiAnalysisResponse.data.riskAssessment.risk_level,
            ai_risk_assessment: aiAnalysisResponse.data.riskAssessment,
            ai_assessed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', report[0].id)
      }
    } catch (aiError) {
      console.error('AI analysis invocation failed:', aiError)
      // Don't fail the report creation if AI analysis fails
    }

    // Send email notifications in the background
    try {
      const notificationResponse = await supabaseAdmin.functions.invoke('send-notification-emails', {
        body: { reportId: report[0].id }
      })
      
      if (notificationResponse.error) {
        console.error('Failed to send email notifications:', notificationResponse.error)
        // Log the failure but don't fail the report creation
        await supabaseAdmin
          .from('email_notifications')
          .insert({
            user_id: null,
            organization_id: linkData.organization_id,
            report_id: report[0].id,
            email_address: 'system@notifications.com',
            subject: 'Failed to send new report notification',
            notification_type: 'new_report_failed',
            status: 'failed',
            metadata: { 
              attempted_at: new Date().toISOString(),
              error_details: notificationResponse.error,
              error_message: notificationResponse.error.message || 'Unknown error'
            }
          })
      } else {
        console.log('Email notifications sent successfully:', notificationResponse.data)
      }
    } catch (emailError) {
      console.error('Email notification invocation failed:', emailError)
      // Log the failure but don't fail the report creation
      await supabaseAdmin
        .from('email_notifications')
        .insert({
          user_id: null,
          organization_id: linkData.organization_id,
          report_id: report[0].id,
          email_address: 'system@notifications.com',
          subject: 'Failed to invoke email notification service',
          notification_type: 'new_report_failed',
          status: 'failed',
          metadata: { 
            attempted_at: new Date().toISOString(),
            // @ts-ignore
            error_details: (emailError as any).toString(),
            // @ts-ignore
            error_message: (emailError as any).message || 'Failed to invoke email service'
          }
        })
    }

    return new Response(
      JSON.stringify({ success: true, report: report[0] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Anonymous submission error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
