import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { reports } = await req.json();

    if (!deepseekApiKey) {
      throw new Error('Deepseek API key not configured');
    }

    if (!reports || reports.length === 0) {
      return new Response(JSON.stringify({ 
        patterns: [],
        insights: "No reports available for pattern analysis",
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare reports data for analysis
    const reportsSummary = reports.map((report: any) => ({
      title: report.title,
      category: report.category,
      status: report.status,
      created_at: report.created_at,
      priority: report.priority,
      tracking_id: report.tracking_id
    }));

    const prompt = `You are a helpful AI assistant for compliance teams. Review all whistleblowing cases and provide actionable insights in a conversational, helpful format.

REPORTS DATASET:
${JSON.stringify(reportsSummary, null, 2)}

I need you to analyze these cases and provide insights that help compliance teams understand what's happening and what to do next.

Please provide your analysis in this helpful JSON format:
{
  "common_themes": [
    {
      "theme": "theme name",
      "frequency": number,
      "description": "what this means for your organization",
      "examples": ["example report titles"],
      "action_needed": "what you should do about this"
    }
  ],
  "category_patterns": [
    {
      "category": "category name",
      "count": number,
      "percentage": number,
      "trend": "increasing/stable/decreasing",
      "concern_level": "high/medium/low",
      "suggested_action": "what to do about this trend"
    }
  ],
  "temporal_insights": {
    "peak_periods": ["when you're seeing more reports"],
    "trend": "increasing/stable/decreasing",
    "seasonal_patterns": ["any patterns in timing"],
    "what_this_means": "what these patterns suggest about your organization"
  },
  "risk_insights": {
    "high_risk_categories": ["areas that need immediate attention"],
    "risk_trends": "what's getting better or worse",
    "urgent_actions": ["immediate steps you should take"]
  },
  "recommendations": [
    "practical steps for your compliance team"
  ],
  "summary": "a helpful overview of what's happening with your reports and what you should focus on next"
}

Focus on:
- What patterns mean for your organization
- Immediate actions you should take
- Areas that need attention
- Practical next steps

Be conversational and helpful - like a colleague giving you insights about your data.`;

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
            content: 'You are a helpful AI assistant for compliance teams. You analyze patterns in whistleblower data and provide practical, actionable insights. Be conversational and helpful - like a colleague giving you insights about your data. Focus on what compliance teams need to do next and always respond with valid JSON format.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
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

    // Try to parse JSON from the response
    let patternAnalysis;
    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        patternAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback: create a basic pattern analysis
      patternAnalysis = {
        common_themes: [],
        category_patterns: [],
        temporal_insights: {
          peak_periods: [],
          trend: "stable",
          seasonal_patterns: []
        },
        risk_insights: {
          high_risk_categories: [],
          risk_trends: "Unable to analyze due to parsing error"
        },
        recommendations: ["I couldn't analyze the patterns right now - please review your cases manually"],
        summary: "Sorry, I couldn't analyze your case patterns at the moment. Please review your reports manually to identify any trends or areas that need attention."
      };
    }

    return new Response(JSON.stringify({ 
      patternAnalysis,
      timestamp: new Date().toISOString(),
      reportsAnalyzed: reports.length,
      rawAnalysis: analysisText
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Pattern analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
