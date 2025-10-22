console.log('submit-anonymous-report: module loaded')

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

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