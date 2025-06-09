import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/questions-public - Get approved questions for public view
export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      where: {
        status: 'APPROVED',
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
        createdAt: 'desc',
      },
    });

    // Convert dates to strings for client-side consumption
    const serializedQuestions = questions.map(question => ({
      ...question,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    }));

    return NextResponse.json(serializedQuestions);
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 