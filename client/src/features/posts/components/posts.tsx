'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useGetPostsQuery } from '../services/postApi';
import { CardsCarouselDemo } from '@/components/cards-carousel';
import { PostFilters } from '../types';
import { mockPlatforms } from '@/lib/constant';

interface PostsProps {
  showFilters?: boolean;
}

const Posts: React.FC<PostsProps> = ({ showFilters = true }) => {
  const [filters, setFilters] = useState<Partial<PostFilters>>({
    search: '',
    status: '',
    platform_id: 0,
    page: 1,
    limit: 50,
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  // RTK Query hook
  const { data: posts = [], isLoading, error, refetch } = useGetPostsQuery(filters);

  // Handle search
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  // Handle status filter
  const handleStatusChange = (status: string) => {
    setFilters(prev => ({ ...prev, status: status || undefined, page: 1 }));
  };

  // Handle platform filter
  const handlePlatformChange = (platform_id: number) => {
    setFilters(prev => ({ ...prev, platform_id: platform_id || undefined, page: 1 }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      platform_id: 0,
      page: 1,
      limit: 50,
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Posts</CardTitle>
            <CardDescription>
              There was an error loading your posts. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">All Posts</h1>
          <p className="text-muted-foreground">
            Manage and view all your generated posts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search posts..."
                    value={filters.search || ''}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={filters.status || ''}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>

              {/* Platform Filter */}
              <select
                value={filters.platform_id || 0}
                onChange={(e) => handlePlatformChange(parseInt(e.target.value))}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value={0}>All Platforms</option>
                {mockPlatforms.map(platform => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>

              <Button variant="outline" onClick={clearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        </div>
      )}

      {/* Posts Display */}
      {!isLoading && posts.length > 0 && (
        <div className="space-y-4">
          <CardsCarouselDemo posts={posts} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>No Posts Found</CardTitle>
              <CardDescription>
                {filters.search || filters.status || filters.platform_id
                  ? 'No posts match your current filters. Try adjusting your search criteria.'
                  : 'You haven\'t created any posts yet. Start by creating a campaign and generating some content!'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(filters.search || filters.status || filters.platform_id) && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Posts;
