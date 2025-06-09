'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { getAuthHeader } from '@/utils/storage';
import { formatTextForReact } from '@/lib/formatText';

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  questionId: string | null;
  question?: {
    title: string;
  };
};

export default function UserCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchComments = async () => {
      try {
        const response = await fetch('/api/user/comments', {
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
  }, [isAuthenticated, router]);

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

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Comments</h1>
          <p className="text-gray-600 mt-2">View and manage your comments</p>
        </div>
        <Link href="/dashboard">
          <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
            Back to Dashboard
          </Button>
        </Link>
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
                <CardTitle className="text-lg">
                  {comment.questionId && comment.question ? (
                    <span>Comment on Question: {comment.question.title}</span>
                  ) : (
                    <span>Comment</span>
                  )}
                </CardTitle>
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </div>
              </CardHeader>
              <CardContent>
                <div dangerouslySetInnerHTML={formatTextForReact(comment.content)} />
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  onClick={() => handleDelete(comment.id)}
                  className="border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Delete
                </Button>
                {comment.questionId ? (
                  <Link href={`/questions/${comment.questionId}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                      View Question
                    </Button>
                  </Link>
                ) : null}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-500">No comments found</h3>
          <p className="mt-2 text-gray-400">You haven't made any comments yet</p>
        </div>
      )}
    </div>
  );
} 