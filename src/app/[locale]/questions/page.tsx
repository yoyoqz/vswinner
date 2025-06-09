'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { formatTextForReact } from '@/lib/formatText';

type Question = {
  id: string;
  title: string;
  content: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type QuestionWithUserAndCommentCount = Question & {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  _count: {
    comments: number;
  };
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionWithUserAndCommentCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/questions');
        if (response.ok) {
          const data = await response.json();
          setQuestions(data);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Questions</h1>
          <p className="text-gray-600 mt-2">
            Browse questions from the community
          </p>
        </div>
        <Link href="/questions/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
            Ask a Question
          </Button>
        </Link>
      </div>

      {questions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {questions.map((question: QuestionWithUserAndCommentCount) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-xl">{question.title}</CardTitle>
                <div className="text-sm text-gray-500 mt-1">
                  Asked by {question.user.name || question.user.email.split('@')[0]}
                </div>
              </CardHeader>
              <CardContent>
                <div className="line-clamp-3 text-gray-700" dangerouslySetInnerHTML={formatTextForReact(question.content)} />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  {question._count.comments} {question._count.comments === 1 ? 'answer' : 'answers'}
                </div>
                <Link href={`/questions/${question.id}`}>
                  <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-sm">
                    View Question
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-500">No questions available</h3>
          <p className="mt-2 text-gray-400 mb-6">Be the first to ask a question!</p>
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