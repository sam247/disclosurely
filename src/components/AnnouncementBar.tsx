import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnnouncementBarProps {
  title: string;
  content: string;
  onDismiss?: () => void;
  className?: string;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  title,
  content,
  onDismiss,
  className
}) => {
  // Parse content for links - simple regex to find [text](url) patterns
  const parseContent = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      
      // Add the link
      parts.push({
        type: 'link',
        content: match[1],
        url: match[2]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  const contentParts = parseContent(content);

  return (
    <div className={cn(
      "bg-blue-600 text-white px-4 py-3 relative",
      className
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 pr-4">
          {title && (
            <div className="font-semibold text-sm mb-1">
              {title}
            </div>
          )}
          <div className="text-sm leading-relaxed">
            {contentParts.map((part, index) => {
              if (part.type === 'link') {
                return (
                  <a
                    key={index}
                    href={part.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline font-medium inline-flex items-center gap-1"
                  >
                    {part.content}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                );
              }
              return <span key={index}>{part.content}</span>;
            })}
          </div>
        </div>
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-white hover:bg-blue-700 hover:text-white p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBar;
