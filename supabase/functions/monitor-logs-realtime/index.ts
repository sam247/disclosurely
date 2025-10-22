import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
    );

    const { alertThresholds = {}, enableRealTimeAnalysis = true } = await req.json();

    console.log('🚨 Starting real-time log monitoring...');

    // Get recent critical logs (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: recentLogs, error: logsError } = await supabase
      .from('system_logs')
      .select('*')
      .gte('timestamp', fiveMinutesAgo)
      .in('level', ['ERROR', 'CRITICAL', 'WARN'])
      .order('timestamp', { ascending: false });

    if (logsError) {
      console.error('Error fetching recent logs:', logsError);
      throw logsError;
    }

    if (!recentLogs || recentLogs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        alerts: [],
        status: 'healthy',
        message: 'No critical logs in the last 5 minutes'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔍 Found ${recentLogs.length} recent critical logs`);

    // Check against thresholds
    const alerts = [];
    const errorCount = recentLogs.filter(l => l.level === 'ERROR').length;
    const criticalCount = recentLogs.filter(l => l.level === 'CRITICAL').length;
    const warningCount = recentLogs.filter(l => l.level === 'WARN').length;

    // Default thresholds
    const thresholds = {
      maxErrorsPer5Min: alertThresholds.maxErrorsPer5Min || 10,
      maxCriticalPer5Min: alertThresholds.maxCriticalPer5Min || 3,
      maxWarningsPer5Min: alertThresholds.maxWarningsPer5Min || 20,
      ...alertThresholds
    };

    // Generate alerts based on thresholds
    if (criticalCount >= thresholds.maxCriticalPer5Min) {
      alerts.push({
        type: 'CRITICAL_THRESHOLD_EXCEEDED',
        severity: 'critical',
        message: `${criticalCount} critical logs in last 5 minutes (threshold: ${thresholds.maxCriticalPer5Min})`,
        count: criticalCount,
        threshold: thresholds.maxCriticalPer5Min,
        logs: recentLogs.filter(l => l.level === 'CRITICAL').slice(0, 3)
      });
    }

    if (errorCount >= thresholds.maxErrorsPer5Min) {
      alerts.push({
        type: 'ERROR_THRESHOLD_EXCEEDED',
        severity: 'high',
        message: `${errorCount} errors in last 5 minutes (threshold: ${thresholds.maxErrorsPer5Min})`,
        count: errorCount,
        threshold: thresholds.maxErrorsPer5Min,
        logs: recentLogs.filter(l => l.level === 'ERROR').slice(0, 5)
      });
    }

    if (warningCount >= thresholds.maxWarningsPer5Min) {
      alerts.push({
        type: 'WARNING_THRESHOLD_EXCEEDED',
        severity: 'medium',
        message: `${warningCount} warnings in last 5 minutes (threshold: ${thresholds.maxWarningsPer5Min})`,
        count: warningCount,
        threshold: thresholds.maxWarningsPer5Min,
        logs: recentLogs.filter(l => l.level === 'WARN').slice(0, 5)
      });
    }

    // AI-powered pattern analysis for critical issues
    let aiInsights = null;
    if (enableRealTimeAnalysis && alerts.length > 0 && deepseekApiKey) {
      try {
        console.log('🤖 Running AI analysis on critical logs...');
        
        const criticalLogs = recentLogs.filter(l => l.level === 'CRITICAL' || l.level === 'ERROR');
        const logContext = criticalLogs.map(l => ({
          timestamp: l.timestamp,
          level: l.level,
          context: l.context,
          message: l.message,
          error_name: l.error_name,
          metadata: l.metadata
        }));

        const prompt = `You are monitoring a production system in real-time. These critical logs just occurred in the last 5 minutes. Analyze them for immediate threats and provide urgent recommendations.

CRITICAL LOGS (Last 5 minutes):
${JSON.stringify(logContext, null, 2)}

ALERT SUMMARY:
- Critical logs: ${criticalCount}
- Error logs: ${errorCount}
- Warning logs: ${warningCount}

Provide immediate analysis in this JSON format:
{
  "immediate_threat": "yes/no",
  "threat_level": "critical/high/medium/low",
  "likely_cause": "what's probably causing this",
  "immediate_actions": [
    "urgent action 1",
    "urgent action 2"
  ],
  "system_impact": "how this affects users/system",
  "escalation_needed": "yes/no",
  "estimated_resolution_time": "minutes/hours",
  "preventive_measures": [
    "how to prevent this in future"
  ],
  "monitoring_recommendations": [
    "what to watch for"
  ]
}

Focus on immediate threats and urgent actions needed. Be concise and actionable.`;

        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${deepseekApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { 
                role: 'system', 
                content: 'You are a real-time system monitoring expert. You analyze critical logs and provide immediate, actionable recommendations for production incidents. Always respond with valid JSON format and focus on urgent actions.' 
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 1000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const analysisText = data.choices[0].message.content;
          
          try {
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              aiInsights = JSON.parse(jsonMatch[0]);
            }
          } catch (parseError) {
            console.error('Failed to parse AI insights:', parseError);
          }
        }
      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
      }
    }

    // Store monitoring results
    const { error: insertError } = await supabase
      .from('system_logs')
      .insert({
        level: 'INFO',
        context: 'MONITORING',
        message: `Real-time monitoring check: ${alerts.length} alerts triggered`,
        metadata: {
          alert_count: alerts.length,
          error_count: errorCount,
          critical_count: criticalCount,
          warning_count: warningCount,
          thresholds: thresholds,
          ai_insights: aiInsights
        },
        ai_analysis: aiInsights,
        ai_insights: aiInsights ? [aiInsights.immediate_threat, aiInsights.likely_cause] : [],
        ai_recommendations: aiInsights?.immediate_actions || [],
        ai_severity_score: aiInsights?.threat_level === 'critical' ? 100 : 
                          aiInsights?.threat_level === 'high' ? 80 : 
                          aiInsights?.threat_level === 'medium' ? 60 : 40,
        ai_analyzed_at: new Date().toISOString(),
        ai_confidence_score: 0.9
      });

    if (insertError) {
      console.error('Error storing monitoring results:', insertError);
    }

    // Determine overall system status
    let status = 'healthy';
    if (criticalCount > 0) status = 'critical';
    else if (errorCount > 0) status = 'degraded';
    else if (warningCount > 5) status = 'warning';

    console.log(`✅ Monitoring complete: ${status} status, ${alerts.length} alerts`);

    return new Response(JSON.stringify({
      success: true,
      status,
      alerts,
      aiInsights,
      summary: {
        total_logs: recentLogs.length,
        error_count: errorCount,
        critical_count: criticalCount,
        warning_count: warningCount,
        alert_count: alerts.length
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Real-time monitoring error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
