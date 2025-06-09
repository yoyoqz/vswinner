'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export default function EditFVisaQuestionPage() {
  const params = useParams();
  const faqId = params.id as string;

  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin && faqId) {
      const fetchQuestion = async () => {
        try {
          const response = await fetch(`/api/visa/f-visa/questions/${faqId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch question');
          }
          const data = await response.json();
          setFormData({
            question: data.question,
            answer: data.answer,
            order: data.order,
          });
        } catch (err: any) {
          console.error('Error fetching question:', err);
          setError(err.message || 'Failed to load question');
        } finally {
          setIsLoading(false);
        }
      };

      fetchQuestion();
    }
  }, [isAuthenticated, isAdmin, faqId, setFormData, setError, setIsLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!formData.question.trim() || !formData.answer.trim()) {
        throw new Error('Question and answer are required');
      }

      const response = await fetch(`/api/visa/f-visa/questions/${faqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update question');
      }

      router.push('/admin/visa/f-visa/questions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit F Visa Question</h1>
          <Link href="/admin/visa/f-visa/questions">
            <Button variant="outline">Cancel</Button>
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

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <input
                type="text"
                id="question"
                name="question"
                value={formData.question}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the question"
              />
            </div>
            
            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                Answer
              </label>
              <textarea
                id="answer"
                name="answer"
                value={formData.answer}
                onChange={handleChange}
                required
                rows={8}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the answer (HTML formatting is supported)"
              />
              <p className="mt-1 text-sm text-gray-500">
                HTML formatting is supported for the answer.
              </p>
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
              <p className="mt-1 text-sm text-gray-500">
                Lower numbers will be displayed first.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 