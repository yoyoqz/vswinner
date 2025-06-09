'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { getAuthHeader } from '@/utils/storage';

type CommentFormProps = {
  questionId?: string;
  onCommentAdded?: () => void | Promise<void>;
};

export function CommentForm({ questionId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          content,
          questionId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit comment');
      }

      // Clear form and show success message
      setContent('');
      setSuccess(true);
      
      // Call the callback to refresh data if provided
      if (onCommentAdded) {
        await onCommentAdded();
      } else {
        // Fallback to router refresh if no callback provided
        router.refresh();
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 p-4 rounded-md border text-center">
        <p className="mb-2">You need to be logged in to comment</p>
        <Button 
          onClick={() => router.push('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Log in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Your answer has been submitted successfully!
        </div>
      )}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          Your Answer
        </label>
        <textarea
          id="comment"
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add your answer here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Answer'}
      </Button>
    </form>
  );
} 