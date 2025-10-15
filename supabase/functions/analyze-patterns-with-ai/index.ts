import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reports } = await req.json()

    if (!reports || !Array.isArray(reports)) {
      return new Response(
        JSON.stringify({ error: 'Reports array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare reports data for AI analysis
    const reportsData = reports.map(report => ({
      id: report.id,
      title: report.title,
      category: report.category || 'Unknown',
      priority: report.priority || 1,
      status: report.status || 'new',
      created_at: report.created_at,
      tags: report.tags || []
    }))

    // AI prompt for pattern analysis
    const prompt = `You are a Compliance Intelligence Analyst reviewing whistleblower reports. Analyze the following reports and provide insights on patterns, emerging risks, and organizational themes.

Reports to analyze:
${JSON.stringify(reportsData, null, 2)}

Please provide a comprehensive analysis focusing on:

1. **Key Insights**: Overall patterns and trends across all cases
2. **Common Themes**: Recurring issues, categories, or concerns
3. **Recommendations**: Actionable steps for senior compliance/HR review

Format your response as JSON with the following structure:
{
  "key_insights": "Brief overview of patterns and emerging risks",
  "common_themes": [
    {
      "theme": "Theme name",
      "frequency": "Number of occurrences",
      "description": "Brief description"
    }
  ],
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2"
  ]
}

Keep the analysis concise, factual, and practical. Focus on compliance intelligence that would be valuable for senior management review.`

    // Call DeepSeek AI
    const aiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a Compliance Intelligence Analyst specializing in whistleblower report analysis. Provide structured, actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    })

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const analysisText = aiData.choices[0]?.message?.content

    if (!analysisText) {
      throw new Error('No analysis received from AI')
    }

    // Try to parse JSON response, fallback to text if parsing fails
    let analysis
    try {
      analysis = JSON.parse(analysisText)
    } catch {
      // Fallback if AI doesn't return valid JSON
      analysis = {
        key_insights: analysisText,
        common_themes: [],
        recommendations: []
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        analyzed_at: new Date().toISOString(),
        reports_analyzed: reportsData.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Pattern analysis error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
