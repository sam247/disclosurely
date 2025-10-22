#!/usr/bin/env node

/**
 * Fix existing blog post content in Contentful
 * Updates the Rich Text structure to have proper paragraphs and headings
 */

const CONTENTFUL_SPACE_ID = 'rm7hib748uv7';
const CONTENTFUL_MANAGEMENT_TOKEN = 'CFPAT-yBPDay971BqnFXTN7U_RWNAJSdMMC0TxqYtNZZ_HWlk';

// The existing blog post ID
const BLOG_POST_ID = '3kFrXPIGmoKl9uP716cxeF';

function convertHtmlToRichText(html) {
  // Convert HTML to Contentful Rich Text format
  // Parse HTML and convert to proper Rich Text structure
  
  const content = [];
  
  // Split by common HTML block elements
  const blocks = html.split(/(<\/?(?:h[1-6]|p|div|ul|ol|li|blockquote|br)\b[^>]*>)/i);
  
  let currentBlock = '';
  let inBlock = false;
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Check if this is an opening tag
    if (block.match(/^<(h[1-6]|p|div|ul|ol|li|blockquote)\b/i)) {
      inBlock = true;
      continue;
    }
    
    // Check if this is a closing tag
    if (block.match(/^<\/(h[1-6]|p|div|ul|ol|li|blockquote)>/i)) {
      if (currentBlock.trim()) {
        const tag = block.match(/^<\/(h[1-6]|p|div|ul|ol|li|blockquote)>/i)[1];
        
        if (tag.match(/^h[1-6]$/)) {
          // Heading
          const level = parseInt(tag[1]);
          content.push({
            nodeType: `heading-${level}`,
            data: {},
            content: [{
              nodeType: 'text',
              value: currentBlock.trim(),
              marks: [],
              data: {}
            }]
          });
        } else if (tag === 'p' || tag === 'div') {
          // Paragraph
          content.push({
            nodeType: 'paragraph',
            data: {},
            content: [{
              nodeType: 'text',
              value: currentBlock.trim(),
              marks: [],
              data: {}
            }]
          });
        } else if (tag === 'blockquote') {
          // Blockquote
          content.push({
            nodeType: 'blockquote',
            data: {},
            content: [{
              nodeType: 'paragraph',
              data: {},
              content: [{
                nodeType: 'text',
                value: currentBlock.trim(),
                marks: [],
                data: {}
              }]
            }]
          });
        }
      }
      currentBlock = '';
      inBlock = false;
      continue;
    }
    
    // Check for line breaks
    if (block === '<br>' || block === '<br/>') {
      if (currentBlock.trim()) {
        content.push({
          nodeType: 'paragraph',
          data: {},
          content: [{
            nodeType: 'text',
            value: currentBlock.trim(),
            marks: [],
            data: {}
          }]
        });
        currentBlock = '';
      }
      continue;
    }
    
    // If we're in a block, add the text content
    if (inBlock && !block.match(/^<[^>]*>$/)) {
      currentBlock += block;
    }
  }
  
  // Handle any remaining content
  if (currentBlock.trim()) {
    content.push({
      nodeType: 'paragraph',
      data: {},
      content: [{
        nodeType: 'text',
        value: currentBlock.trim(),
        marks: [],
        data: {}
      }]
    });
  }
  
  // If no content was parsed, fall back to simple paragraph
  if (content.length === 0) {
    const cleanText = html.replace(/<[^>]*>/g, '').trim();
    content.push({
      nodeType: 'paragraph',
      data: {},
      content: [{
        nodeType: 'text',
        value: cleanText,
        marks: [],
        data: {}
      }]
    });
  }
  
  return {
    nodeType: 'document',
    data: {},
    content: content
  };
}

async function fixBlogPostContent() {
  console.log('🔧 Fixing blog post content structure...');
  
  // First, get the current entry to see its content
  const getResponse = await fetch(`https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/master/entries/${BLOG_POST_ID}`, {
    headers: {
      'Authorization': `Bearer ${CONTENTFUL_MANAGEMENT_TOKEN}`,
      'Content-Type': 'application/vnd.contentful.management.v1+json'
    }
  });
  
  if (!getResponse.ok) {
    throw new Error(`Failed to get entry: ${getResponse.statusText}`);
  }
  
  const entry = await getResponse.json();
  console.log('📋 Current entry retrieved');
  
  // Extract the current content and convert it to proper Rich Text
  const currentContent = entry.fields.content['en-US'];
  console.log('📝 Current content structure:', JSON.stringify(currentContent, null, 2));
  
  // For now, let's create a simple multi-paragraph structure
  // We'll split the text content by common patterns and create separate paragraphs
  const textContent = currentContent.content[0].content[0].value;
  
  // Split by common patterns that indicate new paragraphs/sections
  const sections = textContent.split(/(?=\n\n|\n[A-Z][a-z]+:|What Exactly|Why Whistleblowing|Early Detection|Legal and Regulatory|Cultural Transformation|Key Components|The Business Case|Implementing and Maintaining|Conclusion)/);
  
  const newContent = sections
    .map(section => section.trim())
    .filter(section => section.length > 0)
    .map(section => {
      // Check if it looks like a heading
      if (section.match(/^(What Exactly|Why Whistleblowing|Early Detection|Legal and Regulatory|Cultural Transformation|Key Components|The Business Case|Implementing and Maintaining|Conclusion)/)) {
        return {
          nodeType: 'heading-2',
          data: {},
          content: [{
            nodeType: 'text',
            value: section,
            marks: [],
            data: {}
          }]
        };
      } else {
        return {
          nodeType: 'paragraph',
          data: {},
          content: [{
            nodeType: 'text',
            value: section,
            marks: [],
            data: {}
          }]
        };
      }
    });
  
  console.log('🔄 New content structure:', JSON.stringify(newContent, null, 2));
  
  // Update the entry with the new content structure
  const updateData = {
    fields: {
      ...entry.fields,
      content: {
        'en-US': {
          nodeType: 'document',
          data: {},
          content: newContent
        }
      }
    }
  };
  
  const updateResponse = await fetch(`https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/master/entries/${BLOG_POST_ID}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CONTENTFUL_MANAGEMENT_TOKEN}`,
      'Content-Type': 'application/vnd.contentful.management.v1+json',
      'X-Contentful-Version': entry.sys.version.toString()
    },
    body: JSON.stringify(updateData)
  });
  
  if (!updateResponse.ok) {
    const error = await updateResponse.text();
    throw new Error(`Failed to update entry: ${updateResponse.statusText} - ${error}`);
  }
  
  const result = await updateResponse.json();
  console.log('✅ Blog post content structure fixed!');
  console.log(`📋 Entry ID: ${result.sys.id}`);
  console.log(`🔗 View in Contentful: https://app.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/entries/${result.sys.id}`);
  
  return result;
}

async function main() {
  try {
    await fixBlogPostContent();
    console.log('');
    console.log('🎉 Blog post content has been restructured!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to Contentful to review the new structure');
    console.log('2. Publish the entry if needed');
    console.log('3. Refresh your blog page to see the formatting');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
