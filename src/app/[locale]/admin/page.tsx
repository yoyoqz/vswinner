'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  // Show loading state or redirect if not authenticated or not admin
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage content and user submissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Visa Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">Update information about F and B visas</p>
            <div className="space-y-2">
              <Link href="/admin/visa/f-visa">
                <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full">F Visa Information</Button>
              </Link>
              <Link href="/admin/visa/b-visa">
                <Button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full">B Visa Information</Button>
              </Link>
            </div>
          </CardContent>
        </Card>



        <Card>
          <CardHeader>
            <CardTitle>Pending Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">Review and approve user-submitted questions</p>
            <Link href="/admin/questions/pending">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full">Review Questions</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">Moderate user comments on questions</p>
            <Link href="/admin/comments">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full">Moderate Comments</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">Manage user accounts and permissions</p>
            <Link href="/admin/users">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full">Manage Users</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blog Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">Create, edit, and publish blog posts</p>
            <Link href="/admin/blog">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full">Manage Blog</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Video Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">Manage video content and playlists</p>
            <Link href="/admin/videos">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full">Manage Videos</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Membership Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">Create and manage membership plans</p>
            <Link href="/admin/membership">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full">Manage Plans</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">Grant, cancel, and manage user memberships</p>
            <Link href="/admin/user-memberships">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full">Manage User Memberships</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">Monitor payment transactions and revenue</p>
            <Link href="/admin/payments">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full">View Payments</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">Upload and manage downloadable files and documents</p>
            <Link href="/admin/files">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full">Manage Files</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 