'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { getAuthHeader } from '@/utils/storage';
import { formatTextForReact } from '@/lib/formatText';

type VideoComment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

interface VideoCommentsProps {
  videoId: string;
}

export function VideoComments({ videoId }: VideoCommentsProps) {
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/videos/${videoId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      setError('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit comment');
      }

      const newCommentData = await response.json();
      setComments([newCommentData, ...comments]);
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const getUserDisplayName = (user: { name: string | null; email: string }) => {
    return user.name || user.email.split('@')[0];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        评论 ({comments.length})
      </h3>

      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="mb-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的评论..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              maxLength={1000}
            />
            <div className="text-sm text-gray-500 mt-1">
              {newComment.length}/1000 字符
            </div>
          </div>
          
          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitting ? '发布中...' : '发布评论'}
          </Button>
        </form>
      )}

      {!user && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">请登录后发表评论</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无评论，成为第一个评论的人吧！
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {getUserDisplayName(comment.user).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {getUserDisplayName(comment.user)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div 
                className="text-gray-700 text-sm leading-relaxed"
                dangerouslySetInnerHTML={formatTextForReact(comment.content)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
} 