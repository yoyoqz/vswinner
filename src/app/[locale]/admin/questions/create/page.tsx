'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { getAuthHeader } from '@/utils/storage';

export default function AdminCreateQuestionPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('APPROVED');
  const [submitting, setSubmitting] = useState(false);
  
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  if (!isAuthenticated || !isAdmin) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          status: selectedStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create question');
      }

      const newQuestion = await response.json();
      toast.success('Question created successfully!');
      
      // Redirect to all questions page
      router.push('/admin/questions/all');
    } catch (error) {
      toast.error('Failed to create question');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
        router.push('/admin/questions');
      }
    } else {
      router.push('/admin/questions');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create New Question</h1>
          <p className="text-gray-600 mt-2">Create a new question in the system</p>
        </div>
        <div className="flex space-x-4">
          <Link href="/admin/questions">
            <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              Back to Questions
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border border-gray-200">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-xl">Question Details</CardTitle>
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
                placeholder="Enter the detailed question content. You can include relevant information, context, and any specific details that would help provide a comprehensive answer."
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
                <option value="APPROVED">Approved (Immediately visible to users)</option>
                <option value="PENDING">Pending (Requires review)</option>
                <option value="REJECTED">Rejected (Not visible to users)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Choose the initial status for this question. Approved questions will be immediately visible to users.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">📝 Tips for Creating Good Questions:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use clear, descriptive titles that summarize the question</li>
                <li>• Provide enough context and details in the content</li>
                <li>• Consider what information would be most helpful to users</li>
                <li>• Use proper grammar and formatting for better readability</li>
                <li>• Make sure the question is relevant to your users' needs</li>
              </ul>
            </div>
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
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Question'}
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
                    <span>By Admin</span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString()}</span>
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