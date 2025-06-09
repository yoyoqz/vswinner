'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CommentForm } from '@/components/CommentForm';
import { CommentList } from '@/components/CommentList';
import { formatTextForReact } from '@/lib/formatText';

interface Question {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const questionId = params.id as string;

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions-public/${questionId}`);
      if (response.ok) {
        const data = await response.json();
        setQuestion(data);
      } else if (response.status === 404) {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      setNotFound(true);
    }
  };

  useEffect(() => {
    const loadQuestion = async () => {
      setLoading(true);
      await fetchQuestion();
      setLoading(false);
    };

    if (questionId) {
      loadQuestion();
    }
  }, [questionId]);

  // Function to refresh question data after comment submission
  const handleCommentAdded = async () => {
    await fetchQuestion();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (notFound || !question) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h1>
          <p className="text-gray-600 mb-8">The question you're looking for doesn't exist.</p>
          <button 
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="mb-8">
        <CardHeader>
          <div className="text-sm text-gray-500 mb-2">
            Asked by {question.user.name || question.user.email.split('@')[0]} • {new Date(question.createdAt).toLocaleDateString()}
          </div>
          <CardTitle className="text-2xl">{question.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none" dangerouslySetInnerHTML={formatTextForReact(question.content)} />
        </CardContent>
      </Card>

      <div className="my-8">
        <h2 className="text-xl font-semibold mb-4">Answers ({question.comments.length})</h2>
        <CommentList comments={question.comments.map(comment => ({
          ...comment,
          createdAt: new Date(comment.createdAt)
        }))} />
      </div>

      <div className="my-8">
        <h2 className="text-xl font-semibold mb-4">Add an Answer</h2>
        <CommentForm questionId={questionId} onCommentAdded={handleCommentAdded} />
      </div>
    </div>
  );
} 