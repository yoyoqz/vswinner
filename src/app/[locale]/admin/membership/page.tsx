'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatTextForReact } from '@/lib/formatText';

const membershipPlans = [
  {
    name: '一月会员',
    description: '一月期会员套餐，享受基础服务',
    price: 20.00,
    duration: 30,
    features: [
      '访问高级签证指南',
      '独家视频内容',
      '一对一咨询服务（0.5小时）',
      '文档模板'
    ],
    active: true,
    order: 1,
  },
  {
    name: '三月会员',
    description: '三月期会员套餐，最受欢迎的选择',
    price: 50.00,
    duration: 90,
    features: [
      '包含所有一月会员功能',
      '一对一咨询服务（1小时）',
      '申请审核服务',
      '高级文档清单',
    ],
    active: true,
    order: 2,
  },
  {
    name: '半年会员',
    description: '半年期会员套餐，提供全面的签证协助',
    price: 80.00,
    duration: 180,
    features: [
      '包含所有三月会员功能',
      '无限制咨询服务',
      '快速申请审核',
      '专属签证顾问',
    ],
    active: true,
    order: 3,
  },
];

export default function AdminMembershipPage() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStatus, setInitStatus] = useState<string>('');
  const [existingPlans, setExistingPlans] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  useEffect(() => {
    // 获取现有的会员套餐
    if (isAuthenticated && isAdmin) {
      fetchExistingPlans();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchExistingPlans = async () => {
    try {
      const response = await fetch('/api/membership');
      if (response.ok) {
        const plans = await response.json();
        setExistingPlans(plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const initializeMembershipPlans = async () => {
    setIsInitializing(true);
    setInitStatus('正在初始化会员套餐...');

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/admin/membership/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'seed' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initialize membership plans');
      }

      const data = await response.json();
      setInitStatus(`✅ ${data.message}`);
      await fetchExistingPlans(); // 刷新列表
    } catch (error) {
      console.error('Error initializing plans:', error);
      setInitStatus(`❌ 初始化失败: ${(error as Error).message}`);
    } finally {
      setIsInitializing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Membership Management</h1>
        <p className="text-gray-600 mt-2">管理会员套餐和用户订阅</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">初始化会员套餐</h2>
        <p className="text-gray-600 mb-4">
                      点击下面的按钮来创建三个预设的会员套餐：一月会员($20)、三月会员($50)、半年会员($80)
        </p>
        
        <button
          onClick={initializeMembershipPlans}
          disabled={isInitializing}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isInitializing ? '初始化中...' : '初始化会员套餐'}
        </button>

        {initStatus && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm">{initStatus}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">现有会员套餐</h2>
        
        {existingPlans.length === 0 ? (
          <p className="text-gray-500">暂无会员套餐，请先初始化。</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {existingPlans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <div className="text-gray-600 text-sm mb-2" dangerouslySetInnerHTML={formatTextForReact(plan.description)} />
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  ${plan.price}
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  有效期: {plan.duration} 天
                </p>
                <div className="text-sm">
                  <p className="font-medium mb-1">功能特性:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {plan.features.slice(0, 3).map((feature: string, index: number) => (
                      <li key={index}>• {feature}</li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-gray-400">... 等{plan.features.length - 3}项更多功能</li>
                    )}
                  </ul>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                    plan.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {plan.active ? '激活' : '禁用'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 