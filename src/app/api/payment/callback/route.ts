import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { transactionId, status, paymentData } = await request.json();

    if (!transactionId || !status) {
      console.error('Payment callback error: Missing required fields', { transactionId, status });
      return NextResponse.json(
        { message: 'Transaction ID and status are required' },
        { status: 400 }
      );
    }

    console.log('Processing payment callback:', { transactionId, status, paymentData });

    // Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { transactionId },
      include: {
        membership: true,
        user: true,
      },
    });

    if (!payment) {
      console.error('Payment not found:', transactionId);
      return NextResponse.json(
        { message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if payment is already processed
    if (payment.status === 'COMPLETED') {
      console.log('Payment already completed:', transactionId);
      return NextResponse.json({
        success: true,
        payment,
        message: 'Payment already processed',
      });
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: status.toUpperCase(),
        paymentData,
        updatedAt: new Date(),
      },
      include: {
        membership: true,
        user: true,
      },
    });

    console.log('Payment status updated:', { paymentId: payment.id, status: status.toUpperCase() });

    // If payment is successful, create or extend user membership
    if (status.toUpperCase() === 'COMPLETED' && payment.membership) {
      try {
        await prisma.$transaction(async (tx) => {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(startDate.getDate() + payment.membership.duration);

          // Check if user already has an active membership for this plan
          const existingMembership = await tx.userMembership.findFirst({
            where: {
              userId: payment.userId,
              membershipId: payment.membershipId!,
              status: 'ACTIVE',
              endDate: { gt: new Date() },
            },
          });

          if (!existingMembership) {
            // Create new membership
            await tx.userMembership.create({
              data: {
                userId: payment.userId,
                membershipId: payment.membershipId!,
                startDate,
                endDate,
                status: 'ACTIVE',
              },
            });
            console.log('New membership created:', { userId: payment.userId, membershipId: payment.membershipId });
          } else {
            // Extend existing membership
            const newEndDate = new Date(existingMembership.endDate);
            newEndDate.setDate(newEndDate.getDate() + payment.membership.duration);
            
            await tx.userMembership.update({
              where: { id: existingMembership.id },
              data: {
                endDate: newEndDate,
                updatedAt: new Date(),
              },
            });
            console.log('Membership extended:', { membershipId: existingMembership.id, newEndDate });
          }
        });
      } catch (membershipError) {
        console.error('Error processing membership:', membershipError);
        // Even if membership creation fails, we don't want to fail the payment
        // The payment is successful, but we need to handle membership separately
      }
    } else if (status.toUpperCase() === 'FAILED') {
      console.log('Payment failed:', transactionId);
    }

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
    });

  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing payment callback' },
      { status: 500 }
    );
  }
}

// GET method for handling redirect from payment providers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transaction_id');
    const status = searchParams.get('status');
    const paymentId = searchParams.get('payment_id');

    console.log('Payment redirect received:', { transactionId, status, paymentId });

    if (transactionId && status) {
      // Create a new request object for the POST handler
      const callbackData = {
        transactionId,
        status,
        paymentData: {
          paymentId,
          redirectSource: 'GET',
          timestamp: new Date().toISOString(),
        },
      };

      // Process the callback internally
      const response = await fetch(request.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callbackData),
      });

      if (response.ok) {
        // Redirect to payment result page
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return NextResponse.redirect(`${baseUrl}/membership/payment/result?transaction_id=${transactionId}&status=${status}&payment_id=${paymentId}`);
      }
    }

    // If processing fails or no valid params, redirect to membership page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/membership?payment=error`);
  } catch (error) {
    console.error('Payment redirect error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/membership?payment=error`);
  }
} 