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
    const { caseData, companyDocuments, caseContent } = await req.json();

    if (!deepseekApiKey) {
      throw new Error('Deepseek API key not configured');
    }

    // Prepare the context for the AI
    let documentContext = '';
    if (companyDocuments && companyDocuments.length > 0) {
      documentContext = `\n\nCOMPANY POLICY CONTEXT:\n${companyDocuments.map((doc: any) => `- ${doc.name}: ${doc.content || 'Document uploaded but content not provided'}`).join('\n')}`;
    }

    const prompt = `You are an expert compliance analyst reviewing a whistleblower case. Analyze the following case and provide detailed recommendations.

CASE DETAILS:
- Title: ${caseData.title}
- Tracking ID: ${caseData.tracking_id}
- Status: ${caseData.status}
- Priority: ${caseData.priority}/5
- Type: ${caseData.report_type}
- Created: ${caseData.created_at}

CASE CONTENT:
${caseContent || 'Case content not available'}
${documentContext}

Please provide a comprehensive analysis including:
1. Risk assessment and compliance implications
2. Immediate actions required
3. Short-term and medium-term recommendations
4. Legal considerations and stakeholder notifications
5. Policy compliance review (if company documents provided)
6. Recommended course of action with timelines

Format your response professionally as a detailed compliance report.`;

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
            content: 'You are an expert compliance analyst specializing in whistleblower case analysis, risk assessment, and regulatory compliance. Provide detailed, actionable recommendations.' 
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
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      analysis,
      timestamp: new Date().toISOString(),
      documentsAnalyzed: companyDocuments?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-case-with-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackAnalysis: `
AI CASE ANALYSIS REPORT
Case: ${req.body?.caseData?.title || 'Unknown'} (${req.body?.caseData?.tracking_id || 'N/A'})

NOTE: AI analysis service temporarily unavailable. Please proceed with manual review.

IMMEDIATE ACTIONS REQUIRED:
1. Assign case to senior case handler
2. Review case content for urgency indicators
3. Implement standard escalation procedures
4. Document all actions taken

RECOMMENDED TIMELINE:
- Initial review: Within 24 hours
- Preliminary investigation: 1-7 days
- Full investigation: 1-4 weeks

Please contact your compliance team for detailed analysis.
Generated: ${new Date().toLocaleString()}
      `
    }), {
      status: 200, // Return 200 so the frontend can handle gracefully
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});