import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check user authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { membershipId, paymentMethod } = await request.json();

    // Validate request
    if (!membershipId || !paymentMethod) {
      return NextResponse.json(
        { message: 'Membership ID and payment method are required' },
        { status: 400 }
      );
    }

    // Get membership details
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
    });

    if (!membership || !membership.active) {
      return NextResponse.json(
        { message: 'Membership plan not found or inactive' },
        { status: 404 }
      );
    }

    // Check if user already has active membership for this plan
    const existingMembership = await prisma.userMembership.findFirst({
      where: {
        userId: currentUser.id,
        membershipId: membership.id,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { message: 'You already have an active membership for this plan' },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: currentUser.id,
        membershipId: membership.id,
        amount: membership.price,
        method: paymentMethod,
        status: 'PENDING',
        transactionId: generateTransactionId(),
      },
      include: {
        membership: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Here you would integrate with actual payment providers
    // For now, we'll simulate the payment process
    const paymentUrl = await processPayment(payment, paymentMethod);

    return NextResponse.json({
      paymentId: payment.id,
      paymentUrl,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      transactionId: payment.transactionId,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating payment' },
      { status: 500 }
    );
  }
}

function generateTransactionId(): string {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function processPayment(payment: any, method: string): Promise<string> {
  // This is where you would integrate with actual payment providers
  // For demonstration, we'll return mock URLs with proper callback URLs
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const successUrl = `${baseUrl}/membership/payment/result?transaction_id=${payment.transactionId}&status=completed&payment_id=${payment.id}`;
  const cancelUrl = `${baseUrl}/membership/payment/result?status=cancelled`;
  
  switch (method) {
    case 'ALIPAY':
      return `https://openapi.alipay.com/gateway.do?method=alipay.trade.page.pay&app_id=demo&charset=UTF-8&sign_type=RSA2&timestamp=${Date.now()}&version=1.0&notify_url=${baseUrl}/api/payment/callback&return_url=${successUrl}&biz_content={"out_trade_no":"${payment.transactionId}","product_code":"FAST_INSTANT_TRADE_PAY","total_amount":"${payment.amount}","subject":"Membership Plan"}`;
    case 'WECHAT':
      return `https://api.mch.weixin.qq.com/pay/unifiedorder?appid=demo&mch_id=demo&nonce_str=${Date.now()}&body=Membership Plan&out_trade_no=${payment.transactionId}&total_fee=${Math.round(payment.amount * 100)}&trade_type=NATIVE&notify_url=${baseUrl}/api/payment/callback&redirect_url=${successUrl}`;
    case 'VISA':
    case 'MASTERCARD':
      return `https://checkout.stripe.com/pay?session_id=demo_${payment.transactionId}&success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
    case 'PAYPAL':
      return `https://www.sandbox.paypal.com/checkoutnow?token=demo_${payment.transactionId}&useraction=commit&returnUrl=${encodeURIComponent(successUrl)}&cancelUrl=${encodeURIComponent(cancelUrl)}`;
    default:
      // For demo purposes, return a local demo URL
      return `${baseUrl}/membership/payment/result?transaction_id=${payment.transactionId}&status=completed&payment_id=${payment.id}`;
  }
} 