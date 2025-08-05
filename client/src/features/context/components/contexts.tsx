import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Edit, Trash2, Check } from 'lucide-react';
import { useGetContextsQuery, useCreateContextMutation, useUpdateContextMutation, useDeleteContextMutation } from '../services/contextApi';
import { toast } from 'sonner';
import { Context, CreateContextRequest } from '../types';
import { mockPlatforms } from '@/lib/constant';

interface ContextsProps {
  onSelectContext?: (context: Context) => void;
  selectedContextId?: number | null;
  showActions?: boolean;
}

const Contexts: React.FC<ContextsProps> = ({
  onSelectContext,
  selectedContextId,
  showActions = true
}) => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    platform_id: 0
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<Context | null>(null);

  // Form state
  const [newContext, setNewContext] = useState<CreateContextRequest>({
    title: '',
    content: '',
    type: 'text',
    platform_id: 0,
    topic: '',
    brief: '',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  // RTK Query hooks
  const { data: contexts = [], isLoading, error } = useGetContextsQuery({});
  const [createContext] = useCreateContextMutation();
  const [updateContext] = useUpdateContextMutation();
  const [deleteContext] = useDeleteContextMutation();

  // Filter contexts
  const filteredContexts = contexts.filter(context => {
    if (filters.search && !context.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type && context.type !== filters.type) {
      return false;
    }
    if (filters.platform_id && context.platform_id !== filters.platform_id) {
      return false;
    }
    return true;
  });

  // Handle form submission
  const handleCreateContext = async () => {
    try {
      await createContext(newContext).unwrap();
      setIsCreateDialogOpen(false);
      setNewContext({
        title: '',
        content: '',
        type: 'text',
        platform_id: 0,
        topic: '',
        brief: '',
        tags: []
      });
      toast.success('Context created successfully');
    } catch (error) {
      console.error('Error creating context:', error);
      toast.error('Failed to create context');
    }
  };

  const handleUpdateContext = async () => {
    if (!editingContext) return;

    try {
      await updateContext({
        id: editingContext.id,
        ...editingContext
      }).unwrap();
      setIsEditDialogOpen(false);
      setEditingContext(null);
      toast.success('Context updated successfully');
    } catch (error) {
      console.error('Error updating context:', error);
      toast.error('Failed to update context');
    }
  };

  const handleDeleteContext = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this context?')) {
      try {
        await deleteContext(id).unwrap();
        toast.success('Context deleted successfully');
      } catch (error) {
        console.error('Error deleting context:', error);
        toast.error('Failed to delete context');
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newContext.tags.includes(tagInput.trim())) {
      setNewContext({
        ...newContext,
        tags: [...newContext.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewContext({
      ...newContext,
      tags: newContext.tags.filter(tag => tag !== tagToRemove)
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading contexts...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading contexts</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        {showActions && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Context
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Context</DialogTitle>
                <DialogDescription>
                  Add a new context that can be used for content generation
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Product Launch Details"
                    value={newContext.title}
                    onChange={(e) => setNewContext({ ...newContext, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Product Launch, Company Update"
                    value={newContext.topic}
                    onChange={(e) => setNewContext({ ...newContext, topic: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newContext.type}
                      onChange={(e) => setNewContext({ ...newContext, type: e.target.value as any })}
                    >
                      <option value="text">Text</option>
                      <option value="document">Document</option>
                      <option value="youtube">YouTube</option>
                      <option value="url">URL</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <select
                      id="platform"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newContext.platform_id}
                      onChange={(e) => setNewContext({ ...newContext, platform_id: parseInt(e.target.value) || 0 })}
                    >
                      <option value="0">All Platforms</option>
                      {mockPlatforms.map(platform => (
                        <option key={platform.id} value={platform.id}>
                          {platform.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brief">Brief (Optional)</Label>
                  <Textarea
                    id="brief"
                    placeholder="Brief description of the context..."
                    value={newContext.brief}
                    onChange={(e) => setNewContext({ ...newContext, brief: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter the main content..."
                    value={newContext.content}
                    onChange={(e) => setNewContext({ ...newContext, content: e.target.value })}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newContext.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
                        >
                          <span className="sr-only">Remove</span>
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateContext}>
                  Create Context
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contexts..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-64"
          />
        </div>

        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-40"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="text">Text</option>
          <option value="document">Document</option>
          <option value="youtube">YouTube</option>
          <option value="url">URL</option>
          <option value="manual">Manual</option>
        </select>

        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-40"
          value={filters.platform_id}
          onChange={(e) => setFilters({ ...filters, platform_id: parseInt(e.target.value) || 0 })}
        >
          <option value="0">All Platforms</option>
          {mockPlatforms.map(platform => (
            <option key={platform.id} value={platform.id}>
              {platform.name}
            </option>
          ))}
        </select>

        <Button variant="outline" onClick={() => setFilters({ search: '', type: '', platform_id: 0 })}>
          <Filter className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      </div>

      {/* Contexts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContexts.map((context) => (
          <Card
            key={context.id}
            className={`cursor-pointer transition-all hover:shadow-md ${selectedContextId === context.id ? 'ring-2 ring-primary' : ''
              }`}
            onClick={() => onSelectContext?.(context)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{context.title}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {context.brief || 'No description provided'}
                  </CardDescription>
                </div>

                {selectedContextId === context.id && (
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="capitalize">
                  {context.type}
                </Badge>
                {context.platform_id && (
                  <Badge variant="outline">
                    {mockPlatforms.find(p => p.id === context.platform_id)?.name || 'Unknown Platform'}
                  </Badge>
                )}
                {context.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Date(context.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Words:</span>
                  <span>{context.content.split(/\s+/).filter(Boolean).length}</span>
                </div>
              </div>

              {showActions && (
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingContext(context);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteContext(context.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Context</DialogTitle>
            <DialogDescription>
              Update the context details
            </DialogDescription>
          </DialogHeader>

          {editingContext && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingContext.title}
                  onChange={(e) => setEditingContext({ ...editingContext, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-topic">Topic</Label>
                <Input
                  id="edit-topic"
                  value={editingContext.topic || ''}
                  onChange={(e) => setEditingContext({ ...editingContext, topic: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingContext.content}
                  onChange={(e) => setEditingContext({ ...editingContext, content: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingContext(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateContext}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contexts;
