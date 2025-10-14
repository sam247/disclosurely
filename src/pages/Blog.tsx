import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import { StandardHeader } from '@/components/StandardHeader';
import { formatMarkdownToHtml } from '@/utils/markdownFormatter';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  published_at: string;
  meta_title?: string;
  meta_description?: string;
  tags: string[];
  organization_id: string;
}

// Mock data for sample blog posts
const SAMPLE_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Understanding the EU Whistleblowing Directive',
    slug: 'understanding-eu-whistleblowing-directive',
    excerpt: 'A comprehensive guide to compliance with the EU Whistleblowing Directive and how it affects your organization.',
    featured_image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop&crop=center',
    content: `# Understanding the EU Whistleblowing Directive

The EU Whistleblowing Directive (Directive (EU) 2019/1937) represents a significant step forward in protecting individuals who report breaches of EU law.

## Key Requirements

Organizations with 50 or more employees must establish internal reporting channels that allow whistleblowers to report concerns safely and confidentially.

## Implementation Timeline

Member states were required to transpose the Directive into national law by December 17, 2021. Organizations with 50-249 employees had until December 17, 2023, to comply.

## What This Means for Your Business

Implementing a compliant whistleblowing system is not just about meeting legal requirements—it's about fostering a culture of transparency and accountability.`,
    tags: ['compliance', 'regulations'],
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    organization_id: '1',
  },
  {
    id: '2',
    title: 'Best Practices for Anonymous Reporting',
    slug: 'best-practices-anonymous-reporting',
    excerpt: 'Learn how to implement effective anonymous reporting channels while maintaining trust and security.',
    featured_image_url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop&crop=center',
    content: `# Best Practices for Anonymous Reporting

Anonymous reporting is a critical component of any effective whistleblowing system. Here's how to get it right.

## Ensure True Anonymity

Use secure, encrypted channels that don't collect IP addresses or other identifying information. Consider providing options for truly anonymous submissions.

## Build Trust

Communicate clearly about how reports are handled, who has access to them, and what protections are in place for whistleblowers.

## Respond Effectively

Even anonymous reports deserve acknowledgment and follow-up. Implement two-way messaging systems that maintain anonymity while allowing dialogue.`,
    tags: ['best-practices', 'security'],
    published_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    organization_id: '1',
  },
  {
    id: '3',
    title: 'Case Study: Implementing Secure Whistleblowing in Healthcare',
    slug: 'case-study-healthcare-whistleblowing',
    excerpt: 'How a major healthcare provider transformed their compliance program with secure digital reporting.',
    featured_image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop&crop=center',
    content: `# Case Study: Healthcare Compliance Transformation

When a 500-bed hospital network needed to modernize their whistleblowing procedures, they faced unique challenges in the healthcare sector.

## The Challenge

Healthcare organizations handle sensitive patient information while also needing robust channels for staff to report safety concerns, compliance issues, and ethical violations.

## The Solution

By implementing a secure digital reporting platform, the organization:
- Reduced response times by 60%
- Increased reporting by 200%
- Improved staff confidence in the system

## Results

Within six months, the hospital identified and resolved several critical safety issues that had previously gone unreported.`,
    tags: ['case-studies', 'healthcare'],
    published_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    organization_id: '1',
  },
  {
    id: '4',
    title: 'The Future of Workplace Transparency',
    slug: 'future-workplace-transparency',
    excerpt: 'Exploring emerging trends in organizational transparency and how technology is reshaping corporate accountability.',
    featured_image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop&crop=center',
    content: `# The Future of Workplace Transparency

As we move further into 2025, workplace transparency is no longer optional—it's expected by employees, regulators, and stakeholders alike.

## Technology-Driven Change

AI-powered analysis tools can help organizations identify patterns in reports, prioritize cases, and ensure consistent handling of concerns.

## Global Regulatory Trends

Following the EU's lead, jurisdictions worldwide are implementing similar whistleblowing protections. Organizations operating globally need unified approaches.

## Cultural Shift

The most successful organizations are those that view transparency not as a compliance burden but as a competitive advantage.`,
    tags: ['insights', 'trends'],
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    organization_id: '1',
  },
];

const CATEGORIES = [
  { name: 'Latest', slug: 'latest' },
  { name: 'Compliance', slug: 'compliance' },
  { name: 'Best Practices', slug: 'best-practices' },
  { name: 'Case Studies', slug: 'case-studies' },
  { name: 'Insights', slug: 'insights' },
  { name: 'Security', slug: 'security' },
];

const Blog = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>(SAMPLE_POSTS);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const selectedCategory = searchParams.get('category');
  const { currentLanguage } = useLanguageFromUrl();

  useEffect(() => {
    if (slug) {
      fetchSinglePost();
    } else {
      fetchPosts();
    }
  }, [slug, selectedCategory]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false });

      if (error) {
        console.log('No database posts found, using sample posts');
        setPosts(SAMPLE_POSTS);
      } else if (data && data.length > 0) {
        setPosts(data);
      } else {
        setPosts(SAMPLE_POSTS);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setPosts(SAMPLE_POSTS);
    } finally {
      setLoading(false);
    }
  };

  const fetchSinglePost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .maybeSingle();

      if (error) {
        console.log('Post not in database, checking sample posts');
        const samplePost = SAMPLE_POSTS.find(p => p.slug === slug);
        setCurrentPost(samplePost || null);
      } else if (data) {
        setCurrentPost(data);
      } else {
        const samplePost = SAMPLE_POSTS.find(p => p.slug === slug);
        setCurrentPost(samplePost || null);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      const samplePost = SAMPLE_POSTS.find(p => p.slug === slug);
      setCurrentPost(samplePost || null);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (selectedCategory && selectedCategory !== 'latest') {
      return post.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Single post view
  if (slug && currentPost) {
    return (
      <>
        <StandardHeader currentLanguage={currentLanguage} />
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 py-16">
            {/* Back to blog */}
            <Link to="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
              ← Back to Blog
            </Link>

            {/* Post header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{currentPost.title}</h1>
              
              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(currentPost.published_at).toLocaleDateString()}
                </div>
              </div>

              {currentPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentPost.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}

              {currentPost.featured_image_url && (
                <img
                  src={currentPost.featured_image_url}
                  alt={currentPost.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
            </div>

            {/* Post content */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div 
                dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(currentPost.content) }}
              />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Blog listing view
  return (
    <>
      <StandardHeader currentLanguage={currentLanguage} />
      <div className="min-h-screen bg-background">
        {/* Content with sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex gap-12">
            {/* Left Sidebar - Categories */}
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-8">
                <h2 className="text-xl font-semibold mb-2">Categories</h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Filter posts by topic
                </p>
                
                <nav className="space-y-1">
                  {CATEGORIES.map((category) => (
                    <Link
                      key={category.slug}
                      to={category.slug === 'latest' ? '/blog' : `/blog?category=${category.slug}`}
                      className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                        (category.slug === 'latest' && !selectedCategory) || selectedCategory === category.slug
                          ? 'bg-muted font-medium'
                          : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {category.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1">
              {selectedCategory && selectedCategory !== 'latest' && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold capitalize mb-2">
                    {selectedCategory.replace('-', ' ')}
                  </h2>
                  <p className="text-muted-foreground">
                    {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                  </p>
                </div>
              )}

              {/* Posts grid */}
              {filteredPosts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">
                    No posts found in this category.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                      {post.featured_image_url && (
                        <div className="aspect-video overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <CardHeader className="flex-1">
                        {post.tags.length > 0 && (
                          <div className="mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {post.tags[0]}
                            </Badge>
                          </div>
                        )}
                        
                        <CardTitle className="text-xl mb-2 line-clamp-2">
                          {post.title}
                        </CardTitle>
                        
                        {post.excerpt && (
                          <CardDescription className="line-clamp-3">
                            {post.excerpt}
                          </CardDescription>
                        )}
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                          </div>
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/blog/${post.slug}`} className="flex items-center gap-2">
                              Read More
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Blog;
