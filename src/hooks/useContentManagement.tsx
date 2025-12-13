import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { useUserRoles } from '@/hooks/useUserRoles';

export interface PageContent {
  id: string;
  page_identifier: string;
  section_key: string;
  content: string;
  content_type: string;
  is_active: boolean;
  organization_id: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  status: string;
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  tags: string[];
  author_id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export const useContentManagement = () => {
  const [pageContents, setPageContents] = useState<PageContent[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { profile, organization } = useOrganization();
  const { toast } = useToast();
  const { isOrgAdmin } = useUserRoles();

  // Check if user has admin permissions
  const isAdmin = isOrgAdmin;

  // Fetch page content
  const fetchPageContent = async () => {
    if (!organization?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .order('page_identifier', { ascending: true })
        .order('section_key', { ascending: true });

      if (error) throw error;
      setPageContents(data || []);
    } catch (error) {
      console.error('Error fetching page content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch page content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch blog posts
  const fetchBlogPosts = async () => {
    if (!organization?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update page content
  const updatePageContent = async (id: string, content: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit content",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('page_content')
        .update({ 
          content, 
          updated_by: user?.id 
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content updated successfully",
      });

      await fetchPageContent();
      return true;
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
      return false;
    }
  };

  // Create or update page content
  const upsertPageContent = async (
    pageIdentifier: string,
    sectionKey: string,
    content: string,
    contentType: string = 'text'
  ) => {
    if (!isAdmin || !organization?.id) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit content",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({
          organization_id: organization.id,
          page_identifier: pageIdentifier,
          section_key: sectionKey,
          content,
          content_type: contentType,
          created_by: user?.id,
          updated_by: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content updated successfully",
      });

      await fetchPageContent();
      return true;
    } catch (error) {
      console.error('Error upserting content:', error);
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
      return false;
    }
  };

  // Create blog post
  const createBlogPost = async (postData: Partial<BlogPost> & { title: string; content: string }) => {
    if (!isAdmin || !organization?.id || !user?.id) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create blog posts",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: postData.title,
          slug: postData.slug || postData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          content: postData.content,
          excerpt: postData.excerpt,
          featured_image_url: postData.featured_image_url,
          status: postData.status || 'draft',
          meta_title: postData.meta_title,
          meta_description: postData.meta_description,
          tags: postData.tags || [],
          organization_id: organization.id,
          author_id: user.id,
          published_at: postData.status === 'published' ? new Date().toISOString() : null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post created successfully",
      });

      await fetchBlogPosts();
      return true;
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive",
      });
      return false;
    }
  };

  // Update blog post
  const updateBlogPost = async (id: string, postData: Partial<BlogPost>) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to update blog posts",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });

      await fetchBlogPosts();
      return true;
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete blog post
  const deleteBlogPost = async (id: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete blog posts",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });

      await fetchBlogPosts();
      return true;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get content by page and section
  const getContent = (pageIdentifier: string, sectionKey: string, defaultContent = '') => {
    const content = pageContents.find(
      c => c.page_identifier === pageIdentifier && c.section_key === sectionKey
    );
    return content?.content || defaultContent;
  };

  useEffect(() => {
    if (organization?.id) {
      fetchPageContent();
      fetchBlogPosts();
    }
  }, [organization?.id]);

  return {
    pageContents,
    blogPosts,
    loading,
    isAdmin,
    updatePageContent,
    upsertPageContent,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    getContent,
    refetch: () => {
      fetchPageContent();
      fetchBlogPosts();
    }
  };
};