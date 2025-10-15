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
    const { reportData, reportContent } = await req.json();

    if (!deepseekApiKey) {
      throw new Error('Deepseek API key not configured');
    }

    const prompt = `You are an expert risk assessment analyst. Analyze the following whistleblower report and provide a comprehensive risk assessment using the standard risk matrix methodology.

REPORT DETAILS:
- Title: ${reportData.title}
- Tracking ID: ${reportData.tracking_id}
- Status: ${reportData.status}
- Type: ${reportData.report_type}
- Created: ${reportData.created_at}

REPORT CONTENT:
${reportContent || 'Report content not available'}

RISK ASSESSMENT METHODOLOGY:
Please analyze this report using the following risk assessment framework:

1. IDENTIFY HAZARDS/THREATS: What are the potential risks or threats identified in this report?

2. DETERMINE LIKELIHOOD (1-5 scale):
   - 1 = Rare (unlikely to occur)
   - 2 = Unlikely (possible but not expected)
   - 3 = Possible (could occur)
   - 4 = Likely (probable to occur)
   - 5 = Certain (almost certain to occur)

3. DETERMINE IMPACT (1-5 scale):
   - 1 = Insignificant (minimal impact)
   - 2 = Minor (limited impact)
   - 3 = Moderate (noticeable impact)
   - 4 = Major (significant impact)
   - 5 = Catastrophic (severe impact)

4. CALCULATE RISK SCORE: Multiply Likelihood × Impact (1-25 scale)

Please provide your analysis in the following JSON format:
{
  "hazards_identified": ["list of identified hazards/threats"],
  "likelihood_score": [1-5],
  "likelihood_reasoning": "explanation for likelihood score",
  "impact_score": [1-5],
  "impact_reasoning": "explanation for impact score",
  "risk_score": [1-25],
  "risk_level": "Low/Medium/High/Critical",
  "priority_recommendation": "Immediate/High/Medium/Low",
  "immediate_actions": ["list of immediate actions required"],
  "risk_factors": ["key factors contributing to risk level"]
}

Focus on compliance, legal, operational, and reputational risks. Be thorough but concise.`;

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
            content: 'You are an expert risk assessment analyst specializing in whistleblower case analysis. Provide accurate risk assessments using standard risk matrix methodology. Always respond with valid JSON format.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1500,
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
    let riskAssessment;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        riskAssessment = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback: create a basic risk assessment
      riskAssessment = {
        hazards_identified: ["Unable to parse AI analysis"],
        likelihood_score: 3,
        likelihood_reasoning: "Default assessment due to parsing error",
        impact_score: 3,
        impact_reasoning: "Default assessment due to parsing error",
        risk_score: 9,
        risk_level: "Medium",
        priority_recommendation: "Medium",
        immediate_actions: ["Review case manually"],
        risk_factors: ["Analysis parsing error"]
      };
    }

    return new Response(JSON.stringify({ 
      riskAssessment,
      timestamp: new Date().toISOString(),
      rawAnalysis: analysisText
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Risk assessment error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
