import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 重置用户AI使用次数
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { userId, action, value } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'reset':
        updateData = {
          aiSuggestionsUsed: 0,
          aiSuggestionsResetDate: new Date()
        };
        break;
      case 'set':
        if (typeof value !== 'number' || value < 0) {
          return NextResponse.json(
            { message: 'Invalid value for set action' },
            { status: 400 }
          );
        }
        updateData = {
          aiSuggestionsUsed: value
        };
        break;
      case 'add':
        if (typeof value !== 'number') {
          return NextResponse.json(
            { message: 'Invalid value for add action' },
            { status: 400 }
          );
        }
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { aiSuggestionsUsed: true }
        });
        
        if (!user) {
          return NextResponse.json(
            { message: 'User not found' },
            { status: 404 }
          );
        }

        updateData = {
          aiSuggestionsUsed: Math.max(0, user.aiSuggestionsUsed + value)
        };
        break;
      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        aiSuggestionsUsed: true,
        aiSuggestionsResetDate: true,
        userMemberships: {
          where: {
            status: 'ACTIVE',
            endDate: { gt: new Date() }
          },
          include: {
            membership: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `AI usage ${action === 'reset' ? 'reset' : action === 'set' ? 'set' : 'adjusted'} successfully`
    });

  } catch (error) {
    console.error('Error managing AI usage:', error);
    return NextResponse.json(
      { message: 'An error occurred while managing AI usage' },
      { status: 500 }
    );
  }
} 