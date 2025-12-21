import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, FileText, Clock, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DeepSeekContentGenerator, createContentfulBlogPost } from '@/utils/deepseekContentGenerator';
import { log, LogContext } from '@/utils/logger';

interface Author {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface BlogPostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  readingTime: number;
}

export function AIContentGenerator() {
  const [topic, setTopic] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<BlogPostData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Mock data - in real implementation, fetch from Contentful
  const authors: Author[] = [
    { id: '5gz83P25yjQSPFnVG5Dlgy', name: 'Sarah Johnson' },
    { id: '5RQyPRZm3sQi8J7FYW1uVZ', name: 'Michael Chen' }
  ];

  const categories: Category[] = [
    { id: '21ROO2RRzFHhcmi1Cpl76l', name: 'Compliance' },
    { id: '32QpG3pEkmhtVnKB5xgEcM', name: 'Whistleblowing' },
    { id: '2CawJDdwt48P42VOTjcrn4', name: 'Industry Insights' }
  ];

  const handleGenerate = async () => {
    if (!topic.trim() || !selectedAuthor || !selectedCategory) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before generating content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // In production, get API key from environment variables
      const apiKey = process.env.REACT_APP_DEEPSEEK_API_KEY || 'your-deepseek-api-key';
      const generator = new DeepSeekContentGenerator(apiKey);
      
      const blogData = await generator.generateBlogPost(topic, selectedAuthor, selectedCategory);
      setGeneratedPost(blogData);
      
      toast({
        title: "Content Generated!",
        description: "AI has created your blog post. Review and create the entry.",
      });
    } catch (error) {
      log.error(LogContext.AI_ANALYSIS, 'Error generating AI content', error instanceof Error ? error : new Error(String(error)), { topic, category });
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateEntry = async () => {
    if (!generatedPost) return;

    setIsCreating(true);
    try {
      // Here you would use the Contentful MCP tools to create the entry
      // For now, we'll simulate the process
      const entryData = createContentfulBlogPost(generatedPost, selectedAuthor, selectedCategory);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Blog Post Created!",
        description: "Your AI-generated blog post has been created in Contentful.",
      });
      
      // Reset form
      setTopic('');
      setSelectedAuthor('');
      setSelectedCategory('');
      setGeneratedPost(null);
    } catch (error) {
      log.error(LogContext.AI_ANALYSIS, 'Error creating Contentful entry', error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Creation Failed",
        description: "Failed to create blog post entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Content Generator
          </CardTitle>
          <CardDescription>
            Generate high-quality blog posts using DeepSeek AI and automatically create Contentful entries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Blog Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., GDPR Compliance Best Practices"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !topic.trim() || !selectedAuthor || !selectedCategory}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Blog Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedPost && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Generated Content
            </CardTitle>
            <CardDescription>
              Review the AI-generated content before creating the blog post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={generatedPost.title} readOnly />
            </div>
            
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={generatedPost.slug} readOnly />
            </div>
            
            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea value={generatedPost.excerpt} readOnly rows={3} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input value={generatedPost.seoTitle} readOnly />
              </div>
              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Textarea value={generatedPost.seoDescription} readOnly rows={2} />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{generatedPost.readingTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <div className="flex gap-1">
                  {generatedPost.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Content Preview</Label>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto bg-gray-50">
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generatedPost.content) }} />
              </div>
            </div>
            
            <Button 
              onClick={handleCreateEntry} 
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Entry...
                </>
              ) : (
                'Create Blog Post in Contentful'
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
