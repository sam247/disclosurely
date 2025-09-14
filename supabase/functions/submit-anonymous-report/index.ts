
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://disclosurely.com, https://*.disclosurely.com, https://app.disclosurely.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('Anonymous report submission request:', { linkToken, reportData: { ...reportData, encrypted_content: '[ENCRYPTED]' } })

    // First, verify the link is valid using admin privileges
    const { data: linkData, error: linkError } = await supabaseAdmin
      .from('organization_links')
      .select('id, organization_id, is_active, expires_at, usage_limit, usage_count')
      .eq('link_token', linkToken)
      .eq('is_active', true)
      .single()

    if (linkError || !linkData) {
      console.error('Invalid link:', linkError)
      
      // Log security event for invalid link attempt
      await supabaseAdmin.rpc('log_link_validation_failure', {
        p_link_token: linkToken,
        p_failure_reason: 'Link not found or inactive',
        p_organization_id: null,
        p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        p_user_agent: req.headers.get('user-agent')
      })
      
      return new Response(
        JSON.stringify({ error: 'Invalid or expired link' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check link validity
    if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
      // Log security event for expired link attempt
      await supabaseAdmin.rpc('log_link_validation_failure', {
        p_link_token: linkToken,
        p_failure_reason: 'Link expired',
        p_organization_id: linkData.organization_id,
        p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        p_user_agent: req.headers.get('user-agent')
      })
      
      return new Response(
        JSON.stringify({ error: 'Link has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (linkData.usage_limit && linkData.usage_count >= linkData.usage_limit) {
      // Log security event for usage limit exceeded
      await supabaseAdmin.rpc('log_link_validation_failure', {
        p_link_token: linkToken,
        p_failure_reason: 'Usage limit exceeded',
        p_organization_id: linkData.organization_id,
        p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        p_user_agent: req.headers.get('user-agent')
      })
      
      return new Response(
        JSON.stringify({ error: 'Link usage limit reached' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check subscription limits for the organization
    const { data: subscriptionData } = await supabaseAdmin
      .from('subscribers')
      .select('subscription_tier, subscribed')
      .eq('user_id', linkData.organization_id)
      .maybeSingle()

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
    if (!subscriptionData?.subscribed) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Case submission requires an active subscription. Please contact the organization to resolve this issue.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    if (subscriptionData.subscription_tier === 'basic' && (reportsThisMonth || 0) >= 5) {
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

    // Update link usage count
    await supabaseAdmin
      .from('organization_links')
      .update({ usage_count: linkData.usage_count + 1 })
      .eq('id', linkData.id)

    console.log('Report created successfully:', report[0]?.id)

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
            organization_id: linkData.organization_id,
            report_id: report[0].id,
            notification_type: 'new_report_failed',
            error_message: notificationResponse.error.message || 'Unknown error',
            metadata: { 
              attempted_at: new Date().toISOString(),
              error_details: notificationResponse.error
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
          organization_id: linkData.organization_id,
          report_id: report[0].id,
          notification_type: 'new_report_failed',
          error_message: emailError.message || 'Failed to invoke email service',
          metadata: { 
            attempted_at: new Date().toISOString(),
            error_details: emailError.toString()
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
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
