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

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  publishDate: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  author?: {
    name: string;
    email: string;
  };
  categories?: Array<{
    name: string;
    slug: string;
  }>;
  readingTime?: number;
  status: string;
}

// Contentful API configuration
const CONTENTFUL_SPACE_ID = 'rm7hib748uv7';
const CONTENTFUL_ACCESS_TOKEN = 'e3JfeWQKBvfCQoqi22f6F_XzWgbZPXR9JWTyuSTGcFw'; // Content Delivery API token
const CONTENTFUL_API_URL = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/master`;

const CATEGORIES = [
  { name: 'Latest', slug: 'latest' },
  { name: 'Compliance', slug: 'compliance' },
  { name: 'Whistleblowing', slug: 'whistleblowing' },
  { name: 'Industry Insights', slug: 'industry-insights' },
];

const Blog = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const selectedCategory = searchParams.get('category');
  const { currentLanguage } = useLanguageFromUrl();
  const { t } = useTranslation();

  useEffect(() => {
    if (slug) {
      fetchSinglePost();
    } else {
      fetchPosts();
    }
  }, [slug, selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Build Contentful query
      let query = `entries?content_type=blogPost&fields.status=published&order=-fields.publishDate&include=10`;
      
      if (selectedCategory && selectedCategory !== 'latest') {
        query += `&fields.categories.sys.contentType.sys.id=category&fields.categories.fields.slug=${selectedCategory}`;
      }

      const response = await fetch(`${CONTENTFUL_API_URL}/${query}`, {
        headers: {
          'Authorization': `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Contentful API error: ${response.statusText}`);
      }

      const data = await response.json();
      const transformedPosts = transformContentfulPosts(data);
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching blog posts from Contentful:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSinglePost = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${CONTENTFUL_API_URL}/entries?content_type=blogPost&fields.slug=${slug}&include=10`, {
        headers: {
          'Authorization': `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Contentful API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const transformedPost = transformContentfulPost(data.items[0], data.includes);
        setCurrentPost(transformedPost);
      } else {
        setCurrentPost(null);
      }
    } catch (error) {
      console.error('Error fetching single post from Contentful:', error);
      setCurrentPost(null);
    } finally {
      setLoading(false);
    }
  };

  const transformContentfulPosts = (data: any): BlogPost[] => {
    if (!data.items) return [];
    
    return data.items.map((item: any) => transformContentfulPost(item, data.includes));
  };

  const transformContentfulPost = (item: any, includes: any): BlogPost => {
    const fields = item.fields;
    
    // Find author in includes
    let author = null;
    if (fields.author && includes?.Entry) {
      const authorEntry = includes.Entry.find((entry: any) => entry.sys.id === fields.author.sys.id);
      if (authorEntry) {
        author = {
          name: authorEntry.fields.name,
          email: authorEntry.fields.email,
        };
      }
    }

    // Find categories in includes
    let categories = [];
    if (fields.categories && includes?.Entry) {
      categories = fields.categories.map((cat: any) => {
        const categoryEntry = includes.Entry.find((entry: any) => entry.sys.id === cat.sys.id);
        return categoryEntry ? {
          name: categoryEntry.fields.name,
          slug: categoryEntry.fields.slug,
        } : null;
      }).filter(Boolean);
    }

    return {
      id: item.sys.id,
      title: fields.title,
      slug: fields.slug,
      excerpt: fields.excerpt,
      content: fields.content,
      featuredImage: fields.featuredImage?.fields?.file?.url,
      publishDate: fields.publishDate,
      seoTitle: fields.seoTitle,
      seoDescription: fields.seoDescription,
      tags: fields.tags || [],
      author,
      categories,
      readingTime: fields.readingTime,
      status: fields.status,
    };
  };

  const formatContentfulDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
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
                {currentPost.author && (
                  <span>By {currentPost.author.name}</span>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatContentfulDate(currentPost.publishDate)}
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
              <div dangerouslySetInnerHTML={{ __html: currentPost.content }} />
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
                              {post.author && (
                                <span>By {post.author.name}</span>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatContentfulDate(post.publishDate)}
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