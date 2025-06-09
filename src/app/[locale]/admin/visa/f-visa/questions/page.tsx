'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

type FVisaQuestion = {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function FVisaQuestionsAdminPage() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<FVisaQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchQuestions();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/visa/f-visa/questions');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data);
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      setError(err.message || 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await fetch(`/api/visa/f-visa/questions/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete question');
        }
        setQuestions(questions.filter(q => q.id !== id));
      } catch (err: any) {
        console.error('Error deleting question:', err);
        setError(err.message || 'Failed to delete question');
      }
    }
  };

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      const response = await fetch(`/api/visa/f-visa/questions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: newOrder }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      fetchQuestions(); // Refresh the list after reordering
    } catch (err: any) {
      console.error('Error updating order:', err);
      setError(err.message || 'Failed to update order');
    }
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      const updatedQuestions = [...questions];
      const currentOrder = updatedQuestions[index].order;
      const prevOrder = updatedQuestions[index - 1].order;
      
      updateOrder(updatedQuestions[index].id, prevOrder);
      updateOrder(updatedQuestions[index - 1].id, currentOrder);
    }
  };

  const moveDown = (index: number) => {
    if (index < questions.length - 1) {
      const updatedQuestions = [...questions];
      const currentOrder = updatedQuestions[index].order;
      const nextOrder = updatedQuestions[index + 1].order;
      
      updateOrder(updatedQuestions[index].id, nextOrder);
      updateOrder(updatedQuestions[index + 1].id, currentOrder);
    }
  };

  // Show loading state or redirect if not authenticated or not admin
  if (loading || isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">F Visa Questions</h1>
          <p className="text-gray-600 mt-2">
            Manage frequently asked questions for F visa
          </p>
        </div>
        <div className="flex space-x-4">
          <Link href="/visa/f-visa">
            <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              View Public Page
            </Button>
          </Link>
          <Link href="/admin/visa/f-visa/questions/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              Add New Question
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-600">No questions yet</h3>
          <p className="mt-2 text-gray-500">Add your first question to get started</p>
          <div className="mt-4">
            <Link href="/admin/visa/f-visa/questions/new">
              <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                Add Question
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id} className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">{question.question}</CardTitle>
                <div className="text-sm text-gray-500">Order: {question.order}</div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-gray-700 line-clamp-3" dangerouslySetInnerHTML={{ __html: question.answer }} />
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t border-gray-100">
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-sm disabled:border-gray-400 disabled:text-gray-400"
                  >
                    Move Up
                  </Button>
                  <Button 
                    onClick={() => moveDown(index)}
                    disabled={index === questions.length - 1}
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-sm disabled:border-gray-400 disabled:text-gray-400"
                  >
                    Move Down
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/admin/visa/f-visa/questions/edit/${question.id}`}>
                    <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    onClick={() => deleteQuestion(question.id)}
                    className="border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 