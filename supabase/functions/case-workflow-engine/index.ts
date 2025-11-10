import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AssignmentRule {
  id: string;
  priority: number;
  name: string;
  conditions: {
    category?: string;
    urgency?: string;
    keywords?: string[];
  };
  assign_to_user_id?: string;
  assign_to_team?: string;
}

interface SLAPolicy {
  critical_response_time: number;
  high_response_time: number;
  medium_response_time: number;
  low_response_time: number;
  escalate_after_breach: boolean;
  escalate_to_user_id?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

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

    const body = await req.json()
    const { action, reportId, organizationId } = body

    console.log(`[Workflow Engine] Action: ${action}, Report: ${reportId}, Org: ${organizationId}`)

    switch (action) {
      case 'auto_assign':
        return await autoAssignReport(supabase, reportId, organizationId)
      case 'calculate_sla':
        return await calculateSLA(supabase, reportId, organizationId)
      case 'escalate':
        return await escalateCase(supabase, reportId, body.escalateTo, body.reason, body.slaBreached)
      default:
        throw new Error(`Invalid action: ${action}`)
    }

  } catch (error) {
    console.error('[Workflow Engine] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function autoAssignReport(supabase: any, reportId: string, organizationId: string) {
  console.log(`[Auto-Assign] Starting for report ${reportId}`)

  // 1. Get report details
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (reportError || !report) {
    console.error('[Auto-Assign] Report not found:', reportError)
    throw new Error('Report not found')
  }

  // 2. Fetch active assignment rules (ordered by priority DESC)
  const { data: rules, error: rulesError } = await supabase
    .from('assignment_rules')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('enabled', true)
    .order('priority', { ascending: false })

  if (rulesError) {
    console.error('[Auto-Assign] Error fetching rules:', rulesError)
    throw rulesError
  }

  console.log(`[Auto-Assign] Found ${rules?.length || 0} active rules`)

  // 3. Match rules against report
  for (const rule of rules || []) {
    console.log(`[Auto-Assign] Testing rule: ${rule.name} (priority ${rule.priority})`)

    if (matchesConditions(report, rule.conditions)) {
      console.log(`[Auto-Assign] Rule matched: ${rule.name}`)

      // Assign report
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          assigned_to: rule.assign_to_user_id,
          assigned_at: new Date().toISOString()
        })
        .eq('id', reportId)

      if (updateError) {
        console.error('[Auto-Assign] Error updating report:', updateError)
        throw updateError
      }

      // Log the action
      const { error: logError } = await supabase
        .from('workflow_logs')
        .insert({
          report_id: reportId,
          action: 'auto_assigned',
          details: {
            rule_id: rule.id,
            rule_name: rule.name,
            assigned_to: rule.assign_to_user_id,
            conditions_matched: rule.conditions
          }
        })

      if (logError) {
        console.error('[Auto-Assign] Error logging action:', logError)
      }

      return new Response(
        JSON.stringify({
          success: true,
          assigned_to: rule.assign_to_user_id,
          rule_name: rule.name
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  // No rule matched
  console.log('[Auto-Assign] No matching rule found')
  return new Response(
    JSON.stringify({
      success: true,
      assigned_to: null,
      message: 'No matching rule'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function matchesConditions(report: any, conditions: any): boolean {
  // Category match
  if (conditions.category && conditions.category !== 'any') {
    if (report.report_type !== conditions.category) {
      console.log(`[Match] Category mismatch: ${report.report_type} !== ${conditions.category}`)
      return false
    }
  }

  // Urgency match (priority mapping: 1=low, 2=medium, 3=high, 4=critical)
  if (conditions.urgency && conditions.urgency !== 'any') {
    const urgencyMap: any = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    }
    const expectedPriority = urgencyMap[conditions.urgency.toLowerCase()]
    if (expectedPriority && expectedPriority !== report.priority) {
      console.log(`[Match] Urgency mismatch: ${report.priority} !== ${expectedPriority}`)
      return false
    }
  }

  // Keyword match
  if (conditions.keywords && conditions.keywords.length > 0) {
    const contentLower = (
      (report.title || '') + ' ' +
      (report.description || '') + ' ' +
      (report.incident_details || '')
    ).toLowerCase()

    const hasKeyword = conditions.keywords.some((keyword: string) =>
      contentLower.includes(keyword.toLowerCase())
    )

    if (!hasKeyword) {
      console.log(`[Match] Keyword mismatch: none of ${conditions.keywords} found`)
      return false
    }
  }

  console.log('[Match] All conditions matched!')
  return true
}

async function calculateSLA(supabase: any, reportId: string, organizationId: string) {
  console.log(`[SLA] Calculating for report ${reportId}`)

  // Get report
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (reportError || !report) {
    console.error('[SLA] Report not found:', reportError)
    throw new Error('Report not found')
  }

  // Get SLA policy
  const { data: slaPolicy, error: policyError } = await supabase
    .from('sla_policies')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_default', true)
    .single()

  if (policyError || !slaPolicy) {
    console.log('[SLA] No default SLA policy found')
    return new Response(
      JSON.stringify({
        success: false,
        message: 'No SLA policy found'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Calculate deadline based on priority
  const priorityMap: any = {
    1: slaPolicy.low_response_time,
    2: slaPolicy.medium_response_time,
    3: slaPolicy.high_response_time,
    4: slaPolicy.critical_response_time
  }

  const hoursToAdd = priorityMap[report.priority] || slaPolicy.medium_response_time
  const deadline = new Date(report.created_at)
  deadline.setHours(deadline.getHours() + hoursToAdd)

  console.log(`[SLA] Deadline: ${deadline.toISOString()} (${hoursToAdd} hours from creation)`)

  // Update report with SLA deadline
  const { error: updateError } = await supabase
    .from('reports')
    .update({ sla_deadline: deadline.toISOString() })
    .eq('id', reportId)

  if (updateError) {
    console.error('[SLA] Error updating report:', updateError)
    throw updateError
  }

  // Log the action
  await supabase
    .from('workflow_logs')
    .insert({
      report_id: reportId,
      action: 'sla_calculated',
      details: {
        priority: report.priority,
        hours: hoursToAdd,
        deadline: deadline.toISOString()
      }
    })

  return new Response(
    JSON.stringify({
      success: true,
      sla_deadline: deadline,
      hours: hoursToAdd
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function escalateCase(
  supabase: any,
  reportId: string,
  escalateTo: string,
  reason: string,
  slaBreached: boolean = false
) {
  console.log(`[Escalate] Report ${reportId} to user ${escalateTo}`)

  // Get current assignee
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('assigned_to')
    .eq('id', reportId)
    .single()

  if (reportError || !report) {
    console.error('[Escalate] Report not found:', reportError)
    throw new Error('Report not found')
  }

  // Create escalation record
  const { error: escalationError } = await supabase
    .from('case_escalations')
    .insert({
      report_id: reportId,
      escalated_from: report.assigned_to,
      escalated_to: escalateTo,
      reason: reason,
      sla_breached: slaBreached
    })

  if (escalationError) {
    console.error('[Escalate] Error creating escalation:', escalationError)
    throw escalationError
  }

  // Update report assignment
  const { error: updateError } = await supabase
    .from('reports')
    .update({
      assigned_to: escalateTo,
      assigned_at: new Date().toISOString()
    })
    .eq('id', reportId)

  if (updateError) {
    console.error('[Escalate] Error updating report:', updateError)
    throw updateError
  }

  // Log workflow
  await supabase
    .from('workflow_logs')
    .insert({
      report_id: reportId,
      action: 'escalated',
      details: {
        from: report.assigned_to,
        to: escalateTo,
        reason,
        sla_breached: slaBreached
      }
    })

  console.log('[Escalate] Successfully escalated case')

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
