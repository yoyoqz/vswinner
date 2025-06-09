'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { getAuthHeader } from '@/utils/storage';
import { formatTextForReact } from '@/lib/formatText';

type Question = {
  id: string;
  title: string;
  content: string;
  status: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export default function PendingQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
      return;
    }

    const fetchPendingQuestions = async () => {
      try {
        const response = await fetch('/api/admin/questions/pending', {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pending questions');
        }

        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        console.error('Error fetching pending questions:', err);
        setError('Failed to load pending questions');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingQuestions();
  }, [isAuthenticated, isAdmin, router]);

  const handleApprove = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}/approve`, {
        method: 'PATCH',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Failed to approve question');
      }

      // Remove the question from the list
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      console.error('Error approving question:', err);
      setError('Failed to approve question');
    }
  };

  const handleReject = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Failed to reject question');
      }

      // Remove the question from the list
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      console.error('Error rejecting question:', err);
      setError('Failed to reject question');
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
        <h1 className="text-3xl font-bold">Pending Questions</h1>
        <p className="text-gray-600 mt-2">Review and approve user-submitted questions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {questions.length > 0 ? (
        <div className="space-y-6">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-xl">{question.title}</CardTitle>
                <div className="text-sm text-gray-500">
                  By {question.user.name || question.user.email.split('@')[0]} • {new Date(question.createdAt).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <div dangerouslySetInnerHTML={formatTextForReact(question.content)} />
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleReject(question.id)}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(question.id)}
                >
                  Approve
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-500">No pending questions</h3>
          <p className="mt-2 text-gray-400">All questions have been reviewed</p>
        </div>
      )}
    </div>
  );
} 