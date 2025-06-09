import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/questions-public/[id] - Get an approved question by ID with comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const question = await prisma.question.findUnique({
      where: { 
        id,
        status: 'APPROVED', // Only show approved questions
      },
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