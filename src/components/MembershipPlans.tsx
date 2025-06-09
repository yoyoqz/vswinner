'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { formatTextForReact } from '@/lib/formatText';

interface Membership {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  features: string[];
  active: boolean;
  order: number;
}

interface UserMembership {
  id: string;
  membership: Membership;
  startDate: string;
  endDate: string;
  status: string;
}

export function MembershipPlans() {
  const { isAuthenticated } = useAuth();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const t = useTranslations('membership');
  const tPayment = useTranslations('payment');

  useEffect(() => {
    fetchMemberships();
    if (isAuthenticated) {
      fetchUserMemberships();
    }
  }, [isAuthenticated]);

  const fetchMemberships = async () => {
    try {
      const response = await fetch('/api/membership');
      if (!response.ok) {
        throw new Error('Failed to fetch memberships');
      }
      const data = await response.json();
      setMemberships(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMemberships = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/membership', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserMemberships(data.memberships || []);
      }
    } catch (err) {
      console.error('Failed to fetch user memberships:', err);
    }
  };

  const handleSelectPlan = (membershipId: string) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setSelectedPlan(membershipId);
    setShowPayment(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan || !selectedPaymentMethod) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          membershipId: selectedPlan,
          paymentMethod: selectedPaymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment');
      }

      const data = await response.json();
      
      // Store payment info for later reference
      sessionStorage.setItem('pendingPayment', JSON.stringify({
        paymentId: data.paymentId,
        membershipId: selectedPlan,
        amount: data.amount,
        method: selectedPaymentMethod,
      }));

      // Redirect to payment URL or show payment completion
      if (data.paymentUrl && data.paymentUrl.startsWith('http')) {
        // Redirect to external payment provider
        window.location.href = data.paymentUrl;
      } else {
        // For demo purposes, simulate payment completion
        setTimeout(async () => {
          try {
            // Simulate payment callback
            const callbackResponse = await fetch('/api/payment/callback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                transactionId: data.transactionId || `TXN_${Date.now()}`,
                status: 'COMPLETED',
                paymentData: {
                  method: selectedPaymentMethod,
                  amount: data.amount,
                  timestamp: new Date().toISOString(),
                },
              }),
            });

            if (callbackResponse.ok) {
              sessionStorage.removeItem('pendingPayment');
              alert(t('paymentSuccess'));
              setShowPayment(false);
              setSelectedPlan(null);
              setSelectedPaymentMethod('');
              await fetchUserMemberships();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            console.error('Payment callback error:', err);
            setError(t('paymentError'));
          } finally {
            setProcessing(false);
          }
        }, 2000);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : t('paymentError'));
      setProcessing(false);
    }
  };

  const isUserMember = (membershipId: string) => {
    return userMemberships.some(um => 
      um.membership.id === membershipId && 
      new Date(um.endDate) > new Date()
    );
  };

  const formatPrice = (price: number, duration: number) => {
    const monthly = price / (duration / 30);
    return {
      total: price,
      monthly: monthly.toFixed(2),
    };
  };

  const paymentMethods = [
    { id: 'ALIPAY', name: tPayment('alipay'), icon: '💰' },
    { id: 'WECHAT', name: tPayment('wechat'), icon: '💬' },
    { id: 'VISA', name: tPayment('visa'), icon: '💳' },
    { id: 'MASTERCARD', name: tPayment('mastercard'), icon: '💳' },
    { id: 'PAYPAL', name: tPayment('paypal'), icon: '🅿️' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Memberships */}
      {isAuthenticated && userMemberships.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">{t('currentPlan')}</h3>
          <div className="space-y-2">
            {userMemberships.map((um) => (
              <div key={um.id} className="flex justify-between items-center">
                <span className="font-medium">{um.membership.name}</span>
                <span className="text-sm text-green-600">
                  Valid until: {new Date(um.endDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Membership Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memberships.map((membership, index) => {
          const price = formatPrice(membership.price, membership.duration);
          const isCurrent = isUserMember(membership.id);
          const isPopular = index === 1; // Make middle plan popular

          return (
            <Card 
              key={membership.id} 
              className={`relative transition-all duration-300 hover:shadow-xl ${
                isPopular 
                  ? 'border-2 border-gradient-to-r from-purple-500 to-pink-500 shadow-2xl scale-105 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 ring-2 ring-purple-200' 
                  : 'hover:scale-102 hover:shadow-md'
              } ${isCurrent ? 'border-green-500' : ''}`}
            >
              {isPopular && (
                <>
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="relative">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                        ⭐ {t('popular')} ⭐
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-30 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                    <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce opacity-80"></div>
                  </div>
                </>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className={`text-xl ${isPopular ? 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold' : ''}`}>
                  {membership.name}
                </CardTitle>
                {membership.description && (
                  <div className={`text-sm ${isPopular ? 'text-gray-700' : 'text-gray-600'}`} dangerouslySetInnerHTML={formatTextForReact(membership.description)} />
                )}
                <div className="mt-4">
                  <span className={`text-3xl font-bold ${isPopular ? 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' : ''}`}>
                    ${price.total}
                  </span>
                  <span className="text-gray-500">/{membership.duration} days</span>
                  <div className={`text-sm ${isPopular ? 'text-gray-700' : 'text-gray-500'}`}>
                    ~${price.monthly} {t('perMonth')}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">{t('features')}:</h4>
                  <ul className="space-y-1">
                    {membership.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handleSelectPlan(membership.id)}
                  className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${
                    isCurrent 
                      ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-gray-400 disabled:text-gray-400' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400'
                  }`}
                  disabled={isCurrent}
                >
                  {isCurrent ? t('currentPlan') : isPopular ? `🚀 ${t('selectPlan')}` : t('selectPlan')}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 bg-white shadow-2xl border-0">
            <CardHeader className="bg-white">
              <CardTitle className="text-black text-xl font-semibold">{tPayment('title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white text-black">
              <div>
                <h4 className="font-semibold mb-2 text-black">{tPayment('selectMethod')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-3 border rounded-lg text-center transition-all duration-200 ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-black'
                      }`}
                    >
                      <div className="text-2xl mb-1">{method.icon}</div>
                      <div className="text-sm font-medium">{method.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedPlan && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-black font-medium">{tPayment('total')}:</span>
                    <span className="font-bold text-xl text-black">
                      ${memberships.find(m => m.id === selectedPlan)?.price}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handlePayment}
                  disabled={!selectedPaymentMethod || processing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400"
                >
                  {processing ? t('processing') : tPayment('confirm')}
                </Button>
                <Button
                  onClick={() => {
                    setShowPayment(false);
                    setSelectedPlan(null);
                    setSelectedPaymentMethod('');
                  }}
                  disabled={processing}
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:border-gray-400 disabled:text-gray-400"
                >
                  {tPayment('cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 