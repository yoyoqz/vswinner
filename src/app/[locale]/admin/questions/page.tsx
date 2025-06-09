'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export default function AdminQuestionsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Questions Management</h1>
          <p className="text-gray-600 mt-2">Manage all user questions and create new ones</p>
        </div>
        <div className="flex space-x-4">
          <Link href="/admin">
            <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              Back to Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>All Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">View and manage all questions</p>
            <Link href="/admin/questions/all">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full">
                Manage All Questions
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">Review and approve questions</p>
            <Link href="/admin/questions/pending">
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full">
                Review Pending
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Question</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">Create new questions directly</p>
            <Link href="/admin/questions/create">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full">
                Create New Question
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 