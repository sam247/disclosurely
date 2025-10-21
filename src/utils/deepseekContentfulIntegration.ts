/**
 * DeepSeek + Contentful MCP Integration
 * This demonstrates how to use DeepSeek AI with Contentful MCP tools
 */

// Example usage in your React app or Node.js script

async function generateBlogPostWithDeepSeekAndContentful() {
  const topic = "GDPR Compliance Best Practices";
  const authorId = "5gz83P25yjQSPFnVG5Dlgy"; // Sarah Johnson
  const categoryId = "21ROO2RRzFHhcmi1Cpl76l"; // Compliance

  try {
    // Step 1: Generate content with DeepSeek AI
    console.log("🤖 Generating content with DeepSeek AI...");
    
    const deepSeekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content writer specializing in compliance, whistleblowing, and corporate governance. Create engaging, SEO-optimized blog posts.'
          },
          {
            role: 'user',
            content: `Create a comprehensive blog post about "${topic}" for a whistleblowing and compliance platform. 

Requirements:
- Title: Catchy and SEO-friendly (50-60 characters)
- Slug: URL-friendly version of title (lowercase, hyphens)
- Content: Well-structured with headings, paragraphs (800-1200 words)
- Excerpt: Compelling summary (150-200 characters)
- SEO Title: Optimized for search engines (30-60 characters)
- SEO Description: Meta description (120-160 characters)
- Tags: 3-5 relevant tags
- Reading Time: Estimate in minutes

Format the response as JSON with this exact structure:
{
  "title": "Your Title Here",
  "slug": "your-slug-here",
  "content": "Your full blog content with proper HTML formatting",
  "excerpt": "Your compelling excerpt here",
  "seoTitle": "SEO Optimized Title",
  "seoDescription": "SEO meta description here",
  "tags": ["tag1", "tag2", "tag3"],
  "readingTime": 5
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const deepSeekData = await deepSeekResponse.json();
    const generatedContent = deepSeekData.choices[0]?.message?.content;
    
    // Parse the JSON response
    const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
    const blogData = JSON.parse(jsonMatch[0]);
    
    console.log("✅ Content generated successfully!");
    console.log(`📝 Title: ${blogData.title}`);
    console.log(`🔗 Slug: ${blogData.slug}`);

    // Step 2: Create Contentful entry using MCP tools
    console.log("📝 Creating Contentful entry...");
    
    // This is where you would use the Contentful MCP tools
    // The blogData object contains all the structured content ready for Contentful
    
    const contentfulEntryData = {
      fields: {
        title: { 'en-US': blogData.title },
        slug: { 'en-US': blogData.slug },
        content: { 'en-US': blogData.content },
        excerpt: { 'en-US': blogData.excerpt },
        seoTitle: { 'en-US': blogData.seoTitle },
        seoDescription: { 'en-US': blogData.seoDescription },
        tags: { 'en-US': blogData.tags },
        readingTime: { 'en-US': blogData.readingTime },
        publishDate: { 'en-US': new Date().toISOString() },
        status: { 'en-US': 'draft' },
        author: { 'en-US': { sys: { id: authorId, linkType: 'Entry', type: 'Link' } } },
        categories: { 'en-US': [{ sys: { id: categoryId, linkType: 'Entry', type: 'Link' } }] }
      }
    };

    console.log("📋 Contentful entry data ready:");
    console.log(JSON.stringify(contentfulEntryData, null, 2));

    // Step 3: Use Contentful MCP to create the entry
    // This would be done through the MCP tools in your environment
    console.log("🚀 Ready to create Contentful entry via MCP tools!");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Example of how to use this in your React component
export function useDeepSeekContentGeneration() {
  const generateContent = async (topic: string, authorId: string, categoryId: string) => {
    try {
      // Call DeepSeek API
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, authorId, categoryId })
      });
      
      const blogData = await response.json();
      
      // Use Contentful MCP tools to create entry
      // This would be handled by your backend or MCP integration
      
      return blogData;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  };

  return { generateContent };
}

export default generateBlogPostWithDeepSeekAndContentful;
