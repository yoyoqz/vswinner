import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
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
    
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get request body
    const { content, questionId } = await request.json();

    // Validate request
    if (!content) {
      return NextResponse.json(
        { message: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (!questionId) {
      return NextResponse.json(
        { message: 'questionId is required' },
        { status: 400 }
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: payload.id,
        questionId,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
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
    
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get comment id from URL
    const url = new URL(request.url);
    const commentId = url.searchParams.get('id');

    if (!commentId) {
      return NextResponse.json(
        { message: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Find comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { message: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner or an admin
    if (comment.userId !== payload.id && payload.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'You are not authorized to delete this comment' },
        { status: 403 }
      );
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Comment deletion error:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the comment' },
      { status: 500 }
    );
  }
} 