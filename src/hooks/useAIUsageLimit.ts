import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface AIUsageLimit {
  used: number;
  limit: number;
  canUse: boolean;
  membershipType: string | null;
  loading: boolean;
  error: string | null;
}

export function useAIUsageLimit() {
  const { isAuthenticated } = useAuth();
  const [usageLimit, setUsageLimit] = useState<AIUsageLimit>({
    used: 0,
    limit: 0,
    canUse: false,
    membershipType: null,
    loading: true,
    error: null
  });

  const fetchUsageLimit = async () => {
    if (!isAuthenticated) {
      setUsageLimit({
        used: 0,
        limit: 0,
        canUse: false,
        membershipType: null,
        loading: false,
        error: null
      });
      return;
    }

    try {
      setUsageLimit(prev => ({ ...prev, loading: true, error: null }));
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/ai/usage', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage limit');
      }

      const data = await response.json();
      setUsageLimit({
        used: data.used,
        limit: data.limit,
        canUse: data.canUse,
        membershipType: data.membershipType,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching AI usage limit:', error);
      setUsageLimit(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch usage limit'
      }));
    }
  };

  const updateUsage = (newUsed: number) => {
    setUsageLimit(prev => ({
      ...prev,
      used: newUsed,
      canUse: prev.limit > 0 && newUsed < prev.limit
    }));
  };

  useEffect(() => {
    fetchUsageLimit();
  }, [isAuthenticated]);

  return {
    ...usageLimit,
    refresh: fetchUsageLimit,
    updateUsage
  };
} 