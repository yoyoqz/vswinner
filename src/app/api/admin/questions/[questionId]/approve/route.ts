import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST /api/admin/questions/[questionId]/approve - Approve a pending question
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    // Only admins can approve questions
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { questionId } = await params;

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { message: 'Question not found' },
        { status: 404 }
      );
    }

    // Check if question is pending
    if (existingQuestion.status !== 'PENDING') {
      return NextResponse.json(
        { message: `Question is already ${existingQuestion.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Approve the question
    const approvedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: { 
        status: 'APPROVED',
        updatedAt: new Date(),
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
    });

    // Convert dates to strings for client-side consumption
    const serializedQuestion = {
      ...approvedQuestion,
      createdAt: approvedQuestion.createdAt.toISOString(),
      updatedAt: approvedQuestion.updatedAt.toISOString(),
    };

    return NextResponse.json({
      message: 'Question approved successfully',
      question: serializedQuestion,
    });
  } catch (error: any) {
    console.error('Error approving question:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/questions/[questionId]/approve - Alternative method for approval
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  return POST(req, { params });
} 