'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Edit2, Trash2, Eye, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { getAuthHeader } from '@/utils/storage';
import { formatTextForReact } from '@/lib/formatText';

type Question = {
  id: string;
  title: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  userId: string;
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  _count: {
    comments: number;
  };
};

export default function AdminAllQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
      return;
    }

    fetchQuestions();
  }, [isAuthenticated, isAdmin, router]);

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
        q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.user.name && q.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredQuestions(filtered);
  }, [questions, filter, searchTerm]);

  const fetchQuestions = async () => {
    try {
      // Fetch all questions regardless of status for admin
      const statuses = ['PENDING', 'APPROVED', 'REJECTED'];
      const allQuestions = [];

      for (const status of statuses) {
        const response = await fetch(`/api/questions?status=${status}`, {
          headers: getAuthHeader(),
        });

        if (response.ok) {
          const data = await response.json();
          allQuestions.push(...data);
        }
      }

      // Sort by creation date (newest first)
      allQuestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setQuestions(allQuestions);
      setFilteredQuestions(allQuestions);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success('Question deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete question');
      console.error(error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update question status');
      }

      const updatedQuestion = await response.json();
      setQuestions(prev => prev.map(q => 
        q.id === id ? updatedQuestion : q
      ));
      toast.success(`Question ${newStatus.toLowerCase()} successfully!`);
    } catch (error) {
      toast.error('Failed to update question status');
      console.error(error);
    }
  };

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

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">All Questions Management</h1>
          <p className="text-gray-600 mt-2">View, edit, and manage all questions in the system</p>
        </div>
        <div className="flex space-x-4">
          <Link href="/admin/questions">
            <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              Back to Questions
            </Button>
          </Link>
          <Link href="/admin/questions/create">
            <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              Create Question
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
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search questions by title, content, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
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
                  <div className="flex-1">
                    <CardTitle className="text-xl">{question.title}</CardTitle>
                    <div className="text-sm text-gray-500 mt-1">
                      By {question.user.name || question.user.email.split('@')[0]} • 
                      Created: {new Date(question.createdAt).toLocaleDateString()} •
                      Comments: {question._count.comments}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(question.status)}`}>
                      {question.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="line-clamp-3 text-gray-700 mb-4" dangerouslySetInnerHTML={formatTextForReact(question.content)} />
                
                {/* Quick Status Change */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
                  {question.status !== 'APPROVED' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(question.id, 'APPROVED')}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-lg transition-colors duration-200"
                    >
                      Approve
                    </Button>
                  )}
                  {question.status !== 'PENDING' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(question.id, 'PENDING')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded-lg transition-colors duration-200"
                    >
                      Set Pending
                    </Button>
                  )}
                  {question.status !== 'REJECTED' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(question.id, 'REJECTED')}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg transition-colors duration-200"
                    >
                      Reject
                    </Button>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  onClick={() => setViewingQuestion(question)}
                  className="flex items-center gap-1 border-2 border-gray-600 text-gray-600 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  <Eye size={16} />
                  View Details
                </Button>
                <Link href={`/admin/questions/edit/${question.id}`}>
                  <Button className="flex items-center gap-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    <Edit2 size={16} />
                    Edit
                  </Button>
                </Link>
                <Button
                  onClick={() => handleDelete(question.id)}
                  className="flex items-center gap-1 border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          {questions.length === 0 ? (
            <>
              <h3 className="text-xl font-medium text-gray-500">No questions found</h3>
              <p className="mt-2 text-gray-400 mb-6">No questions have been submitted yet</p>
              <Link href="/admin/questions/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                  Create First Question
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
              <Button
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                }}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Clear Filters
              </Button>
            </>
          )}
        </div>
      )}

      {/* Question Details Modal */}
      {viewingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{viewingQuestion.title}</h2>
                <Button
                  onClick={() => setViewingQuestion(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </Button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span>By: {viewingQuestion.user.name || viewingQuestion.user.email}</span>
                  <span>Created: {new Date(viewingQuestion.createdAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(viewingQuestion.updatedAt).toLocaleDateString()}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(viewingQuestion.status)}`}>
                    {viewingQuestion.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Comments: {viewingQuestion._count.comments}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Content:</h3>
                <div className="prose max-w-none" dangerouslySetInnerHTML={formatTextForReact(viewingQuestion.content)} />
              </div>

              {viewingQuestion.adminNote && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Admin Note:</h3>
                  <p>{viewingQuestion.adminNote}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Link href={`/admin/questions/edit/${viewingQuestion.id}`}>
                  <Button
                    onClick={() => setViewingQuestion(null)}
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Edit Question
                  </Button>
                </Link>
                <Button
                  onClick={() => setViewingQuestion(null)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 