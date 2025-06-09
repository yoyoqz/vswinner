import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }

    // Fetch payment history
    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        membership: {
          select: {
            name: true,
            price: true,
            duration: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.payment.count({
      where: whereClause,
    });

    // Calculate revenue statistics
    const revenueStats = await prisma.payment.aggregate({
      where: {
        ...whereClause,
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      payments,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      stats: {
        totalRevenue: revenueStats._sum.amount || 0,
        completedPayments: revenueStats._count.id || 0,
      },
    });

  } catch (error) {
    console.error('Payment history fetch error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching payment history' },
      { status: 500 }
    );
  }
} 