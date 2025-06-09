import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    const { userMembershipId } = await request.json();

    if (!userMembershipId) {
      return NextResponse.json(
        { message: 'User membership ID is required' },
        { status: 400 }
      );
    }

    // Check if user membership exists
    const userMembership = await prisma.userMembership.findUnique({
      where: { id: userMembershipId },
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
          },
        },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { message: 'User membership not found' },
        { status: 404 }
      );
    }

    // Cancel the membership by setting status to CANCELLED
    const cancelledMembership = await prisma.userMembership.update({
      where: { id: userMembershipId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully cancelled ${userMembership.membership.name} for ${userMembership.user.email}`,
      userMembership: cancelledMembership,
    });

  } catch (error) {
    console.error('Cancel membership error:', error);
    return NextResponse.json(
      { message: 'An error occurred while cancelling membership' },
      { status: 500 }
    );
  }
} 