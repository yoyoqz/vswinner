import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/admin/questions/[questionId] - Get a specific question with full details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    // Only admins can access question details via admin API
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { questionId } = await params;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { message: 'Question not found' },
        { status: 404 }
      );
    }

    // Convert dates to strings for client-side consumption
    const serializedQuestion = {
      ...question,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
      comments: question.comments.map(comment => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(serializedQuestion);
  } catch (error: any) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/questions/[questionId] - Update question status or other properties
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    // Only admins can update questions
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { questionId } = await params;
    const body = await req.json();
    const { status, adminNote } = body;

    // Validate status if provided
    if (status && !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status. Must be PENDING, APPROVED, or REJECTED' },
        { status: 400 }
      );
    }

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { message: 'Question not found' },
        { status: 404 }
      );
    }

    // Update question
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    if (adminNote !== undefined) {
      updateData.adminNote = adminNote;
    }

    const updatedQuestion = await prisma.question.update({
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
      ...updatedQuestion,
      createdAt: updatedQuestion.createdAt.toISOString(),
      updatedAt: updatedQuestion.updatedAt.toISOString(),
    };

    return NextResponse.json({
      message: 'Question updated successfully',
      question: serializedQuestion,
    });
  } catch (error: any) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/questions/[questionId] - Delete a question
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    // Only admins can delete questions
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
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { message: 'Question not found' },
        { status: 404 }
      );
    }

    // Delete associated comments first
    await prisma.comment.deleteMany({
      where: { questionId },
    });

    // Delete the question
    await prisma.question.delete({
      where: { id: questionId },
    });

    return NextResponse.json({
      message: 'Question deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 