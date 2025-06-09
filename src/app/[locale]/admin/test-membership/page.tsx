'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Membership {
  id: string;
  name: string;
  duration: number;
}

export default function AdminTestMembershipPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchData();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Fetch users
      const usersResponse = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Fetch memberships
      const membershipsResponse = await fetch('/api/membership');
      if (membershipsResponse.ok) {
        const membershipsData = await membershipsResponse.json();
        setMemberships(membershipsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const grantMembership = async (userId: string, membershipId: string) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/admin/grant-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          membershipId
        })
      });

      if (response.ok) {
        setMessage('✅ Membership granted successfully!');
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error granting membership:', error);
      setMessage('❌ Error granting membership');
    } finally {
      setProcessing(false);
    }
  };

  const seedMemberships = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/admin/membership/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'seed' })
      });

      if (response.ok) {
        setMessage('✅ Membership plans seeded successfully!');
        await fetchData(); // Refresh data
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error seeding memberships:', error);
      setMessage('❌ Error seeding memberships');
    } finally {
      setProcessing(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
            <p className="text-gray-600 mt-2">This page is only accessible to administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin: Test Membership Management</h1>
        <p className="text-gray-600 mt-2">Grant memberships to users for testing purposes</p>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-blue-800">{message}</p>
        </div>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Initialize Membership Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If no membership plans exist, click here to create the default plans.
            </p>
            <Button 
              onClick={seedMemberships}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {processing ? 'Seeding...' : 'Seed Membership Plans'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Membership Plans</CardTitle>
          </CardHeader>
          <CardContent>
            {memberships.length > 0 ? (
              <div className="grid gap-4">
                {memberships.map((membership) => (
                  <div key={membership.id} className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold">{membership.name}</h3>
                    <p className="text-sm text-gray-600">Duration: {membership.duration} days</p>
                    <p className="text-xs text-gray-500">ID: {membership.id}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No membership plans found. Please seed the plans first.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grant Membership to Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length > 0 && memberships.length > 0 ? (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{user.email}</h3>
                        <p className="text-sm text-gray-600">
                          Name: {user.name || 'N/A'} | Role: {user.role}
                        </p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {memberships.map((membership) => (
                          <Button
                            key={membership.id}
                            onClick={() => grantMembership(user.id, membership.id)}
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors duration-200"
                          >
                            Grant {membership.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                {users.length === 0 ? 'No users found.' : 'No membership plans available.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 