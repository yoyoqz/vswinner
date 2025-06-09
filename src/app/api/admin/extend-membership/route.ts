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

    const { userMembershipId, days } = await request.json();

    if (!userMembershipId || !days) {
      return NextResponse.json(
        { message: 'User membership ID and days are required' },
        { status: 400 }
      );
    }

    if (days <= 0 || days > 365) {
      return NextResponse.json(
        { message: 'Days must be between 1 and 365' },
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

    // Extend the membership by adding days to the current end date
    const currentEndDate = new Date(userMembership.endDate);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(currentEndDate.getDate() + days);

    const extendedMembership = await prisma.userMembership.update({
      where: { id: userMembershipId },
      data: {
        endDate: newEndDate,
        status: 'ACTIVE', // Ensure status is active when extending
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully extended ${userMembership.membership.name} for ${userMembership.user.email} by ${days} days. New expiry: ${newEndDate.toLocaleDateString()}`,
      userMembership: extendedMembership,
    });

  } catch (error) {
    console.error('Extend membership error:', error);
    return NextResponse.json(
      { message: 'An error occurred while extending membership' },
      { status: 500 }
    );
  }
} 