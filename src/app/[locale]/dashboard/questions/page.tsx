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
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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
        setFilteredQuestions(data);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [isAuthenticated, router]);

  // Filter and search effect
  useEffect(() => {
    let filtered = questions;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(q => q.status.toLowerCase() === filter.toLowerCase());
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  }, [questions, filter, searchTerm]);

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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-blue-600">{questions.length}</h3>
            <p className="text-sm text-gray-600">Total Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-green-600">
              {questions.filter(q => q.status === 'APPROVED').length}
            </h3>
            <p className="text-sm text-gray-600">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-yellow-600">
              {questions.filter(q => q.status === 'PENDING').length}
            </h3>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-red-600">
              {questions.filter(q => q.status === 'REJECTED').length}
            </h3>
            <p className="text-sm text-gray-600">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search questions by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter('all')}
                className={`${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} px-4 py-2 rounded-lg transition-colors`}
              >
                All ({questions.length})
              </Button>
              <Button
                onClick={() => setFilter('approved')}
                className={`${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'} px-4 py-2 rounded-lg transition-colors`}
              >
                Approved ({questions.filter(q => q.status === 'APPROVED').length})
              </Button>
              <Button
                onClick={() => setFilter('pending')}
                className={`${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'} px-4 py-2 rounded-lg transition-colors`}
              >
                Pending ({questions.filter(q => q.status === 'PENDING').length})
              </Button>
              <Button
                onClick={() => setFilter('rejected')}
                className={`${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'} px-4 py-2 rounded-lg transition-colors`}
              >
                Rejected ({questions.filter(q => q.status === 'REJECTED').length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {filteredQuestions.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">
            Questions ({filteredQuestions.length})
            {searchTerm && <span className="text-gray-500 font-normal"> - Search results for "{searchTerm}"</span>}
          </h2>
          {filteredQuestions.map((question) => (
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
          {questions.length === 0 ? (
            <>
              <h3 className="text-xl font-medium text-gray-500">No questions found</h3>
              <p className="mt-2 text-gray-400 mb-6">You haven't asked any questions yet</p>
              <Link href="/questions/new">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                  Ask a Question
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium text-gray-500">No questions match your filters</h3>
              <p className="mt-2 text-gray-400 mb-6">
                {searchTerm 
                  ? `No questions found for "${searchTerm}"`
                  : `No ${filter} questions found`
                }
              </p>
              <div className="space-x-4">
                <Button
                  onClick={() => {
                    setFilter('all');
                    setSearchTerm('');
                  }}
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Clear Filters
                </Button>
                <Link href="/questions/new">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    Ask a Question
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 