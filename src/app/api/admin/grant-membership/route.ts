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

    const { userId, membershipId } = await request.json();

    if (!userId || !membershipId) {
      return NextResponse.json(
        { message: 'User ID and Membership ID are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if membership exists
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId }
    });

    if (!membership) {
      return NextResponse.json(
        { message: 'Membership not found' },
        { status: 404 }
      );
    }

    // Check if user already has an active membership for this plan
    const existingMembership = await prisma.userMembership.findFirst({
      where: {
        userId: userId,
        membershipId: membershipId,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { message: 'User already has an active membership for this plan' },
        { status: 400 }
      );
    }

    // Create new membership
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + membership.duration);

    const userMembership = await prisma.userMembership.create({
      data: {
        userId: userId,
        membershipId: membershipId,
        startDate: startDate,
        endDate: endDate,
        status: 'ACTIVE',
      },
      include: {
        membership: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully granted ${membership.name} to ${user.email}`,
      userMembership,
    });

  } catch (error) {
    console.error('Grant membership error:', error);
    return NextResponse.json(
      { message: 'An error occurred while granting membership' },
      { status: 500 }
    );
  }
} 