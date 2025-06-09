'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatDate } from '@/utils/formatDate';
import { formatTextForReact } from '@/lib/formatText';

interface BlogPost {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  slug: string;
  createdAt: string;
  author: {
    name: string | null;
  };
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const slug = params.slug as string;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setPost(data);
        } else if (response.status === 404) {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog" className="text-blue-600 hover:text-blue-800 font-medium">
            &larr; Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-4">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Blog
        </Link>
      </div>

      <article className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          <div className="flex items-center text-gray-600 mb-8">
            <span>By {post.author.name || 'Admin'}</span>
            <span className="mx-2">•</span>
            <time dateTime={post.createdAt}>
              {formatDate(new Date(post.createdAt))}
            </time>
          </div>

          <div className="prose max-w-none" dangerouslySetInnerHTML={formatTextForReact(post.content)} />
        </div>
      </article>
    </div>
  );
} 