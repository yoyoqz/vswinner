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

type Question = {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
  };
};

export default function UserQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/user/questions', {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Questions</h1>
          <p className="text-gray-600 mt-2">View and manage your questions</p>
        </div>
        <div className="flex space-x-4">
          <Link href="/dashboard">
            <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/questions/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              Ask a Question
            </Button>
          </Link>
        </div>
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
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{question.title}</CardTitle>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(question.status)}`}>
                    {question.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(question.createdAt).toLocaleDateString()} • 
                  {question.status === 'APPROVED' ? (
                    <span> Visible to public</span>
                  ) : question.status === 'PENDING' ? (
                    <span> Awaiting approval</span>
                  ) : (
                    <span> Not approved</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="line-clamp-3 text-gray-700" dangerouslySetInnerHTML={formatTextForReact(question.content)} />
              </CardContent>
              <CardFooter className="flex justify-end">
                {question.status === 'APPROVED' && (
                  <Link href={`/questions/${question.id}`}>
                    <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                      View Question
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-500">No questions found</h3>
          <p className="mt-2 text-gray-400 mb-6">You haven't asked any questions yet</p>
          <Link href="/questions/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              Ask a Question
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
} 