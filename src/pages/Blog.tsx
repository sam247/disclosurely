import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import { StandardHeader } from '@/components/StandardHeader';
import DynamicHelmet from '@/components/DynamicHelmet';
import { useLanguageFromUrl } from '@/hooks/useLanguageFromUrl';
import { useTranslation } from 'react-i18next';
import { createClient } from 'contentful';
import { documentToHtml } from '@contentful/rich-text-html-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

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
  sys: { id: string; createdAt: string; updatedAt: string };
  fields: {
    title: { 'en-US': string };
    slug: { 'en-US': string };
    excerpt?: { 'en-US': string };
    content: { 'en-US': any }; // RichText type
    featuredImage?: { 'en-US': { sys: { id: string; linkType: 'Asset' } } };
    publishDate: { 'en-US': string };
    seoTitle?: { 'en-US': string };
    seoDescription?: { 'en-US': string };
    tags: { 'en-US': string[] };
    author?: { 'en-US': { sys: { id: string; linkType: 'Entry' } } };
    categories?: { 'en-US': Array<{ sys: { id: string; linkType: 'Entry' } }> };
    readingTime?: { 'en-US': number };
    status: { 'en-US': string };
  };
}

interface ContentfulAuthor {
  sys: { id: string };
  fields: {
    name: { 'en-US': string };
    email: { 'en-US': string };
  };
}

interface ContentfulCategory {
  sys: { id: string };
  fields: {
    name: { 'en-US': string };
    slug: { 'en-US': string };
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
        if (slug) {
          await fetchSinglePost(slug);
        } else {
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
        'fields.isActive': true,
        order: 'fields.name',
      });
      setCategories(response.items);
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
        'fields.status': 'published',
        'fields.publishDate[lte]': new Date().toISOString(),
        order: '-fields.publishDate',
        include: 2, // Include linked author and categories
      };

      if (selectedCategorySlug && selectedCategorySlug !== 'latest') {
        query['fields.categories.sys.contentType.sys.id'] = '1Dn01YZmIbymrxi194Q2xV'; // Category content type ID
        query['fields.categories.fields.slug'] = selectedCategorySlug;
      }

      console.log('Contentful query:', query);
      
      const response = await client.getEntries<ContentfulBlogPost>(query);
      console.log('Contentful response:', response);
      
      const fetchedPosts: BlogPostDisplay[] = response.items.map(item => {
        const authorEntry = item.fields.author?.['en-US'] as unknown as ContentfulAuthor;
        const categoryEntries = item.fields.categories?.['en-US'] as unknown as ContentfulCategory[];

        return {
          id: item.sys.id,
          title: item.fields.title['en-US'],
          slug: item.fields.slug['en-US'],
          excerpt: item.fields.excerpt?.['en-US'],
          content: item.fields.content['en-US'],
          featuredImage: (item.fields.featuredImage?.['en-US'] as any)?.fields?.file?.['en-US']?.url,
          publishDate: item.fields.publishDate['en-US'],
          seoTitle: item.fields.seoTitle?.['en-US'],
          seoDescription: item.fields.seoDescription?.['en-US'],
          tags: item.fields.tags?.['en-US'] || [],
          authorName: authorEntry?.fields?.name?.['en-US'],
          authorEmail: authorEntry?.fields?.email?.['en-US'],
          categories: categoryEntries ? categoryEntries.map(cat => ({
            name: cat.fields.name['en-US'],
            slug: cat.fields.slug['en-US'],
          })) : [],
          readingTime: item.fields.readingTime?.['en-US'],
          status: item.fields.status['en-US'],
        };
      });
      
      console.log('Transformed posts:', fetchedPosts);
      setPosts(fetchedPosts);
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
        'fields.slug': postSlug,
        'fields.status': 'published',
        include: 2, // Include linked author and categories
      });

      if (response.items.length > 0) {
        const item = response.items[0];
        const authorEntry = item.fields.author?.['en-US'] as unknown as ContentfulAuthor;
        const categoryEntries = item.fields.categories?.['en-US'] as unknown as ContentfulCategory[];

        setCurrentPost({
          id: item.sys.id,
          title: item.fields.title['en-US'],
          slug: item.fields.slug['en-US'],
          excerpt: item.fields.excerpt?.['en-US'],
          content: item.fields.content['en-US'],
          featuredImage: (item.fields.featuredImage?.['en-US'] as any)?.fields?.file?.['en-US']?.url,
          publishDate: item.fields.publishDate['en-US'],
          seoTitle: item.fields.seoTitle?.['en-US'],
          seoDescription: item.fields.seoDescription?.['en-US'],
          tags: item.fields.tags?.['en-US'] || [],
          authorName: authorEntry?.fields?.name?.['en-US'],
          authorEmail: authorEntry?.fields?.email?.['en-US'],
          categories: categoryEntries ? categoryEntries.map(cat => ({
            name: cat.fields.name['en-US'],
            slug: cat.fields.slug['en-US'],
          })) : [],
          readingTime: item.fields.readingTime?.['en-US'],
          status: item.fields.status['en-US'],
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
    return documentToHtml(richTextDocument, {
      renderNode: {
        [BLOCKS.EMBEDDED_ASSET]: (node: any) =>
          `<img src="${node.data.target.fields.file['en-US'].url}" alt="${node.data.target.fields.description?.['en-US'] || node.data.target.fields.title?.['en-US']}" />`,
        [INLINES.HYPERLINK]: (node: any, next: any) => {
          const url = node.data.uri;
          const text = next(node.content);
          return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        },
      },
    });
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Back to blog */}
            <Link 
              to="/blog" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
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
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: renderRichText(currentPost.content) }} />
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
                      to={`/blog?category=${category.fields.slug['en-US']}`}
                      className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedCategorySlug === category.fields.slug['en-US']
                          ? 'bg-muted font-medium'
                          : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {category.fields.name['en-US']}
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
                <div className="grid gap-8">
                  {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {post.featuredImage && (
                          <div className="md:w-1/3">
                            <img 
                              src={post.featuredImage} 
                              alt={post.title}
                              className="w-full h-48 md:h-full object-cover"
                            />
                          </div>
                        )}
                        <div className={`${post.featuredImage ? 'md:w-2/3' : 'w-full'} p-6`}>
                          <div className="flex items-center gap-2 mb-3">
                            {post.categories?.map((category) => (
                              <Badge key={category.slug} variant="secondary">
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                          
                          <CardTitle className="mb-3">
                            <Link 
                              to={`/blog/${post.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {post.title}
                            </Link>
                          </CardTitle>
                          
                          <CardDescription className="mb-4">
                            {post.excerpt}
                          </CardDescription>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {post.authorName && (
                                <span>By {post.authorName}</span>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDistanceToNow(new Date(post.publishDate), { addSuffix: true })}
                              </div>
                              {post.readingTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {post.readingTime} min read
                                </div>
                              )}
                            </div>
                            
                            <Link to={`/blog/${post.slug}`}>
                              <Button variant="ghost" size="sm">
                                Read More <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
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

export default Blog;