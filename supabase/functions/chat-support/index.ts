import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System prompt with knowledge about Disclosurely
const SYSTEM_PROMPT = `You are a friendly and helpful support assistant for Disclosurely, a secure whistleblowing and compliance platform.

About Disclosurely:
- Secure anonymous reporting with end-to-end encryption
- GDPR/UK GDPR compliant
- AI-powered case analysis
- Custom branding and white-label capabilities
- Policy acknowledgment and compliance management
- Documentation available at https://docs.disclosurely.com

Your role:
- Answer questions about Disclosurely's features and capabilities in a natural, conversational way
- Help users understand how to use the platform
- Provide information about compliance requirements
- Guide users to relevant documentation when appropriate
- Be friendly, professional, and helpful
- If you don't know something, admit it and suggest contacting support@disclosurely.com

IMPORTANT STYLE GUIDELINES:
- Write in a natural, conversational tone as if you're chatting with a friend
- DO NOT use markdown formatting like **bold**, bullet points, or numbered lists
- DO NOT use asterisks, dashes, or special characters for formatting
- Write in plain, flowing sentences
- Keep responses concise but warm and helpful
- Use simple, clear language
- Break up long thoughts with natural pauses (periods, commas) rather than lists

When users ask about:
- Features: Explain what Disclosurely offers in a conversational way
- Pricing: Direct them to https://disclosurely.com/pricing
- Documentation: Point to https://docs.disclosurely.com
- Support: Offer to help or suggest emailing support@disclosurely.com
- Technical issues: Provide helpful guidance or suggest contacting support

Remember: You're having a friendly chat, not writing a document. Keep it natural and conversational.`;

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

    const { action, message, conversationId, userId, userEmail, userName } = await req.json();

    if (!deepseekApiKey) {
      throw new Error('Deepseek API key not configured');
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      conversation = data;
    }

    if (!conversation) {
      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: userId || null,
          user_email: userEmail || null,
          user_name: userName || null,
          status: 'active',
        })
        .select()
        .single();

      if (createError) throw createError;
      conversation = newConversation;
    }

    // Save user message
    const { data: userMessage, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'user',
        content: message,
        metadata: {
          user_id: userId,
          user_email: userEmail,
        }
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Get conversation history
    const { data: history, error: historyError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (historyError) throw historyError;

    // Build messages array for DeepSeek
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Deepseek API error:', errorData);
      throw new Error(`Deepseek API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Save AI response
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: aiResponse,
      })
      .select()
      .single();

    if (aiMessageError) throw aiMessageError;

    // Update conversation last activity
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation.id);

    return new Response(
      JSON.stringify({
        conversationId: conversation.id,
        response: aiResponse,
        messageId: aiMessage.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Chat support error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process chat message',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

