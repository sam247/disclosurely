# Chat Widget Integration Guide

## Overview

The chat widget has been integrated into both the marketing site and the dashboard. It's designed to work with BYOK Chat or any other chat service that can be embedded via a script tag.

## Current Implementation

### Components Created

1. **`src/components/ChatWidget.tsx`** - The main chat widget component
   - Fully responsive and mobile-optimized
   - Styled to match Disclosurely's brand (uses primary color)
   - Positioned in bottom-right corner by default
   - Can be enabled/disabled via props

### Integration Points

1. **Marketing Site** (`src/components/Landing.tsx`)
   - Chat widget appears on all marketing pages
   - Available for visitors and potential customers

2. **Dashboard** (`src/components/dashboard/DashboardLayout.tsx`)
   - Chat widget available to all authenticated users
   - Provides support for subscribed users

## Configuration

### Environment Variable

Add the following to your `.env` file or Vercel environment variables:

```bash
VITE_CHAT_WIDGET_URL=https://your-byok-chat-instance.com/widget.js
```

### Component Props

```typescript
<ChatWidget 
  enabled={true}                    // Enable/disable the widget
  chatUrl="https://..."            // Optional: Override env var
  position="bottom-right"           // Position: 'bottom-right' | 'bottom-left'
  title="Support Chat"             // Custom title for chat window
  className="custom-class"         // Additional CSS classes
/>
```

## BYOK Chat Integration

Once you have the BYOK Chat integration details, you'll need to:

1. **Get the BYOK Chat Script URL**
   - This will typically be provided by BYOK Chat documentation
   - Format: `https://your-instance.byok.chat/widget.js` or similar

2. **Set the Environment Variable**
   ```bash
   VITE_CHAT_WIDGET_URL=https://your-byok-chat-url.com/widget.js
   ```

3. **Customize the Integration** (if needed)
   - The widget will automatically load the script when `finalChatUrl` is set
   - BYOK Chat will inject its interface into the `#chat-container` div
   - You may need to adjust the container ID or add initialization code based on BYOK's requirements

4. **Test the Integration**
   - Verify the script loads correctly
   - Test on both marketing site and dashboard
   - Ensure mobile responsiveness works

## Training BYOK Chat on Your Content

### Yes, You Can Train It!

BYOK Chat supports training on custom knowledge bases. You can train it on:
- **Documentation Site** (`docs.disclosurely.com`) - All your VitePress docs
- **Marketing Site** (`disclosurely.com`) - Landing pages, features, pricing info
- **Custom Content** - Any additional documentation you want to include

### Training Process

1. **Prepare Your Content**
   - **Docs Site**: Located in `/docs/docs/` (markdown files)
   - **Marketing Site**: Content from landing pages, features, etc.
   - **Format**: Markdown, HTML, or plain text

2. **Content Sources Available**
   ```
   /docs/docs/
   ├── introduction/          # Platform overview, key concepts
   ├── admin/                # Setup, organization settings
   ├── reporting/            # How to submit reports
   ├── cases/                # Case management guides
   ├── compliance/           # GDPR, EU Directive, SOX
   ├── security/             # Security best practices
   ├── ai/                   # AI features documentation
   └── ... (many more)
   ```

3. **Training Methods** (depends on BYOK Chat's implementation)
   - **Upload Files**: Direct markdown/HTML file uploads
   - **Web Scraping**: Point BYOK Chat to your docs site URL
   - **API Integration**: Programmatically send content
   - **Sitemap**: Provide sitemap.xml for automatic crawling

4. **Recommended Approach**
   - **Option 1**: Point BYOK Chat to `https://docs.disclosurely.com` and let it crawl
   - **Option 2**: Export all markdown files and upload directly
   - **Option 3**: Use BYOK Chat's API to send content programmatically

### Benefits of Training

- **Accurate Answers**: Chat can answer questions about your platform
- **Reduced Support Load**: Common questions answered automatically
- **Better User Experience**: Instant answers without waiting
- **Context-Aware**: Understands your specific features and terminology

## Human-to-Human Chat Feature

### How It Works

BYOK Chat supports **hybrid chat** - AI-powered responses with seamless escalation to human agents:

1. **AI-First Approach**
   - Chat starts with AI answering questions
   - AI uses your trained knowledge base
   - Handles common questions automatically

2. **Escalation to Human**
   - User can request: "Talk to a human" or "Speak with support"
   - AI can automatically escalate when:
     - Question is too complex
     - User expresses frustration
     - Specific keywords detected (e.g., "complaint", "urgent")
     - AI confidence is low

3. **Human Agent Interface**
   - Support team gets notifications of escalated chats
   - Agents can see chat history (AI conversation)
   - Agents respond directly in the same chat window
   - Seamless handoff - user doesn't notice the transition

4. **Agent Management**
   - Configure who receives chat notifications
   - Set availability hours
   - Route chats to specific team members
   - Track response times and satisfaction

### Setup for Human Support

1. **Configure Agents**
   - Add support team members to BYOK Chat
   - Set their availability
   - Configure notification preferences

2. **Set Escalation Rules**
   - Define when to escalate (keywords, complexity, etc.)
   - Set business hours for human support
   - Configure auto-responses when offline

3. **Integration Options**
   - **Email Notifications**: Get notified of new chats
   - **Slack Integration**: Receive chat alerts in Slack
   - **Dashboard**: Manage chats from BYOK Chat dashboard
   - **API**: Integrate with your existing support tools

### Best Practices

- **Start with AI**: Let AI handle common questions
- **Clear Escalation**: Make it easy for users to request human help
- **Quick Response**: Ensure human agents respond promptly
- **Context Preservation**: Agents see full conversation history
- **Follow-up**: AI can take over again after human resolves issue

## Current State

The chat widget is currently showing a placeholder interface with:
- A functional chat button (bottom-right corner)
- A chat window that opens/closes
- Placeholder content explaining chat is coming soon
- Fallback email support link

Once you add the `VITE_CHAT_WIDGET_URL` environment variable with the BYOK Chat script URL, the widget will automatically load the actual chat interface.

## Styling

The widget uses Disclosurely's design system:
- Primary color for the chat button and header
- Responsive design (mobile-friendly)
- Matches existing UI components (shadcn/ui)
- Proper z-index to appear above other content

## Mobile Optimization

- Chat button: Fixed position, touch-friendly size (56px)
- Chat window: Full-width on mobile (`calc(100vw - 2rem)`)
- Responsive height: Adapts to viewport
- Proper spacing to avoid overlap with other UI elements

## Troubleshooting

### Widget Not Appearing
- Check that `enabled={true}` is set
- Verify the component is imported and rendered
- Check browser console for errors

### Script Not Loading
- Verify `VITE_CHAT_WIDGET_URL` is set correctly
- Check network tab for script loading errors
- Ensure CORS is configured correctly on BYOK Chat side

### Styling Issues
- The widget uses Tailwind classes - ensure Tailwind is configured
- Check z-index conflicts with other fixed elements
- Verify primary color is set in Tailwind config

## Next Steps

1. **Get BYOK Chat Integration Details**
   - Review BYOK Chat documentation
   - Obtain the widget script URL
   - Understand any required initialization code

2. **Configure Environment Variable**
   - Add `VITE_CHAT_WIDGET_URL` to Vercel
   - Test locally with `.env` file

3. **Customize if Needed**
   - Adjust container ID if BYOK requires specific ID
   - Add initialization code if needed
   - Customize styling to match BYOK's requirements

4. **Test Thoroughly**
   - Test on marketing site
   - Test in dashboard
   - Test on mobile devices
   - Verify chat functionality works end-to-end

## Support

For questions about the chat widget implementation, refer to:
- This documentation
- BYOK Chat documentation
- The `ChatWidget.tsx` component source code

