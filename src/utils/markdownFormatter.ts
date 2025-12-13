
// Utility to convert markdown-style formatting to HTML
export const formatMarkdownToHtml = (text: string): string => {
  if (!text) return '';

  return text
    // Handle bold text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Handle headers
    .replace(/^### (.+)$/gm, '<h3 style="font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem 0;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size: 1.5rem; font-weight: 600; margin: 1.5rem 0 0.5rem 0;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size: 1.75rem; font-weight: 600; margin: 1.5rem 0 0.5rem 0;">$1</h1>')
    // Handle bullet points
    .replace(/^- (.+)$/gm, '<li style="margin: 0.25rem 0;">$1</li>')
    // Wrap consecutive list items
    .replace(/(<li[^>]*>.*<\/li>\s*)+/gs, '<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">$&</ul>')
    // Handle line breaks
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
};
