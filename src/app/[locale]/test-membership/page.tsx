'use client';

import { useAuth } from '@/context/AuthContext';
import { MembershipGuard } from '@/components/MembershipGuard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function TestMembershipPage() {
  const { user, isAuthenticated, isMember, userMemberships, checkMembershipStatus } = useAuth();

  const handleRefreshMembership = () => {
    checkMembershipStatus();
  };

  return (
    <MembershipGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-600">🎉 Membership Test Page</h1>
          <p className="text-gray-600 mt-2">
            If you can see this page, the membership protection system is working correctly!
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Is Member:</strong> {isMember ? '✅ Yes' : '❌ No'}</p>
                <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Membership Details</CardTitle>
            </CardHeader>
            <CardContent>
              {userMemberships.length > 0 ? (
                <div className="space-y-4">
                  {userMemberships.map((membership) => (
                    <div key={membership.id} className="border rounded-lg p-4 bg-green-50">
                      <h3 className="font-semibold text-green-800">{membership.membership.name}</h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><strong>Status:</strong> {membership.status}</p>
                        <p><strong>Start Date:</strong> {new Date(membership.startDate).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> {new Date(membership.endDate).toLocaleDateString()}</p>
                        <p><strong>Active:</strong> {new Date(membership.endDate) > new Date() ? '✅ Yes' : '❌ Expired'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No active memberships found.</p>
              )}
              
              <div className="mt-4">
                <Button 
                  onClick={handleRefreshMembership}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Refresh Membership Status
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Protected Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
                <h3 className="text-xl font-bold text-purple-800 mb-3">🔒 Premium Content</h3>
                <p className="text-purple-700 mb-4">
                  This is an example of premium content that only members can access. 
                  Since you're seeing this, your membership is active and working correctly!
                </p>
                <div className="space-y-2 text-sm text-purple-600">
                  <p>✨ Exclusive visa processing tips</p>
                  <p>📋 Premium document templates</p>
                  <p>🎥 Member-only video tutorials</p>
                  <p>💬 Priority support access</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-green-600">✅ Authentication system: Working</p>
                <p className="text-green-600">✅ Membership verification: Working</p>
                <p className="text-green-600">✅ Protected route access: Working</p>
                <p className="text-green-600">✅ User data loading: Working</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MembershipGuard>
  );
} 