'use client';

import { Posts } from '@/features/posts';

const PostsPage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <Posts showFilters={true} />
    </div>
  );
};

export default PostsPage;
