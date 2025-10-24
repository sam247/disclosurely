import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Clock, Share2, Twitter, Linkedin, Facebook, Copy, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import { StandardHeader } from '@/components/StandardHeader';
import DynamicHelmet from '@/components/DynamicHelmet';
import DOMPurify from 'dompurify';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';
import { useTranslation } from 'react-i18next';
import { createClient } from 'contentful';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';

// Contentful configuration
const CONTENTFUL_SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID || 'rm7hib748uv7';
const CONTENTFUL_DELIVERY_TOKEN = import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN || 'e3JfeWQKBvfCQoqi22f6F_XzWgbZPXR9JWTyuSTGcFw';

console.log('Contentful config:', { 
  spaceId: CONTENTFUL_SPACE_ID, 
  hasToken: !!CONTENTFUL_DELIVERY_TOKEN,
  tokenLength: CONTENTFUL_DELIVERY_TOKEN?.length 
});

const client = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_DELIVERY_TOKEN,
});

interface ContentfulBlogPost {
  contentTypeId: '9oYANGj5uBRT6UHsl5LxO';
  sys: { id: string; createdAt: string; updatedAt: string };
  fields: {
    title: string;
    slug: string;
    excerpt?: string;
    content: any; // RichText type
    featuredImage?: { sys: { id: string; linkType: 'Asset' } };
    publishDate: string;
    seoTitle?: string;
    seoDescription?: string;
    tags: string[];
    author?: { sys: { id: string; linkType: 'Entry' } };
    categories?: Array<{ sys: { id: string; linkType: 'Entry' } }>;
    readingTime?: number;
    status: string;
  };
}

interface ContentfulAuthor {
  contentTypeId: string;
  sys: { id: string };
  fields: {
    name: string;
    email: string;
  };
}

interface ContentfulCategory {
  contentTypeId: '1Dn01YZmIbymrxi194Q2xV';
  sys: { id: string };
  fields: {
    name: string;
    slug: string;
  };
}

interface BlogPostDisplay {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: any; // RichText object
  featuredImage?: string; // URL
  publishDate: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  authorName?: string;
  authorEmail?: string;
  categories: Array<{ name: string; slug: string }>;
  readingTime?: number;
  status: string;
}

const Blog = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Redirect if slug is undefined
  useEffect(() => {
    if (slug === 'undefined') {
      navigate('/blog', { replace: true });
    }
  }, [slug, navigate]);
  const [posts, setPosts] = useState<BlogPostDisplay[]>([]);
  const [currentPost, setCurrentPost] = useState<BlogPostDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ContentfulCategory[]>([]);
  const selectedCategorySlug = searchParams.get('category');
  const { currentLanguage } = useLanguageFromUrl();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug && slug !== 'undefined') {
          await fetchSinglePost(slug);
        } else {
          // Reset current post when going back to blog list
          setCurrentPost(null);
          await fetchPosts();
        }
        // Fetch categories separately to avoid blocking posts
        fetchCategories();
      } catch (error) {
        console.error('Error fetching blog data:', error);
        // Ensure we still show posts even if categories fail
        if (!slug) {
          await fetchPosts();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, selectedCategorySlug]);

  const fetchCategories = async () => {
    try {
      const response = await client.getEntries<ContentfulCategory>({
        content_type: '1Dn01YZmIbymrxi194Q2xV', // Category content type ID
      });
      setCategories(response.items as any);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set empty categories array instead of failing
      setCategories([]);
    }
  };

  const fetchPosts = async () => {
    try {
      console.log('Fetching blog posts from Contentful...');
      
      const query: any = {
        content_type: '9oYANGj5uBRT6UHsl5LxO', // Blog Post content type ID
        order: '-fields.publishDate',
        include: 2, // Include linked author and categories
      };

      console.log('Contentful query:', query);
      
      const response = await client.getEntries<ContentfulBlogPost>(query);
      console.log('Contentful response:', response);
      
      const fetchedPosts: BlogPostDisplay[] = response.items.map(item => {
        const authorEntry = item.fields.author as unknown as ContentfulAuthor;
        const categoryEntries = item.fields.categories as unknown as ContentfulCategory[];

        console.log('Processing blog post:', {
          id: item.sys.id,
          title: item.fields.title,
          slug: item.fields.slug,
          fields: Object.keys(item.fields),
          rawFields: item.fields,
          titleField: item.fields.title,
          slugField: item.fields.slug
        });

        return {
          id: item.sys.id,
          title: item.fields.title,
          slug: item.fields.slug,
          excerpt: item.fields.excerpt,
          content: item.fields.content,
          featuredImage: (item.fields.featuredImage as any)?.fields?.file?.url,
          publishDate: item.fields.publishDate || new Date().toISOString(),
          seoTitle: item.fields.seoTitle,
          seoDescription: item.fields.seoDescription,
          tags: item.fields.tags || [],
          authorName: authorEntry?.fields?.name,
          authorEmail: authorEntry?.fields?.email,
          categories: categoryEntries ? categoryEntries.map(cat => ({
            name: cat.fields.name || '',
            slug: cat.fields.slug || '',
          })) : [],
          readingTime: item.fields.readingTime,
          status: item.fields.status,
        };
      });
      
      // Filter by category client-side if needed
      let filteredPosts = fetchedPosts;
      if (selectedCategorySlug && selectedCategorySlug !== 'latest') {
        filteredPosts = fetchedPosts.filter(post => 
          post.categories?.some(cat => cat.slug === selectedCategorySlug)
        );
      }
      
      console.log('Transformed posts:', filteredPosts);
      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error fetching blog posts from Contentful:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack
      });
      setPosts([]);
    }
  };

  const fetchSinglePost = async (postSlug: string) => {
    try {
      const response = await client.getEntries<ContentfulBlogPost>({
        content_type: '9oYANGj5uBRT6UHsl5LxO', // Blog Post content type ID
        include: 2, // Include linked author and categories
      });
      
      // Filter by slug manually since Contentful API typing is strict
      const filtered = response.items.filter(item => 
        item.fields.slug === postSlug
      );
      
      if (filtered.length === 0) {
        setCurrentPost(null);
        return;
      }

      if (filtered.length > 0) {
        const item = filtered[0];
        const authorEntry = item.fields.author as unknown as ContentfulAuthor;
        const categoryEntries = item.fields.categories as unknown as ContentfulCategory[];

        setCurrentPost({
          id: item.sys.id,
          title: item.fields.title || '',
          slug: item.fields.slug || '',
          excerpt: item.fields.excerpt,
          content: item.fields.content,
          featuredImage: (item.fields.featuredImage as any)?.fields?.file?.url,
          publishDate: item.fields.publishDate || new Date().toISOString(),
          seoTitle: item.fields.seoTitle,
          seoDescription: item.fields.seoDescription,
          tags: item.fields.tags || [],
          authorName: authorEntry?.fields?.name,
          authorEmail: authorEntry?.fields?.email,
          categories: categoryEntries ? categoryEntries.map(cat => ({
            name: cat.fields.name || '',
            slug: cat.fields.slug || '',
          })) : [],
          readingTime: item.fields.readingTime,
          status: item.fields.status || '',
        });
      } else {
        setCurrentPost(null);
      }
    } catch (error) {
      console.error('Error fetching single blog post from Contentful:', error);
      setCurrentPost(null);
    }
  };

  const renderRichText = (richTextDocument: any) => {
    if (!richTextDocument) return null;
    
    console.log('Rendering Rich Text document:', richTextDocument);
    console.log('Document nodeType:', richTextDocument.nodeType);
    console.log('Document content length:', richTextDocument.content?.length);
    console.log('First content item:', richTextDocument.content?.[0]);
    
    try {
      const htmlString = documentToHtmlString(richTextDocument, {
        renderNode: {
          'document': (node, next) => {
            console.log('Rendering document node:', node);
            return next(node.content);
          },
          'paragraph': (node, next) => {
            console.log('Rendering paragraph node:', node);
            return `<p class="mb-4">${next(node.content)}</p>`;
          },
          'heading-1': (node, next) => `<h1 class="text-3xl font-bold mb-6">${next(node.content)}</h1>`,
          'heading-2': (node, next) => `<h2 class="text-2xl font-bold mb-4">${next(node.content)}</h2>`,
          'heading-3': (node, next) => `<h3 class="text-xl font-bold mb-3">${next(node.content)}</h3>`,
          'heading-4': (node, next) => `<h4 class="text-lg font-bold mb-2">${next(node.content)}</h4>`,
          'heading-5': (node, next) => `<h5 class="text-base font-bold mb-2">${next(node.content)}</h5>`,
          'heading-6': (node, next) => `<h6 class="text-sm font-bold mb-2">${next(node.content)}</h6>`,
          'unordered-list': (node, next) => `<ul class="list-disc list-inside mb-4">${next(node.content)}</ul>`,
          'ordered-list': (node, next) => `<ol class="list-decimal list-inside mb-4">${next(node.content)}</ol>`,
          'list-item': (node, next) => `<li class="mb-1">${next(node.content)}</li>`,
          'blockquote': (node, next) => `<blockquote class="border-l-4 border-gray-300 pl-4 italic mb-4">${next(node.content)}</blockquote>`,
          'hyperlink': (node, next) => `<a href="${node.data.uri}" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">${next(node.content)}</a>`,
        },
        renderMark: {
          'bold': (text) => `<strong>${text}</strong>`,
          'italic': (text) => `<em>${text}</em>`,
          'underline': (text) => `<u>${text}</u>`,
        },
      });
      
      console.log('Rendered HTML:', htmlString);
      return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlString) }} />;
    } catch (error) {
      console.error('Error rendering rich text:', error);
      // Fallback to plain text extraction
      const extractText = (node: any): string => {
        if (typeof node === 'string') return node;
        if (!node) return '';
        
        if (node.nodeType === 'text') {
          return node.value || '';
        }
        
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join('');
        }
        
        return '';
      };
      
      return <div className="whitespace-pre-line">{extractText(richTextDocument)}</div>;
    }
  };

  if (loading) {
    return (
      <>
        <DynamicHelmet
          pageIdentifier="blog"
          fallbackTitle={t("blog.meta.title")}
          fallbackDescription={t("blog.meta.description")}
        />
        <StandardHeader currentLanguage={currentLanguage} />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        </div>
      </>
    );
  }

  // Single post view
  if (currentPost) {
    return (
      <>
        <DynamicHelmet
          pageIdentifier="blog-post"
          fallbackTitle={currentPost.seoTitle || currentPost.title}
          fallbackDescription={currentPost.seoDescription || currentPost.excerpt}
        />
        <StandardHeader currentLanguage={currentLanguage} />
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Back to blog */}
                <Link 
                  to="/blog" 
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
                  onClick={() => console.log('Back to blog clicked')}
                >
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  Back to Blog
                </Link>

                {/* Post header */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    {currentPost.categories?.map((category) => (
                      <Badge key={category.slug} variant="secondary">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                  
                  <h1 className="text-4xl font-bold mb-4">{currentPost.title}</h1>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    {currentPost.authorName && (
                      <span>By {currentPost.authorName}</span>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(currentPost.publishDate), { addSuffix: true })}
                    </div>
                    {currentPost.readingTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {currentPost.readingTime} min read
                      </div>
                    )}
                  </div>
                  
                  {currentPost.excerpt && (
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      {currentPost.excerpt}
                    </p>
                  )}
                </div>

                {/* Featured image */}
                {currentPost.featuredImage && (
                  <div className="mb-8">
                    <img 
                      src={currentPost.featuredImage} 
                      alt={currentPost.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Post content */}
                <div className="prose prose-lg max-w-none dark:prose-invert" id="blog-content">
                  {renderRichText(currentPost.content)}
                </div>

                {/* Tags */}
                {currentPost.tags && currentPost.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t">
                    <h3 className="text-sm font-medium mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentPost.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Articles */}
                <RelatedArticles currentPost={currentPost} />
              </div>

              {/* Right Sidebar - Hidden on mobile, visible on desktop */}
              <aside className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-8 space-y-8">
                  {/* Reading Time */}
                  {currentPost.readingTime && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {currentPost.readingTime} min read
                      </div>
                    </div>
                  )}

                  {/* Table of Contents */}
                  <TableOfContents />

                  {/* Share Buttons */}
                  <ShareButtons post={currentPost} />
                </div>
              </aside>
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
      <DynamicHelmet
        pageIdentifier="blog"
        fallbackTitle={t("blog.meta.title")}
        fallbackDescription={t("blog.meta.description")}
      />
      <StandardHeader currentLanguage={currentLanguage} />
      <div className="min-h-screen bg-background">
        {/* Content with sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Sidebar - Categories */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="lg:sticky lg:top-8">
                <h2 className="text-xl font-semibold mb-2">Categories</h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Filter posts by topic
                </p>
                
                <nav className="space-y-1">
                  <Link
                    to="/blog"
                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                      !selectedCategorySlug ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    Latest
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.sys.id}
                      to={`/blog?category=${category.fields.slug}`}
                      className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedCategorySlug === category.fields.slug
                          ? 'bg-muted font-medium'
                          : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {category.fields.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {posts.length === 0 ? (
                <div className="text-center py-16">
                  <h2 className="text-2xl font-semibold mb-4">No blog posts yet</h2>
                  <p className="text-muted-foreground mb-8">
                    Check back soon for insights on compliance, whistleblowing, and industry best practices.
                  </p>
                  <Button asChild>
                    <Link to="/">Go to Homepage</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {post.featuredImage && (
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={post.featuredImage} 
                            alt={post.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          {post.categories?.map((category) => (
                            <Badge key={category.slug} variant="secondary" className="text-xs">
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                        
                        <CardTitle className="text-lg mb-3 line-clamp-2">
                          <Link 
                            to={`/blog/${post.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {post.title}
                          </Link>
                        </CardTitle>
                        
                        <CardDescription className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {post.authorName && (
                              <span>By {post.authorName}</span>
                            )}
                            {post.readingTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {post.readingTime} min read
                              </div>
                            )}
                          </div>
                          
                          <Link to={`/blog/${post.slug}`}>
                            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                              Read More <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
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

// Transform Contentful post to display format
const transformContentfulPost = (item: ContentfulBlogPost): BlogPostDisplay => {
  const authorEntry = item.fields.author as unknown as ContentfulAuthor;
  const categoryEntries = item.fields.categories as unknown as ContentfulCategory[];

  return {
    id: item.sys.id,
    title: item.fields.title,
    slug: item.fields.slug,
    excerpt: item.fields.excerpt,
    content: item.fields.content,
    featuredImage: (item.fields.featuredImage as any)?.fields?.file?.url,
    publishDate: item.fields.publishDate || new Date().toISOString(),
    seoTitle: item.fields.seoTitle,
    seoDescription: item.fields.seoDescription,
    tags: item.fields.tags || [],
    authorName: authorEntry?.fields?.name,
    authorEmail: authorEntry?.fields?.email,
    categories: categoryEntries ? categoryEntries.map(cat => ({
      name: cat.fields.name || '',
      slug: cat.fields.slug || ''
    })) : [],
    readingTime: item.fields.readingTime,
    status: item.fields.status || 'published'
  };
};

// Table of Contents Component
const TableOfContents = () => {
  const [headings, setHeadings] = useState<Array<{id: string, text: string, level: number}>>([]);

  useEffect(() => {
    const contentElement = document.getElementById('blog-content');
    if (!contentElement) return;

    const headingElements = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingsList = Array.from(headingElements).map((heading, index) => {
      const id = heading.id || `heading-${index}`;
      if (!heading.id) {
        heading.id = id;
      }
      return {
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1))
      };
    });

    setHeadings(headingsList);
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = 80; // Approximate height of fixed header
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-3">Contents</h3>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => scrollToHeading(heading.id)}
            className={`block w-full text-left text-sm hover:text-primary transition-colors ${
              heading.level === 1 ? 'font-medium' : 
              heading.level === 2 ? 'ml-2' : 
              heading.level === 3 ? 'ml-4' : 'ml-6'
            }`}
          >
            {heading.text}
          </button>
        ))}
      </nav>
    </div>
  );
};

// Share Buttons Component
const ShareButtons = ({ post }: { post: BlogPostDisplay }) => {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-3">Share this</h3>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex-1"
        >
          <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
            <Twitter className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex-1"
        >
          <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
            <Linkedin className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex-1"
        >
          <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
            <Facebook className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="flex-1"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

// Related Articles Component
const RelatedArticles = ({ currentPost }: { currentPost: BlogPostDisplay }) => {
  const [relatedPosts, setRelatedPosts] = useState<BlogPostDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        console.log('Fetching related posts for:', currentPost.title);
        console.log('Current post categories:', currentPost.categories);
        
        // Simplified query - just get recent posts, excluding current post
        const response = await client.getEntries<ContentfulBlogPost>({
          content_type: '9oYANGj5uBRT6UHsl5LxO',
          'fields.status': 'published',
          limit: 5, // Get more to filter out current post
          order: '-sys.createdAt'
        });

        console.log('Fetched posts:', response.items.length);
        
        // Filter out current post and transform
        const posts = response.items
          .filter(item => item.sys.id !== currentPost.id)
          .map(transformContentfulPost)
          .slice(0, 2); // Show only 2 related posts

        console.log('Related posts after filtering:', posts.length);
        setRelatedPosts(posts);
      } catch (error) {
        console.error('Error fetching related posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [currentPost]);

  if (loading) {
    return (
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-2xl font-semibold mb-6">Related Articles</h3>
        <div className="text-center py-8 text-muted-foreground">
          Loading related articles...
        </div>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return (
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-2xl font-semibold mb-6">Related Articles</h3>
        <div className="text-center py-8 text-muted-foreground">
          No related articles found.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <h3 className="text-2xl font-semibold mb-6">Related Articles</h3>
      <div className={`grid gap-6 ${relatedPosts.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
        {relatedPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {post.featuredImage && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                {post.categories?.map((category) => (
                  <Badge key={category.slug} variant="secondary" className="text-xs">
                    {category.name}
                  </Badge>
                ))}
              </div>
              
              <CardTitle className="text-lg mb-3 line-clamp-2">
                <Link 
                  to={`/blog/${post.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {post.title}
                </Link>
              </CardTitle>
              
              <CardDescription className="text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </CardDescription>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {post.authorName && (
                    <span>By {post.authorName}</span>
                  )}
                  {post.readingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readingTime} min read
                    </div>
                  )}
                </div>
                
                <Link to={`/blog/${post.slug}`}>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Read More <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Blog;
