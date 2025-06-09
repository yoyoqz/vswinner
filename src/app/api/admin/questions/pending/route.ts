import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/admin/questions/pending - Get all pending questions for admin review
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    // Only admins can access pending questions
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Fetch pending questions
    const pendingQuestions = await prisma.question.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Show newest pending questions first
      },
    });

    // Convert dates to strings for client-side consumption
    const serializedQuestions = pendingQuestions.map(question => ({
      ...question,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    }));

    return NextResponse.json(serializedQuestions);
  } catch (error: any) {
    console.error('Error fetching pending questions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 