import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Copy,
  X,
  Check,
  MessageSquare,
  PenTool,
  Hash,
  MousePointerClick,
  Pencil,
  MoreVertical,
  AlertCircle
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Template,
  CreateTemplateRequest,
  TONE_OPTIONS,
  WRITING_STYLE_OPTIONS,
  HASHTAG_STRATEGY_OPTIONS,
  CTA_TYPE_OPTIONS
} from '../types';
import {
  useGetTemplatesQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation
} from '../services/templateApi';

// Mock data and constants
const mockPlatforms = [
  { id: 1, name: 'Twitter', icon: '🐦' },
  { id: 2, name: 'Facebook', icon: '📘' },
  { id: 3, name: 'Instagram', icon: '📸' },
  { id: 4, name: 'LinkedIn', icon: '💼' },
  { id: 5, name: 'All Platforms', icon: '🌐' },
];

const mockCategories = [
  { id: 1, name: 'Social Media' },
  { id: 2, name: 'Marketing' },
  { id: 3, name: 'Announcement' },
  { id: 4, name: 'Promotion' },
];





// Form Schema
const formSchema = z.object({
  platform_id: z.string().min(1, 'Platform is required'),
  category_id: z.string().optional().nullable(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  system_instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
  tone: z.string().min(1, 'Tone is required'),
  writing_style: z.string().min(1, 'Writing style is required'),
  target_audience: z.string().min(3, 'Target audience is required'),
  use_hashtags: z.boolean().default(false),
  max_hashtags: z.number().min(0).max(30).optional(),
  hashtag_strategy: z.string().optional(),
  include_cta: z.boolean().default(false),
  cta_type: z.string().optional(),
  is_public: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface TemplatesProps {
  onSelectTemplate?: (template: Template) => void;
  selectedTemplateId?: number | null;
  showActions?: boolean;
}

export default function Templates({
  onSelectTemplate,
  selectedTemplateId,
  showActions = true
}: TemplatesProps = {}) {
  // API hooks
  const { data: templates = [], isLoading, error, refetch } = useGetTemplatesQuery();
  const [createTemplate, { isLoading: isCreating }] = useCreateTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateTemplateMutation();
  const [deleteTemplate, { isLoading: isDeleting }] = useDeleteTemplateMutation();

  const [filters, setFilters] = useState({
    search: '',
    platform_id: 0,
    is_public: false,
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Form handling with react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform_id: '',
      category_id: null,
      name: '',
      description: '',
      system_instructions: '',
      tone: 'professional',
      writing_style: 'business',
      target_audience: '',
      use_hashtags: false,
      include_cta: false,
      is_public: false,
    },
  });

  // Watch form values for conditional rendering
  const useHashtags = watch('use_hashtags');
  const includeCta = watch('include_cta');
  const selectedPlatform = watch('platform_id');

  // Filtered templates based on search and filters
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch = template.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (template.description && template.description.toLowerCase().includes(filters.search.toLowerCase()));

      const matchesPlatform = filters.platform_id === 0 || template.platform_id === filters.platform_id;
      const matchesPublic = !filters.is_public || template.is_public;

      return matchesSearch && matchesPlatform && matchesPublic;
    });
  }, [templates, filters]);

  // Separate system and user templates
  const systemTemplates = useMemo(() => templates.filter(t => t.is_system), [templates]);
  const userTemplates = useMemo(() => templates.filter(t => !t.is_system), [templates]);

  // Handle form submission for create and update
  const onSubmit = async (data: FormData) => {
    try {
      const templateData: CreateTemplateRequest = {
        ...data,
        platform_id: parseInt(data.platform_id),
        category_id: data.category_id ? parseInt(data.category_id) : null,
        max_hashtags: data.max_hashtags || 5,
        use_hashtags: data.use_hashtags || false,
        include_cta: data.include_cta || false,
        is_public: data.is_public || false
      };

      if (editingTemplate) {
        // Update existing template
        await updateTemplate({
          id: editingTemplate.id,
          template: templateData
        }).unwrap();
        toast.success('Template updated successfully!');
        setIsEditDialogOpen(false);
        setEditingTemplate(null);
      } else {
        // Create new template
        await createTemplate(templateData).unwrap();
        toast.success('Template created successfully!');
        setIsCreateDialogOpen(false);
      }
      reset();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(error?.data?.message || 'Failed to save template');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      try {
        await deleteTemplate(id).unwrap();
        toast.success('Template deleted successfully!');
      } catch (error: any) {
        console.error('Error deleting template:', error);
        toast.error(error?.data?.message || 'Failed to delete template');
      }
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    reset({
      platform_id: template.platform_id.toString(),
      category_id: template.category_id?.toString() || undefined,
      name: template.name,
      description: template.description || undefined,
      system_instructions: template.system_instructions,
      tone: template.tone,
      writing_style: template.writing_style,
      target_audience: template.target_audience,
      use_hashtags: template.use_hashtags,
      max_hashtags: template.max_hashtags,
      hashtag_strategy: template.hashtag_strategy || undefined,
      include_cta: template.include_cta,
      cta_type: template.cta_type || undefined,
      is_public: template.is_public,
    });
    setIsEditDialogOpen(true);
  };

  const handleDuplicate = (template: Template) => {
    reset({
      platform_id: template.platform_id.toString(),
      category_id: template.category_id?.toString() || undefined,
      name: `${template.name} (Copy)`,
      description: template.description || undefined,
      system_instructions: template.system_instructions,
      tone: template.tone,
      writing_style: template.writing_style,
      target_audience: template.target_audience,
      use_hashtags: template.use_hashtags,
      max_hashtags: template.max_hashtags,
      hashtag_strategy: template.hashtag_strategy || undefined,
      include_cta: template.include_cta,
      cta_type: template.cta_type || undefined,
      is_public: false, // Reset to private for duplicated templates
    });
    setIsCreateDialogOpen(true);
  };

  const resetForm = () => {
    reset();
    setEditingTemplate(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Error loading templates. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Template Library</h1>
          <p className="text-muted-foreground">Create and manage your content templates</p>
        </div>
        <Dialog
          open={isCreateDialogOpen || isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <ScrollArea className="h-[70vh] pr-4">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Template Name *</Label>
                        <Controller
                          name="name"
                          control={control}
                          render={({ field }) => (
                            <Input
                              id="name"
                              placeholder="e.g., Twitter Thread Template"
                              {...field}
                            />
                          )}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="platform_id">Platform *</Label>
                        <Controller
                          name="platform_id"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a platform" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockPlatforms.map((platform) => (
                                  <SelectItem key={platform.id} value={platform.id.toString()}>
                                    <div className="flex items-center gap-2">
                                      <span>{platform.icon}</span>
                                      <span>{platform.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.platform_id && (
                          <p className="text-sm text-red-500">{errors.platform_id.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category_id">Category</Label>
                        <Controller
                          name="category_id"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ''}
                              disabled={!selectedPlatform}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockCategories.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tone">Tone *</Label>
                        <Controller
                          name="tone"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a tone" />
                              </SelectTrigger>
                              <SelectContent>
                                {TONE_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.tone && (
                          <p className="text-sm text-red-500">{errors.tone.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="writing_style">Writing Style *</Label>
                        <Controller
                          name="writing_style"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a writing style" />
                              </SelectTrigger>
                              <SelectContent>
                                {WRITING_STYLE_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.writing_style && (
                          <p className="text-sm text-red-500">{errors.writing_style.message}</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="target_audience">Target Audience *</Label>
                        <Controller
                          name="target_audience"
                          control={control}
                          render={({ field }) => (
                            <Input
                              id="target_audience"
                              placeholder="e.g., B2B professionals, teenagers, etc."
                              {...field}
                            />
                          )}
                        />
                        {errors.target_audience && (
                          <p className="text-sm text-red-500">{errors.target_audience.message}</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Controller
                          name="description"
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              id="description"
                              placeholder="A brief description of this template"
                              className="min-h-[80px]"
                              {...field}
                              value={field.value || ''}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Instructions</h3>
                      <div className="text-sm text-muted-foreground">
                        {watch('system_instructions')?.length || 0}/2000
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Controller
                        name="system_instructions"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            id="system_instructions"
                            placeholder="Enter detailed instructions for this template. You can use variables like {{topic}} that will be replaced when using the template."
                            className="min-h-[200px] font-mono text-sm"
                            {...field}
                          />
                        )}
                      />
                      {errors.system_instructions && (
                        <p className="text-sm text-red-500">{errors.system_instructions.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Advanced Options</h3>
                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="use_hashtags">Include Hashtags</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically include relevant hashtags in the generated content
                          </p>
                        </div>
                        <Controller
                          name="use_hashtags"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              id="use_hashtags"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>

                      {useHashtags && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 pt-2">
                          <div className="space-y-2">
                            <Label htmlFor="max_hashtags">Max Hashtags</Label>
                            <Controller
                              name="max_hashtags"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  id="max_hashtags"
                                  type="number"
                                  min={1}
                                  max={30}
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hashtag_strategy">Strategy</Label>
                            <Controller
                              name="hashtag_strategy"
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select strategy" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {HASHTAG_STRATEGY_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>
                      )}

                      <div className="h-px bg-border my-4" />

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="include_cta">Include Call-to-Action</Label>
                          <p className="text-sm text-muted-foreground">
                            Add a call-to-action at the end of the generated content
                          </p>
                        </div>
                        <Controller
                          name="include_cta"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              id="include_cta"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>

                      {includeCta && (
                        <div className="pl-6 pt-2">
                          <div className="space-y-2">
                            <Label htmlFor="cta_type">CTA Type</Label>
                            <Controller
                              name="cta_type"
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select CTA type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CTA_TYPE_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visibility */}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <Label htmlFor="is_public">Make this template public</Label>
                      <p className="text-sm text-muted-foreground">
                        {watch('is_public')
                          ? 'This template will be visible to all users'
                          : 'Only you can see this template'}
                      </p>
                    </div>
                    <Controller
                      name="is_public"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="is_public"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                >
                  {(isCreating || isUpdating) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          value={filters.platform_id}
          onChange={(e) => setFilters({ ...filters, platform_id: parseInt(e.target.value) })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:max-w-[200px]"
        >
          <option value={0}>All Platforms</option>
          {mockPlatforms.map(platform => (
            <option key={platform.id} value={platform.id}>
              {platform.name}
            </option>
          ))}
        </select>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="show_public"
            checked={filters.is_public}
            onChange={(e) => setFilters({ ...filters, is_public: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <Label htmlFor="show_public">Show public templates</Label>
        </div>
      </div>

      {/* System Templates */}
      {systemTemplates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">System Templates</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systemTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={() => onSelectTemplate?.(template)}
                onEdit={() => handleEdit(template)}
                onDelete={() => handleDelete(template.id)}
                onDuplicate={() => handleDuplicate(template)}
                isSystem={true}
                onSelect={() => onSelectTemplate?.(template)}
                isSelected={selectedTemplateId === template.id}
                showActions={showActions}
              />
            ))}
          </div>
        </div>
      )}

      {/* User Templates */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">My Templates</h2>
          <span className="text-sm text-muted-foreground">{userTemplates.length} templates</span>
        </div>

        {userTemplates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={() => onSelectTemplate?.(template)}
                onEdit={() => handleEdit(template)}
                onDelete={() => handleDelete(template.id)}
                onDuplicate={() => handleDuplicate(template)}
                isSystem={false}
                onSelect={() => onSelectTemplate?.(template)}
                isSelected={selectedTemplateId === template.id}
                showActions={showActions}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No templates yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Create your first template to get started. Templates help you quickly generate consistent content.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Template Card Component
const TemplateCard = ({
  template,
  onUse,
  onEdit,
  onDelete,
  onDuplicate,
  isSystem,
  onSelect,
  isSelected,
  showActions = true
}: {
  template: Template;
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isSystem: boolean;
  onSelect?: () => void;
  isSelected?: boolean;
  showActions?: boolean;
}) => {
  const platform = mockPlatforms.find(p => p.id === template.platform_id);

  return (
    <Card 
      className={`overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {platform?.icon && <span>{platform.icon}</span>}
              {template.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {platform?.name || 'All Platforms'} • {template.tone.charAt(0).toUpperCase() + template.tone.slice(1)} tone
            </p>
          </div>
          {isSystem ? (
            <Badge variant="secondary">System</Badge>
          ) : template.is_public ? (
            <Badge variant="outline">Public</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {template.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {template.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="text-xs">
            {template.writing_style}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {template.usage_count} uses
          </Badge>
        </div>
        {showActions && (
          <div className="mt-4 flex justify-between items-center">
            {isSystem ? (
              <Button size="sm" onClick={(e) => { e.stopPropagation(); onUse(); }}>
                Use Template
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                  <Copy className="h-4 w-4 mr-1" /> Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          {!isSystem && showActions && (
            <span className="text-xs text-muted-foreground">
              {new Date(template.updated_at).toLocaleDateString()}
            </span>
          )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
