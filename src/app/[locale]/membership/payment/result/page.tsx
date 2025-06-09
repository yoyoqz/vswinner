'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('payment');
  const tMembership = useTranslations('membership');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'cancelled'>('loading');
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const processPaymentResult = async () => {
      const transactionId = searchParams.get('transaction_id');
      const paymentStatus = searchParams.get('status');
      const paymentId = searchParams.get('payment_id');

      // Get pending payment from session storage
      const pendingPayment = sessionStorage.getItem('pendingPayment');
      let paymentData = null;
      if (pendingPayment) {
        try {
          paymentData = JSON.parse(pendingPayment);
        } catch (e) {
          console.error('Failed to parse pending payment:', e);
        }
      }

      if (paymentStatus === 'cancelled') {
        setStatus('cancelled');
        sessionStorage.removeItem('pendingPayment');
        return;
      }

      if (transactionId && paymentStatus) {
        try {
          // Process payment callback
          const response = await fetch('/api/payment/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transactionId,
              status: paymentStatus.toUpperCase(),
              paymentData: {
                paymentId,
                ...paymentData,
                timestamp: new Date().toISOString(),
              },
            }),
          });

          if (response.ok) {
            const result = await response.json();
            setPaymentInfo(result.payment);
            setStatus(paymentStatus.toLowerCase() === 'completed' ? 'success' : 'failed');
            sessionStorage.removeItem('pendingPayment');
          } else {
            setStatus('failed');
          }
        } catch (error) {
          console.error('Payment processing error:', error);
          setStatus('failed');
        }
      } else {
        // No payment info, redirect to membership page
        setTimeout(() => {
          router.push('/membership');
        }, 3000);
      }
    };

    processPaymentResult();
  }, [searchParams, router]);

  const handleReturnToMembership = () => {
    router.push('/membership');
  };

  const handleRetryPayment = () => {
    const pendingPayment = sessionStorage.getItem('pendingPayment');
    if (pendingPayment) {
      sessionStorage.removeItem('pendingPayment');
    }
    router.push('/membership');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">
            {status === 'loading' && t('processing')}
            {status === 'success' && t('success')}
            {status === 'failed' && t('failed')}
            {status === 'cancelled' && t('cancelled')}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="text-green-600 text-6xl mb-4">✅</div>
              <p className="text-lg text-gray-600 mb-4">
                {t('successMessage')}
              </p>
              {paymentInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-green-800 mb-2">{t('paymentDetails')}</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>{t('amount')}:</strong> ${paymentInfo.amount}</div>
                    <div><strong>{t('method')}:</strong> {paymentInfo.method}</div>
                    <div><strong>{t('transactionId')}:</strong> {paymentInfo.transactionId}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'failed' && (
            <div>
              <div className="text-red-600 text-6xl mb-4">❌</div>
              <p className="text-lg text-gray-600 mb-4">
                {t('failedMessage')}
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={handleRetryPayment} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {t('retryPayment')}
                </Button>
                <Button 
                  onClick={handleReturnToMembership} 
                  className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {t('returnToMembership')}
                </Button>
              </div>
            </div>
          )}

          {status === 'cancelled' && (
            <div>
              <div className="text-yellow-600 text-6xl mb-4">⚠️</div>
              <p className="text-lg text-gray-600 mb-4">
                {t('cancelledMessage')}
              </p>
              <Button 
                onClick={handleReturnToMembership} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {t('returnToMembership')}
              </Button>
            </div>
          )}

          {status === 'success' && (
            <Button 
              onClick={handleReturnToMembership} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {tMembership('title')}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment result...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}