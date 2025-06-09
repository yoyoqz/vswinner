'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface MembershipGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function MembershipGuard({ children, fallback }: MembershipGuardProps) {
  const { isAuthenticated, isMember, loading, userMemberships } = useAuth();
  const router = useRouter();

  // Show loading state while checking authentication and membership
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  // If authenticated but not a member, show membership required message
  if (!isMember) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full bg-white/80 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-white">🔒</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Membership Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                This premium content is exclusively available to our members.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">✨ With membership, you get access to:</h3>
                <ul className="text-left space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Detailed F-1 & B-1/B-2 Visa guides
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Exclusive blog posts and insights
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Video tutorials and walkthroughs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Downloadable templates and forms
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Priority support and assistance
                  </li>
                </ul>
              </div>

              {/* Show current membership status if any */}
              {userMemberships.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Your Membership Status:</h4>
                  <div className="space-y-2">
                    {userMemberships.map((membership) => (
                      <div key={membership.id} className="text-sm">
                        <span className="font-medium">{membership.membership.name}</span>
                        <span className="text-yellow-700 block">
                          {new Date(membership.endDate) > new Date() 
                            ? `Expires: ${new Date(membership.endDate).toLocaleDateString()}`
                            : 'Expired'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/membership">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                  🚀 Upgrade to Premium
                </Button>
              </Link>
              <Button 
                onClick={() => router.back()}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                ← Go Back
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              Questions? <Link href="/questions" className="text-blue-600 hover:underline">Contact our support team</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is a member, render the protected content
  return <>{children}</>;
} 