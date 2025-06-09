'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { getAuthHeader } from '@/utils/storage';
import { formatTextForReact } from '@/lib/formatText';

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  questionId: string | null;
  question?: {
    title: string;
  };
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
      return;
    }

    const fetchComments = async () => {
      try {
        const response = await fetch('/api/admin/comments', {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }

        const data = await response.json();
        setComments(data);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [isAuthenticated, isAdmin, router]);

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Remove the comment from the list
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Moderate Comments</h1>
        <p className="text-gray-600 mt-2">Review and manage user comments</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader>
                <div className="text-sm text-gray-500 mb-1">
                  By {comment.user.name || comment.user.email.split('@')[0]} • {new Date(comment.createdAt).toLocaleDateString()}
                </div>
                <CardTitle className="text-lg">
                  {comment.questionId && comment.question ? (
                    <span>Comment on Question: {comment.question.title}</span>
                  ) : (
                    <span>Comment</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div dangerouslySetInnerHTML={formatTextForReact(comment.content)} />
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleDelete(comment.id)}
                >
                  Delete
                </Button>
                {comment.questionId ? (
                  <Button onClick={() => router.push(`/questions/${comment.questionId}`)}>
                    View Question
                  </Button>
                ) : null}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-500">No comments available</h3>
          <p className="mt-2 text-gray-400">There are no comments to moderate</p>
        </div>
      )}
    </div>
  );
} 