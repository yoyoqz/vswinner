'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/utils/formatDate';
import { formatTextForReact } from '@/lib/formatText';
import { MembershipGuard } from '@/components/MembershipGuard';

interface BlogPost {
  id: string;
  title: string;
  summary: string | null;
  slug: string;
  createdAt: string;
  author: {
    name: string | null;
  };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog');
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <MembershipGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-gray-600 mt-2">Latest articles and updates</p>
        </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-600">No blog posts available yet</h3>
          <p className="mt-2 text-gray-500">Check back soon for new content!</p>
        </div>
      ) : (
        <div className="space-y-10">
          {posts.map((post) => (
            <article key={post.id} className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-6 py-5">
                <div className="flex justify-between items-center mb-2">
                  <time dateTime={post.createdAt} className="text-sm text-gray-500">
                    {formatDate(new Date(post.createdAt))}
                  </time>
                </div>
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                </Link>
                {post.summary && (
                  <div className="mt-3 text-base text-gray-600" dangerouslySetInnerHTML={formatTextForReact(post.summary)} />
                )}
                <div className="mt-4 flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    By {post.author.name || 'Admin'}
                  </span>
                  <span className="mx-2 text-gray-500">•</span>
                  <Link 
                    href={`/blog/${post.slug}`} 
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Read more
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      </div>
    </MembershipGuard>
  );
} 