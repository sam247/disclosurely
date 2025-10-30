import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-organization-id',
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

    // ============================================================================
    // AI GATEWAY - ALWAYS ON (no feature flags)
    // ============================================================================
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get organization_id - from caseData or lookup from report
    let organizationId = caseData.organization_id;
    
    if (!organizationId && caseData.id) {
      // Lookup org from report table
      const { data: report } = await supabase
        .from('reports')
        .select('organization_id')
        .eq('id', caseData.id)
        .single();
      
      organizationId = report?.organization_id;
    }
    
    const useAIGateway = !!(organizationId && authHeader);
    console.log(`[AI Gateway] ${useAIGateway ? 'ROUTING' : 'SKIPPING'} - org: ${organizationId || 'NONE'}`);

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

Keep it conversational, practical, and focused on what the compliance team needs to do next. Use bullet points and be direct about actions needed.

IMPORTANT: End your analysis with 1-2 conversational questions that help the compliance team think through next steps or get clarification on specific aspects of the case. Make these questions helpful and practical, like a colleague asking for guidance.`;

    const messages = [
      { 
        role: 'system', 
        content: `You are an expert compliance consultant and whistleblower case advisor. Your role is to help compliance teams and business managers navigate complex ethical, legal, and regulatory issues with confidence and clarity.

Your expertise includes:
- Whistleblower case analysis and risk assessment
- GDPR, data privacy, and information security regulations
- Employment law, discrimination, and workplace misconduct
- Corporate governance and ethical business practices  
- Investigation procedures and evidence preservation
- Stakeholder communication and reputational risk management

Communication style:
- Professional yet approachable - like a trusted advisor
- Use clear, jargon-free language that business managers understand
- Provide specific, actionable guidance with realistic timelines
- Balance legal precision with practical business context
- Acknowledge complexity while offering clear next steps

Response format:
- Start with a brief executive summary of the situation
- Assess risk level and explain your reasoning
- Provide immediate actions (next 24-48 hours)
- Outline investigation steps and timelines
- Highlight legal/compliance considerations
- End with 1-2 strategic questions to guide decision-making

Always consider uploaded company documents (policies, procedures, codes of conduct) when providing guidance. Reference specific policies when relevant.

Remember: Compliance teams need confidence and clarity under pressure. Be the advisor they can trust.` 
      },
      { role: 'user', content: prompt }
    ];

    let analysis;
    let metadata = {
      timestamp: new Date().toISOString(),
      documentsAnalyzed: companyDocuments?.length || 0,
      routedVia: useAIGateway ? 'ai_gateway' : 'direct_deepseek',
      piiRedacted: false
    };

    // ============================================================================
    // ROUTE 1: AI Gateway (with PII protection)
    // ============================================================================
    if (useAIGateway) {
      const gatewayResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-gateway-generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': authHeader!,
            'X-Organization-Id': organizationId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            temperature: 0.3,
            max_tokens: 2000,
            context: {
              purpose: 'case_analysis',
              report_id: caseData.id
            }
          }),
        }
      );

      if (!gatewayResponse.ok) {
        const errorBody = await gatewayResponse.text();
        console.error(`[AI Gateway] HTTP ${gatewayResponse.status} - ${errorBody}`);
        console.error('[AI Gateway] ERROR - Falling back to direct DeepSeek');
        analysis = null; // Will fallback to direct DeepSeek below
      } else {
        const gatewayData = await gatewayResponse.json();
        analysis = gatewayData.choices[0].message.content;
        metadata.piiRedacted = gatewayData.metadata?.pii_redacted || false;
        
        // If PII was redacted, add a note
        if (metadata.piiRedacted) {
          analysis += '\n\n_🔒 Note: Sensitive information was automatically redacted for privacy during AI analysis._';
        }
      }
    }

    // ============================================================================
    // ROUTE 2: Direct DeepSeek (fallback or feature disabled)
    // ============================================================================
    if (!useAIGateway || !analysis) {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
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
      analysis = data.choices[0].message.content;
      metadata.routedVia = 'direct_deepseek';
    }

    return new Response(JSON.stringify({ 
      analysis,
      ...metadata
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
