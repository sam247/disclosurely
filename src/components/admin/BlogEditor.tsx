import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Eye, Calendar, User, Upload, X, Bold, Italic, List, Link, Image as ImageIcon } from 'lucide-react';
import { useContentManagement, BlogPost } from '@/hooks/useContentManagement';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

export const BlogEditor = () => {
  const { blogPosts, createBlogPost, updateBlogPost, isAdmin } = useContentManagement();
  const { toast } = useToast();
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    meta_title: '',
    meta_description: '',
    tags: [] as string[],
  });

  // Initialize rich text editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your blog post...',
      }),
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        content: editor.getHTML()
      }));
    },
  });

  useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title,
        slug: editingPost.slug,
        excerpt: editingPost.excerpt || '',
        content: editingPost.content,
        featured_image_url: editingPost.featured_image_url || '',
        status: editingPost.status as 'draft' | 'published' | 'archived',
        meta_title: editingPost.meta_title || '',
        meta_description: editingPost.meta_description || '',
        tags: editingPost.tags || [],
      });
      if (editor) {
        editor.commands.setContent(editingPost.content);
      }
    }
  }, [editingPost, editor]);

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to manage blog posts.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, WebP, or GIF image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName);

      // Insert image into editor
      if (editor) {
        editor.chain().focus().setImage({ src: publicUrl }).run();
      }

      toast({
        title: "Image uploaded",
        description: "Image has been added to your blog post.",
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFeaturedImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, WebP, or GIF image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `featured-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        featured_image_url: publicUrl
      }));

      toast({
        title: "Featured image uploaded",
        description: "Featured image has been set for your blog post.",
      });

    } catch (error) {
      console.error('Error uploading featured image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload featured image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    const postData = {
      ...formData,
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
    };

    let success = false;
    if (editingPost) {
      success = await updateBlogPost(editingPost.id, postData);
    } else {
      success = await createBlogPost(postData);
    }

    if (success) {
      resetForm();
      setShowEditor(false);
      setEditingPost(null);
      toast({
        title: "Success",
        description: editingPost ? "Blog post updated successfully!" : "Blog post created successfully!",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image_url: '',
      status: 'draft',
      meta_title: '',
      meta_description: '',
      tags: [],
    });
    if (editor) {
      editor.commands.clearContent();
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'draft':
        return 'bg-yellow-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
          <p className="text-gray-600">Create and manage your organization's blog posts</p>
        </div>
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPost(null)}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
              </DialogTitle>
              <DialogDescription>
                {editingPost ? 'Update your blog post content and settings.' : 'Create a new blog post for your organization.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter blog post title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the blog post"
                  rows={3}
                />
              </div>

              {/* Featured Image */}
              <div className="space-y-2">
                <Label>Featured Image</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFeaturedImageUpload(file);
                    }}
                    className="hidden"
                    id="featured-image-upload"
                  />
                  <label htmlFor="featured-image-upload">
                    <Button type="button" variant="outline" disabled={uploadingImage}>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingImage ? 'Uploading...' : 'Upload Featured Image'}
                    </Button>
                  </label>
                  {formData.featured_image_url && (
                    <div className="flex items-center gap-2">
                      <img
                        src={formData.featured_image_url}
                        alt="Featured"
                        className="w-16 h-16 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, featured_image_url: '' }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Rich Text Editor */}
              <div className="space-y-2">
                <Label>Content</Label>
                <div className="border rounded-lg">
                  {/* Toolbar */}
                  <div className="border-b p-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={editor?.isActive('bold') ? 'bg-gray-200' : ''}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className={editor?.isActive('italic') ? 'bg-gray-200' : ''}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      className={editor?.isActive('bulletList') ? 'bg-gray-200' : ''}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const url = window.prompt('Enter URL:');
                        if (url) {
                          editor?.chain().focus().setLink({ href: url }).run();
                        }
                      }}
                      className={editor?.isActive('link') ? 'bg-gray-200' : ''}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                      id="content-image-upload"
                    />
                    <label htmlFor="content-image-upload">
                      <Button type="button" variant="ghost" size="sm" disabled={uploadingImage}>
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </label>
                  </div>
                  
                  {/* Editor */}
                  <div className="p-4 min-h-[300px]">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="SEO title (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Input
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="SEO description (optional)"
                  />
                </div>
              </div>

              {/* Status and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'draft' | 'published' | 'archived') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }))}
                    placeholder="compliance, security, best-practices"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditor(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Blog Posts List */}
      <div className="grid gap-4">
        {blogPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${getStatusColor(post.status)} text-white`}>
                      {post.status}
                    </Badge>
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                  {post.excerpt && (
                    <CardDescription className="line-clamp-2">
                      {post.excerpt}
                    </CardDescription>
                  )}
                </div>
                {post.featured_image_url && (
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-20 h-20 object-cover rounded-lg ml-4"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {post.published_at ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true }) : 'Not published'}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Author
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};