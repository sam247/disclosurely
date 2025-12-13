import { useState, useEffect } from 'react';
import { createClient } from 'contentful';

// NOTE: Uses Contentful Delivery API (read-only) - independent of MCP status
const CONTENTFUL_SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const CONTENTFUL_DELIVERY_TOKEN = import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN;

const client = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_DELIVERY_TOKEN,
});

interface BlogPostDisplay {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  publishDate: string;
  authorName?: string;
  readingTime?: number;
  categories: Array<{ name: string; slug: string }>;
}

export const useLatestBlogPosts = (limit: number = 3) => {
  const [posts, setPosts] = useState<BlogPostDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await client.getEntries({
          content_type: '9oYANGj5uBRT6UHsl5LxO', // Blog Post content type ID
          'fields.status': 'published',
          order: '-fields.publishDate' as any,
          limit: limit,
          include: 2, // Include linked author and categories
        });

        const fetchedPosts: BlogPostDisplay[] = response.items.map(item => {
          const fields = item.fields as any;
          const authorEntry = fields.author as any;
          const categoryEntries = fields.categories as any[];

          return {
            id: item.sys.id,
            title: fields.title,
            slug: fields.slug,
            excerpt: fields.excerpt,
            featuredImage: fields.featuredImage?.fields?.file?.url,
            publishDate: fields.publishDate || new Date().toISOString(),
            authorName: authorEntry?.fields?.name,
            readingTime: fields.readingTime,
            categories: categoryEntries ? categoryEntries.map(cat => ({
              name: cat.fields.name || '',
              slug: cat.fields.slug || '',
            })) : [],
          };
        });

        setPosts(fetchedPosts);
      } catch (err) {
        console.error('Error fetching latest blog posts:', err);
        setError('Failed to fetch blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, [limit]);

  return { posts, loading, error };
};
