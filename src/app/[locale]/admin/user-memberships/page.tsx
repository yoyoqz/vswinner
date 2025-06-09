'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getAIUsageLimit } from '@/lib/aiSuggestions';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  aiSuggestionsUsed: number;
  aiSuggestionsResetDate: string | null;
  userMemberships: UserMembership[];
}

interface UserMembership {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  membership: {
    name: string;
    duration: number;
  };
}

interface Membership {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  active: boolean;
}

export default function AdminUserMembershipsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'members' | 'non-members'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiModalData, setAiModalData] = useState<{userId: string, currentUsage: number, action: 'set' | 'add'} | null>(null);
  const [aiInputValue, setAiInputValue] = useState('');

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchData();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Fetch users with membership info
      const usersResponse = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Fetch available membership plans
      const membershipsResponse = await fetch('/api/membership');
      if (membershipsResponse.ok) {
        const membershipsData = await membershipsResponse.json();
        setMemberships(membershipsData.filter((m: Membership) => m.active));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('❌ Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const grantMembership = async (userId: string, membershipId: string) => {
    const processingKey = `grant-${userId}-${membershipId}`;
    setProcessing(processingKey);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/admin/grant-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, membershipId })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        await fetchData(); // Refresh data
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error granting membership:', error);
      setMessage('❌ Error granting membership');
    } finally {
      setProcessing(null);
    }
  };

  const cancelMembership = async (userMembershipId: string) => {
    const processingKey = `cancel-${userMembershipId}`;
    setProcessing(processingKey);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/admin/cancel-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userMembershipId })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        await fetchData(); // Refresh data
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error cancelling membership:', error);
      setMessage('❌ Error cancelling membership');
    } finally {
      setProcessing(null);
    }
  };

  const extendMembership = async (userMembershipId: string, days: number) => {
    const processingKey = `extend-${userMembershipId}`;
    setProcessing(processingKey);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/admin/extend-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userMembershipId, days })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        await fetchData(); // Refresh data
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error extending membership:', error);
      setMessage('❌ Error extending membership');
    } finally {
      setProcessing(null);
    }
  };

  const manageAIUsage = async (userId: string, action: 'reset' | 'set' | 'add', value?: number) => {
    const processingKey = `ai-${action}-${userId}`;
    setProcessing(processingKey);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/admin/ai-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, action, value })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        await fetchData(); // Refresh data
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error managing AI usage:', error);
      setMessage('❌ Error managing AI usage');
    } finally {
      setProcessing(null);
    }
  };

  const openAIModal = (userId: string, currentUsage: number, action: 'set' | 'add') => {
    setAiModalData({ userId, currentUsage, action });
    setAiInputValue('');
    setShowAIModal(true);
  };

  const handleAIModalSubmit = () => {
    if (!aiModalData) return;
    
    const value = Number(aiInputValue);
    if (isNaN(value)) {
      setMessage('❌ 请输入有效数字');
      return;
    }

    manageAIUsage(aiModalData.userId, aiModalData.action, value);
    setShowAIModal(false);
    setAiModalData(null);
    setAiInputValue('');
  };

  // Filter users based on filter and search term
  const filteredUsers = users.filter(user => {
    const hasActiveMembership = user.userMemberships.some(membership => 
      membership.status === 'ACTIVE' && new Date(membership.endDate) > new Date()
    );
    
    const matchesFilter = filter === 'all' || 
      (filter === 'members' && hasActiveMembership) ||
      (filter === 'non-members' && !hasActiveMembership);
    
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading user memberships...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Membership Management</h1>
        <p className="text-gray-600 mt-2">Grant, cancel, and manage user memberships</p>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-blue-800">{message}</p>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by email or name..."
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
                All Users ({users.length})
              </Button>
              <Button
                onClick={() => setFilter('members')}
                className={`${filter === 'members' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'} px-4 py-2 rounded-lg transition-colors`}
              >
                Members ({users.filter(u => u.userMemberships.some(m => m.status === 'ACTIVE' && new Date(m.endDate) > new Date())).length})
              </Button>
              <Button
                onClick={() => setFilter('non-members')}
                className={`${filter === 'non-members' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'} px-4 py-2 rounded-lg transition-colors`}
              >
                Non-Members ({users.filter(u => !u.userMemberships.some(m => m.status === 'ACTIVE' && new Date(m.endDate) > new Date())).length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-blue-600">{users.length}</h3>
            <p className="text-sm text-gray-600">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-green-600">
              {users.filter(u => u.userMemberships.some(m => m.status === 'ACTIVE' && new Date(m.endDate) > new Date())).length}
            </h3>
            <p className="text-sm text-gray-600">Active Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-orange-600">
              {users.filter(u => !u.userMemberships.some(m => m.status === 'ACTIVE' && new Date(m.endDate) > new Date())).length}
            </h3>
            <p className="text-sm text-gray-600">Non-Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-2xl font-bold text-purple-600">{memberships.length}</h3>
            <p className="text-sm text-gray-600">Available Plans</p>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No users found matching the current filters.</p>
          ) : (
            <div className="space-y-6">
              {filteredUsers.map((user) => {
                const activeMemberships = user.userMemberships.filter(membership => 
                  membership.status === 'ACTIVE' && new Date(membership.endDate) > new Date()
                );
                
                return (
                  <div key={user.id} className="border rounded-lg p-6 bg-gray-50">
                    {/* User Info */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{user.email}</h3>
                        <p className="text-sm text-gray-600">
                          Name: {user.name || 'N/A'} | Role: {user.role} | 
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                        
                        {/* AI Usage Info */}
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <span className="font-medium text-blue-900">AI建议使用: </span>
                          <span className="text-blue-700">
                            {user.aiSuggestionsUsed}/{(() => {
                              const membershipType = activeMemberships[0]?.membership.name || null;
                              return getAIUsageLimit(membershipType);
                            })()} 次
                          </span>
                          {user.aiSuggestionsResetDate && (
                            <span className="text-blue-600 ml-2 text-xs">
                              (重置于: {new Date(user.aiSuggestionsResetDate).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeMemberships.length > 0 ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Active Member
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                            Non-Member
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Current Memberships */}
                    {activeMemberships.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Current Memberships:</h4>
                        <div className="space-y-2">
                          {activeMemberships.map((membership) => (
                            <div key={membership.id} className="flex justify-between items-center bg-white p-3 rounded border">
                              <div>
                                <span className="font-medium">{membership.membership.name}</span>
                                <span className="text-sm text-gray-600 ml-2">
                                  Expires: {new Date(membership.endDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => extendMembership(membership.id, 30)}
                                  disabled={processing === `extend-${membership.id}`}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors duration-200"
                                >
                                  {processing === `extend-${membership.id}` ? 'Extending...' : 'Extend +30d'}
                                </Button>
                                <Button
                                  onClick={() => cancelMembership(membership.id)}
                                  disabled={processing === `cancel-${membership.id}`}
                                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors duration-200"
                                >
                                  {processing === `cancel-${membership.id}` ? 'Cancelling...' : 'Cancel'}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grant New Membership */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Grant New Membership:</h4>
                      <div className="flex flex-wrap gap-2">
                        {memberships.map((membership) => (
                          <Button
                            key={membership.id}
                            onClick={() => grantMembership(user.id, membership.id)}
                            disabled={processing === `grant-${user.id}-${membership.id}`}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors duration-200"
                          >
                            {processing === `grant-${user.id}-${membership.id}` 
                              ? 'Granting...' 
                              : `Grant ${membership.name} ($${membership.price})`
                            }
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* AI Usage Management */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">AI使用次数管理:</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => manageAIUsage(user.id, 'reset')}
                          disabled={processing === `ai-reset-${user.id}`}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors duration-200"
                        >
                          {processing === `ai-reset-${user.id}` ? '重置中...' : '重置使用次数'}
                        </Button>
                        <Button
                          onClick={() => openAIModal(user.id, user.aiSuggestionsUsed, 'set')}
                          disabled={processing === `ai-set-${user.id}`}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors duration-200"
                        >
                          {processing === `ai-set-${user.id}` ? '设置中...' : '设置次数'}
                        </Button>
                        <Button
                          onClick={() => openAIModal(user.id, user.aiSuggestionsUsed, 'add')}
                          disabled={processing === `ai-add-${user.id}`}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors duration-200"
                        >
                          {processing === `ai-add-${user.id}` ? '调整中...' : '调整次数'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Usage Management Modal */}
      {showAIModal && aiModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {aiModalData.action === 'set' ? '设置AI使用次数' : '调整AI使用次数'}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                当前使用次数: {aiModalData.currentUsage}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {aiModalData.action === 'set' 
                  ? '设置为:' 
                  : '增加/减少 (负数为减少):'}
              </label>
              <input
                type="number"
                value={aiInputValue}
                onChange={(e) => setAiInputValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={aiModalData.action === 'set' ? '输入新的使用次数' : '输入调整数值'}
                autoFocus
              />
            </div>

            {aiModalData.action === 'add' && aiInputValue && !isNaN(Number(aiInputValue)) && (
              <p className="text-sm text-gray-600 mb-4">
                调整后将为: {aiModalData.currentUsage + Number(aiInputValue)}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowAIModal(false);
                  setAiModalData(null);
                  setAiInputValue('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </Button>
              <Button
                onClick={handleAIModalSubmit}
                disabled={!aiInputValue || isNaN(Number(aiInputValue))}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                确认
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 