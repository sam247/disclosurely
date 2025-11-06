import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Available categories in the system
const MAIN_CATEGORIES = {
  "Financial Misconduct": [
    "Fraud", "Bribery", "Corruption", "Embezzlement", "Theft",
    "Kickbacks", "Laundering", "Insider", "Forgery", "Collusion"
  ],
  "Workplace Behaviour": [
    "Harassment", "Discrimination", "Bullying", "Retaliation",
    "Nepotism", "Favouritism", "Misconduct", "Exploitation", "Abuse"
  ],
  "Legal & Compliance": [
    "Compliance", "Ethics", "Manipulation", "Extortion", "Coercion", "Violation"
  ],
  "Safety & Risk": [
    "Safety", "Negligence", "Hazards", "Sabotage"
  ],
  "Data & Security": [
    "Privacy", "Data", "Security", "Cyber"
  ]
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();

    if (!deepseekApiKey) {
      throw new Error('Deepseek API key not configured');
    }

    if (!title || !description) {
      return new Response(
        JSON.stringify({ error: 'Title and description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `You are a category classification AI for a whistleblowing platform. Based on the report title and description, suggest the most appropriate main category and subcategory.

REPORT TITLE: ${title}

REPORT DESCRIPTION: ${description}

AVAILABLE CATEGORIES:
${Object.entries(MAIN_CATEGORIES).map(([main, subs]) =>
  `- ${main}: ${subs.join(', ')}`
).join('\n')}

Analyze the content and return your suggestion in this exact JSON format:
{
  "mainCategory": "exact main category name from the list above",
  "subCategory": "exact subcategory name from the list above",
  "confidence": "high/medium/low",
  "reasoning": "brief explanation of why you chose this category"
}

IMPORTANT:
- Only use categories from the lists provided above
- Match the exact spelling and capitalization
- Choose the most specific and relevant categories
- Consider the severity and nature of the allegation`;

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
            content: 'You are an expert at categorizing whistleblowing reports. Always respond with valid JSON format matching the exact categories provided.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
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
    let suggestion;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestion = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback: use a safe default
      suggestion = {
        mainCategory: "Legal & Compliance",
        subCategory: "Compliance",
        confidence: "low",
        reasoning: "Unable to parse AI suggestion, using safe default"
      };
    }

    // Validate that the suggested categories exist
    const mainCategoryValid = Object.keys(MAIN_CATEGORIES).includes(suggestion.mainCategory);
    const subCategoryValid = mainCategoryValid &&
      MAIN_CATEGORIES[suggestion.mainCategory as keyof typeof MAIN_CATEGORIES].includes(suggestion.subCategory);

    if (!mainCategoryValid || !subCategoryValid) {
      console.warn('AI suggested invalid categories:', suggestion);
      // Fallback to safe default
      suggestion = {
        mainCategory: "Legal & Compliance",
        subCategory: "Compliance",
        confidence: "low",
        reasoning: "AI suggested invalid category, using safe default"
      };
    }

    return new Response(JSON.stringify({
      suggestion,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Category suggestion error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
