import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST /api/admin/questions/[questionId]/reject - Reject a pending question
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    // Only admins can reject questions
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { questionId } = await params;
    const body = await req.json();
    const { reason } = body; // Optional rejection reason

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

    // Reject the question
    const updateData: any = {
      status: 'REJECTED',
      updatedAt: new Date(),
    };

    if (reason) {
      updateData.adminNote = reason;
    }

    const rejectedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: updateData,
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
      ...rejectedQuestion,
      createdAt: rejectedQuestion.createdAt.toISOString(),
      updatedAt: rejectedQuestion.updatedAt.toISOString(),
    };

    return NextResponse.json({
      message: 'Question rejected successfully',
      question: serializedQuestion,
    });
  } catch (error: any) {
    console.error('Error rejecting question:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/questions/[questionId]/reject - Alternative method for rejection
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  return POST(req, { params });
} 