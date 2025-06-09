'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { getAuthHeader } from '@/utils/storage';
import { formatTextForReact } from '@/lib/formatText';

type UserQuestion = {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
};

type UserComment = {
  id: string;
  content: string;
  createdAt: string;
  questionId: string | null;
  question?: {
    title: string;
  };
};

export default function DashboardPage() {
  const [questions, setQuestions] = useState<UserQuestion[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      console.error('Error isAuthenticated:');
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        // Fetch user questions
        const questionsResponse = await fetch('/api/user/questions', {
          headers: getAuthHeader(),
        });

        if (!questionsResponse.ok) {
          throw new Error('Failed to fetch questions');
        }

        const questionsData = await questionsResponse.json();
        setQuestions(questionsData);

        // Fetch user comments
        const commentsResponse = await fetch('/api/user/comments', {
          headers: getAuthHeader(),
        });

        if (!commentsResponse.ok) {
          throw new Error('Failed to fetch comments');
        }

        const commentsData = await commentsResponse.json();
        setComments(commentsData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your profile and view your activity</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user?.name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">{user?.role}</p>
              </div>
              <div className="pt-2">
                <Link href="/dashboard/profile">
                  <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-sm">
                    Edit Profile
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="ml-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-sm">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length > 0 ? (
              <div className="space-y-4">
                {questions.slice(0, 5).map((question) => (
                  <div key={question.id} className="border-b pb-2 last:border-0">
                    <Link href={`/questions/${question.id}`} className="hover:underline">
                      <p className="font-medium">{question.title}</p>
                    </Link>
                    <div className="flex justify-between items-center mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        question.status === 'APPROVED' 
                          ? 'bg-green-100 text-green-800' 
                          : question.status === 'PENDING' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {question.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You haven't asked any questions yet.</p>
            )}
            <div className="mt-4">
              <Link href="/questions/new">
                <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-sm">
                  Ask a Question
                </Button>
              </Link>
              {questions.length > 5 && (
                <Link href="/dashboard/questions" className="ml-2">
                  <Button className="text-blue-600 hover:text-blue-700 underline font-semibold py-1 px-3 transition-colors duration-200 text-sm">
                    View All
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.slice(0, 5).map((comment) => (
                  <div key={comment.id} className="border-b pb-2 last:border-0">
                    <div className="text-sm line-clamp-2" dangerouslySetInnerHTML={formatTextForReact(comment.content)} />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {comment.questionId && comment.question 
                          ? `On Question: ${comment.question.title.substring(0, 20)}...` 
                          : 'Comment'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You haven't made any comments yet.</p>
            )}
            {comments.length > 5 && (
              <div className="mt-4">
                <Link href="/dashboard/comments">
                  <Button className="text-blue-600 hover:text-blue-700 underline font-semibold py-1 px-3 transition-colors duration-200 text-sm">
                    View All
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 