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

    const prompt = `You are a helpful AI assistant for compliance teams. Analyze this whistleblower case and provide actionable guidance in a conversational, helpful format.

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

Please provide your analysis in this helpful format:

🚨 **What's the situation?**
[Brief summary of what happened]

⚠️ **Risk Level Assessment**
[Your assessment of the risk level and why]

🎯 **Immediate Actions Needed**
• [Action 1 with timeline]
• [Action 2 with timeline]
• [Action 3 with timeline]

📋 **Next Steps**
• [Short-term action]
• [Medium-term action]
• [Long-term action]

⚖️ **Legal & Compliance Notes**
• [Key legal consideration]
• [Policy compliance note]
• [Stakeholder notification needed]

💡 **My Recommendations**
• [Strategic recommendation 1]
• [Strategic recommendation 2]
• [Strategic recommendation 3]

Keep it conversational, practical, and focused on what the compliance team needs to do next. Use bullet points and be direct about actions needed.`;

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
            content: 'You are a helpful AI assistant for compliance teams. You provide practical, actionable guidance in a conversational tone. Focus on what compliance teams need to do next, use bullet points, and be direct about actions needed. Avoid formal report language - be more like a helpful colleague.' 
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
      error: (error as Error).message,
      fallbackAnalysis: `
🚨 **What's the situation?**
AI analysis is temporarily unavailable, but I can still help guide your next steps.

⚠️ **Risk Level Assessment**
Since I can't analyze the specific content right now, treat this as a standard priority case until manual review.

🎯 **Immediate Actions Needed**
• Assign this case to a senior case handler (within 24 hours)
• Review the case content for any urgency indicators
• Implement your standard escalation procedures
• Document all actions taken

📋 **Next Steps**
• Initial review: Within 24 hours
• Preliminary investigation: 1-7 days
• Full investigation: 1-4 weeks

⚖️ **Legal & Compliance Notes**
• Follow your organization's standard whistleblower protection procedures
• Ensure proper documentation throughout the process
• Notify relevant stakeholders as per your policy

💡 **My Recommendations**
• Contact your compliance team for detailed analysis
• Use this as an opportunity to review your case handling procedures
• Consider implementing additional AI analysis capabilities

*Analysis generated: ${new Date().toLocaleString()}*
      `
    }), {
      status: 200, // Return 200 so the frontend can handle gracefully
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});