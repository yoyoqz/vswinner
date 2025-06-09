import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's active memberships
    const userMemberships = await prisma.userMembership.findMany({
      where: {
        userId: currentUser.id,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
      },
      include: {
        membership: true,
      },
      orderBy: {
        endDate: 'desc',
      },
    });

    // Get payment history
    const payments = await prisma.payment.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        membership: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Last 10 payments
    });

    return NextResponse.json({
      memberships: userMemberships,
      payments,
      hasMembership: userMemberships.length > 0,
    });

  } catch (error) {
    console.error('User membership fetch error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching user membership' },
      { status: 500 }
    );
  }
} 