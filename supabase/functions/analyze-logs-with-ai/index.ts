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

    const { analysisType = 'recent', timeRange = '24h', logLevel = 'ERROR', context = null } = await req.json();

    if (!deepseekApiKey) {
      throw new Error('Deepseek API key not configured');
    }

    console.log(`🔍 Starting AI log analysis: ${analysisType} for ${timeRange}`);

    // Build time filter
    let timeFilter = '';
    switch (timeRange) {
      case '1h':
        timeFilter = "timestamp >= NOW() - INTERVAL '1 hour'";
        break;
      case '24h':
        timeFilter = "timestamp >= NOW() - INTERVAL '24 hours'";
        break;
      case '7d':
        timeFilter = "timestamp >= NOW() - INTERVAL '7 days'";
        break;
      case '30d':
        timeFilter = "timestamp >= NOW() - INTERVAL '30 days'";
        break;
      default:
        timeFilter = "timestamp >= NOW() - INTERVAL '24 hours'";
    }

    // Build query filters
    let whereClause = `WHERE ${timeFilter}`;
    if (logLevel && logLevel !== 'ALL') {
      whereClause += ` AND level = '${logLevel}'`;
    }
    if (context) {
      whereClause += ` AND context = '${context}'`;
    }

    // Get logs for analysis
    const { data: logs, error: logsError } = await supabase
      .from('system_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      throw logsError;
    }

    if (!logs || logs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        analysis: {
          summary: "No logs found for analysis",
          insights: [],
          recommendations: [],
          patterns: []
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 Analyzing ${logs.length} log entries`);

    // Prepare log data for AI analysis
    const logSummary = {
      total_logs: logs.length,
      error_count: logs.filter(l => l.level === 'ERROR').length,
      critical_count: logs.filter(l => l.level === 'CRITICAL').length,
      warning_count: logs.filter(l => l.level === 'WARN').length,
      contexts: [...new Set(logs.map(l => l.context))],
      recent_errors: logs.filter(l => l.level === 'ERROR').slice(0, 5).map(l => ({
        timestamp: l.timestamp,
        context: l.context,
        message: l.message,
        error_name: l.error_name,
        metadata: l.metadata
      }))
    };

    const prompt = `You are an expert system administrator and DevOps engineer analyzing application logs. Analyze these logs and provide actionable insights.

SYSTEM LOG ANALYSIS REQUEST:
- Analysis Type: ${analysisType}
- Time Range: ${timeRange}
- Log Level Filter: ${logLevel}
- Context Filter: ${context || 'All contexts'}

LOG SUMMARY:
${JSON.stringify(logSummary, null, 2)}

RECENT ERROR SAMPLES:
${JSON.stringify(logSummary.recent_errors, null, 2)}

Please analyze these logs and provide insights in this JSON format:
{
  "summary": "Brief overview of what's happening in the system",
  "critical_issues": [
    {
      "issue": "description of critical issue",
      "severity": "critical/high/medium",
      "impact": "what this means for the system",
      "immediate_action": "what needs to be done now"
    }
  ],
  "patterns": [
    {
      "pattern": "description of recurring pattern",
      "frequency": "how often this occurs",
      "likely_cause": "what's probably causing this",
      "recommendation": "how to address this pattern"
    }
  ],
  "insights": [
    "actionable insight 1",
    "actionable insight 2",
    "actionable insight 3"
  ],
  "recommendations": [
    "immediate action needed",
    "short-term improvement",
    "long-term optimization"
  ],
  "health_score": 85,
  "priority_actions": [
    "most urgent thing to fix",
    "second most urgent",
    "third most urgent"
  ],
  "trend_analysis": {
    "error_trend": "increasing/stable/decreasing",
    "performance_trend": "improving/stable/degrading",
    "stability_assessment": "stable/unstable/critical"
  }
}

Focus on:
- Identifying root causes of errors
- Patterns that indicate systemic issues
- Performance bottlenecks
- Security concerns
- Actionable recommendations for immediate fixes
- Preventive measures to avoid future issues

Be specific and practical - provide concrete steps the development team can take.`;

    console.log('🤖 Calling DeepSeek AI for log analysis...');

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
            content: 'You are an expert system administrator and DevOps engineer. You analyze application logs and provide actionable insights for development teams. Always respond with valid JSON format and focus on practical, implementable solutions.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Deepseek API error:', errorData);
      throw new Error(`Deepseek API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    console.log('📝 Parsing AI analysis response...');

    // Try to parse JSON from the response
    let analysis;
    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw AI response:', analysisText);
      
      // Fallback analysis
      analysis = {
        summary: "AI analysis completed but response format was unexpected",
        critical_issues: [],
        patterns: [],
        insights: ["Review the raw AI response for manual analysis"],
        recommendations: ["Check system logs manually for patterns"],
        health_score: 50,
        priority_actions: ["Manual log review recommended"],
        trend_analysis: {
          error_trend: "unknown",
          performance_trend: "unknown", 
          stability_assessment: "unknown"
        }
      };
    }

    // Store analysis results in database
    const { error: insertError } = await supabase
      .from('system_logs')
      .insert({
        level: 'INFO',
        context: 'AI_ANALYSIS',
        message: `AI Log Analysis: ${analysisType} for ${timeRange}`,
        metadata: {
          analysis_type: analysisType,
          time_range: timeRange,
          log_level_filter: logLevel,
          context_filter: context,
          logs_analyzed: logs.length,
          ai_response: analysis
        },
        ai_analysis: analysis,
        ai_insights: analysis.insights || [],
        ai_recommendations: analysis.recommendations || [],
        ai_severity_score: analysis.health_score || 50,
        ai_pattern_match: analysis.patterns?.[0]?.pattern || null,
        ai_analyzed_at: new Date().toISOString(),
        ai_confidence_score: 0.85
      });

    if (insertError) {
      console.error('Error storing AI analysis:', insertError);
    }

    console.log('✅ AI log analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysis,
      metadata: {
        logs_analyzed: logs.length,
        analysis_timestamp: new Date().toISOString(),
        time_range: timeRange
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ AI log analysis error:', error);
    
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
