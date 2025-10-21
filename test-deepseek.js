#!/usr/bin/env node

/**
 * Test DeepSeek API Integration
 */

const DEEPSEEK_API_KEY = 'sk-306eb3776ac04154b8d05a7c79ab2bbe';

async function testDeepSeekAPI() {
  console.log('🤖 Testing DeepSeek API integration...');
  
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content writer specializing in compliance, whistleblowing, and corporate governance.'
          },
          {
            role: 'user',
            content: 'Create a short blog post about "GDPR Compliance Best Practices" for a whistleblowing platform. Format as JSON with title, slug, content, excerpt, and tags.'
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ DeepSeek API working!');
    console.log('📝 Generated content:');
    console.log(data.choices[0]?.message?.content);
    
    return true;
  } catch (error) {
    console.error('❌ DeepSeek API Error:', error.message);
    return false;
  }
}

testDeepSeekAPI();
