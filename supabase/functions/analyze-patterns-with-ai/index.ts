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

    const prompt = `You are an expert pattern recognition analyst specializing in whistleblower case analysis. Analyze the following collection of reports to identify patterns, trends, and insights.

REPORTS DATA:
${JSON.stringify(reportsSummary, null, 2)}

Please analyze these reports and identify:

1. COMMON THEMES: What recurring themes or topics appear across multiple reports?
2. CATEGORY PATTERNS: Are there patterns in report categories?
3. TEMPORAL PATTERNS: Are there time-based patterns (spikes, trends)?
4. RISK PATTERNS: Are there patterns in risk levels or priorities?
5. STATUS PATTERNS: Are there patterns in how cases are being handled?
6. EMERGING CONCERNS: What new or emerging issues are appearing?

Provide your analysis in the following JSON format:
{
  "common_themes": [
    {
      "theme": "theme name",
      "frequency": number,
      "description": "description of the theme",
      "examples": ["example report titles"]
    }
  ],
  "category_patterns": [
    {
      "category": "category name",
      "count": number,
      "percentage": number,
      "trend": "increasing/stable/decreasing"
    }
  ],
  "temporal_insights": {
    "peak_periods": ["time periods with high activity"],
    "trend": "increasing/stable/decreasing",
    "seasonal_patterns": ["any seasonal patterns identified"]
  },
  "risk_insights": {
    "high_risk_categories": ["categories with highest risk"],
    "risk_trends": "description of risk trends"
  },
  "recommendations": [
    "actionable recommendations based on patterns"
  ],
  "summary": "overall summary of key findings"
}

Focus on actionable insights that can help improve case management and prevent future issues.`;

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
            content: 'You are an expert pattern recognition analyst specializing in whistleblower case analysis. Identify meaningful patterns and provide actionable insights. Always respond with valid JSON format.' 
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
        recommendations: ["Review analysis manually"],
        summary: "Pattern analysis failed - manual review recommended"
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
