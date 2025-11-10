import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Save, X, Plus } from 'lucide-react';
import { useContentManagement, PageContent } from '@/hooks/useContentManagement';

interface AdminContentEditorProps {
  pageIdentifier: string;
  title: string;
  description?: string;
}

export const AdminContentEditor = ({ pageIdentifier, title, description }: AdminContentEditorProps) => {
  const { pageContents, updatePageContent, upsertPageContent, isAdmin } = useContentManagement();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [newSectionKey, setNewSectionKey] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to edit content.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const pageContent = pageContents.filter(c => c.page_identifier === pageIdentifier);

  const handleEdit = (content: PageContent) => {
    setEditingId(content.id);
    setEditValue(content.content);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingId) {
        const success = await updatePageContent(editingId, editValue);
        if (success) {
          setEditingId(null);
          setEditValue('');
        }
      } else if (newSectionKey && newContent) {
        const success = await upsertPageContent(pageIdentifier, newSectionKey, newContent);
        if (success) {
          setNewSectionKey('');
          setNewContent('');
          setShowAddNew(false);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleAddNew = async () => {
    if (newSectionKey && newContent) {
      const success = await upsertPageContent(pageIdentifier, newSectionKey, newContent);
      if (success) {
        setShowAddNew(false);
        setNewSectionKey('');
        setNewContent('');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Button
            onClick={() => setShowAddNew(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pageContent.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No content sections found for this page. Add a new section to get started.
          </p>
        )}

        {pageContent.map((content) => (
          <div key={content.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{content.section_key}</Badge>
                <Badge variant="secondary" className="text-xs">
                  {content.content_type}
                </Badge>
              </div>
              {editingId !== content.id && (
                <Button
                  onClick={() => handleEdit(content)}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
              )}
            </div>

            {editingId === content.id ? (
              <div className="space-y-2">
                {content.content_type === 'text' ? (
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                ) : (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full"
                  />
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    size="sm" 
                    className="flex items-center gap-1"
                    loading={isSaving}
                    loadingText="Saving..."
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} size="sm" variant="outline" className="flex items-center gap-1">
                    <X className="h-3 w-3" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">{content.content}</p>
              </div>
            )}
          </div>
        ))}

        {showAddNew && (
          <>
            <Separator />
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">Add New Section</h4>
              <div className="space-y-2">
                <Input
                  placeholder="Section key (e.g., title, subtitle, description)"
                  value={newSectionKey}
                  onChange={(e) => setNewSectionKey(e.target.value)}
                />
                <Textarea
                  placeholder="Content"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddNew} 
                    size="sm"
                    disabled={!newSectionKey || !newContent}
                  >
                    Add Section
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowAddNew(false);
                      setNewSectionKey('');
                      setNewContent('');
                    }} 
                    size="sm" 
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};