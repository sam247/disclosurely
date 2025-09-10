import { useState, KeyboardEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface TagEditorProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const TagEditor = ({ tags, onTagsChange, placeholder = "Add tags...", maxTags = 10 }: TagEditorProps) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleAddClick = () => {
    addTag(inputValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 min-h-[32px] p-2 border rounded-md">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        
        <div className="flex items-center gap-1 flex-1 min-w-[120px]">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="border-0 shadow-none p-0 h-6 focus-visible:ring-0"
            disabled={tags.length >= maxTags}
          />
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={handleAddClick}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {tags.length >= maxTags && (
        <p className="text-xs text-muted-foreground">
          Maximum of {maxTags} tags allowed
        </p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add tags. Backspace to remove last tag.
      </p>
    </div>
  );
};

export default TagEditor;