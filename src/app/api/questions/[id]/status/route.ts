import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params;

    // Get token from header
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
        { message: 'Only admins can update question status' },
        { status: 403 }
      );
    }

    // Get request body
    const { status } = await request.json();

    // Validate status
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { message: 'Question not found' },
        { status: 404 }
      );
    }

    // Update question status
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: { status },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Question status update error:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the question status' },
      { status: 500 }
    );
  }
} 