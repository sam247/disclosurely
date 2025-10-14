import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';

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

interface Category {
  name: string;
  slug: string;
  count: number;
}

const Blog = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);

  useEffect(() => {
    if (slug) {
      fetchSinglePost();
    } else {
      fetchPosts();
      fetchCategories();
    }
  }, [slug]);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('tags')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString());

      if (error) throw error;

      // Extract all unique tags and count them
      const tagCounts: Record<string, number> = {};
      data?.forEach(post => {
        post.tags?.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const categoryList: Category[] = Object.entries(tagCounts).map(([tag, count]) => ({
        name: tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' '),
        slug: tag,
        count
      }));

      setCategories([
        { name: 'Latest', slug: 'latest', count: data?.length || 0 },
        ...categoryList.sort((a, b) => a.name.localeCompare(b.name))
      ]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
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
        .single();

      if (error) throw error;
      setCurrentPost(data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!selectedCategory || selectedCategory === 'latest') return true;
    return post.tags?.includes(selectedCategory);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Single post view
  if (slug && currentPost) {
    return (
      <>
        <div className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-4 py-16">
            {/* Back to blog */}
            <Link to="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
              ← Back to Blog
            </Link>

            {/* Post header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{currentPost.title}</h1>
              
              <div className="flex items-center gap-4 text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(currentPost.published_at), { addSuffix: true })}
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
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap">{currentPost.content}</div>
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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex gap-12">
            {/* Left Sidebar - Categories */}
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-8">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">Blog</h1>
                  <p className="text-sm text-muted-foreground">
                    Compiled notes from the Disclosurely team
                  </p>
                </div>

                <nav className="space-y-1">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      to={`/blog?category=${category.slug}`}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category.slug
                          ? 'bg-muted text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      {category.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Category Header */}
              {selectedCategory && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2 capitalize">
                    {categories.find(c => c.slug === selectedCategory)?.name || 'Latest'}
                  </h2>
                  <p className="text-muted-foreground">
                    {selectedCategory === 'latest' 
                      ? 'Our latest insights and updates'
                      : `Articles about ${categories.find(c => c.slug === selectedCategory)?.name.toLowerCase()}`
                    }
                  </p>
                </div>
              )}

              {/* Posts Grid */}
              {filteredPosts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">
                    {posts.length === 0 
                      ? "No blog posts published yet. Check back soon!"
                      : "No posts found in this category."
                    }
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredPosts.map((post) => (
                    <Link 
                      key={post.id} 
                      to={`/blog/${post.slug}`}
                      className="group"
                    >
                      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                        {post.featured_image_url && (
                          <div className="aspect-video overflow-hidden bg-muted">
                            <img
                              src={post.featured_image_url}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        
                        <CardHeader className="flex-1">
                          {post.tags.length > 0 && (
                            <Badge variant="secondary" className="w-fit text-xs mb-2">
                              {post.tags[0]}
                            </Badge>
                          )}
                          
                          <CardTitle className="text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </CardTitle>
                          
                          {post.excerpt && (
                            <CardDescription className="line-clamp-3">
                              {post.excerpt}
                            </CardDescription>
                          )}
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <time>{formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}</time>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Blog;