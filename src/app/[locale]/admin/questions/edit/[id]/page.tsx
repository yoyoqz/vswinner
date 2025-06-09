'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { getAuthHeader } from '@/utils/storage';

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEditQuestionPage({ params }: PageProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('APPROVED');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questionId, setQuestionId] = useState<string>('');
  
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setQuestionId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
      return;
    }

    if (questionId) {
      fetchQuestion();
    }
  }, [isAuthenticated, isAdmin, router, questionId]);

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }

      const questionData = await response.json();
      setQuestion(questionData);
      setTitle(questionData.title);
      setContent(questionData.content);
      setSelectedStatus(questionData.status);
      setAdminNote(questionData.adminNote || '');
    } catch (err) {
      console.error('Error fetching question:', err);
      toast.error('Failed to load question');
      router.push('/admin/questions/all');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          status: selectedStatus,
          adminNote: adminNote.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update question');
      }

      toast.success('Question updated successfully!');
      router.push('/admin/questions/all');
    } catch (error) {
      toast.error('Failed to update question');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = 
      title !== question?.title ||
      content !== question?.content ||
      selectedStatus !== question?.status ||
      adminNote !== (question?.adminNote || '');

    if (hasChanges) {
      if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
        router.push('/admin/questions/all');
      }
    } else {
      router.push('/admin/questions/all');
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Question Not Found</h1>
          <p className="mt-2 text-gray-600">The question you're looking for doesn't exist.</p>
          <Link href="/admin/questions/all" className="mt-4 inline-block">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              Back to All Questions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Edit Question</h1>
          <p className="text-gray-600 mt-2">Modify question details and settings</p>
        </div>
        <div className="flex space-x-4">
          <Link href="/admin/questions/all">
            <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              Back to All Questions
            </Button>
          </Link>
        </div>
      </div>

      {/* Question Info */}
      <Card className="mb-6 border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Question Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created by:</span>
              <span className="ml-2">{question.user.name || question.user.email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2">{new Date(question.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Last updated:</span>
              <span className="ml-2">{new Date(question.updatedAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Comments:</span>
              <span className="ml-2">{question._count.comments}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="border border-gray-200">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-xl">Edit Question Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Question Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a clear and descriptive question title"
                required
                maxLength={200}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">{title.length}/200 characters</p>
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Question Content <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the detailed question content"
                rows={8}
                required
                maxLength={5000}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">{content.length}/5000 characters</p>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-2">
                Question Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'PENDING' | 'APPROVED' | 'REJECTED')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="APPROVED">Approved (Visible to users)</option>
                <option value="PENDING">Pending (Awaiting review)</option>
                <option value="REJECTED">Rejected (Not visible to users)</option>
              </select>
            </div>

            <div>
              <label htmlFor="adminNote" className="block text-sm font-medium mb-2">
                Admin Note (Optional)
              </label>
              <Textarea
                id="adminNote"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add an internal note about this question (only visible to admins)"
                rows={3}
                maxLength={1000}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                {adminNote.length}/1000 characters • This note is only visible to administrators
              </p>
            </div>

            {selectedStatus === 'REJECTED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-900 mb-2">⚠️ Rejecting Question</h3>
                <p className="text-sm text-red-800">
                  This question will be hidden from users. Consider adding an admin note explaining the reason for rejection.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button 
              type="button" 
              onClick={handleCancel}
              disabled={submitting}
              className="border-2 border-gray-600 text-gray-600 hover:bg-gray-50 font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || !content.trim() || submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating...' : 'Update Question'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Preview Section */}
      {(title.trim() || content.trim()) && (
        <Card className="mt-8 border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">Preview</CardTitle>
            <p className="text-sm text-gray-600">This is how your question will appear to users</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {title.trim() && (
                <div>
                  <h2 className="text-xl font-semibold">{title}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>By {question.user.name || question.user.email.split('@')[0]}</span>
                    <span>•</span>
                    <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedStatus === 'APPROVED' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedStatus === 'PENDING' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedStatus}
                    </span>
                  </div>
                </div>
              )}
              {content.trim() && (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">{content}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 