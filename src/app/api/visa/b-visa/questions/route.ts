import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/visa/b-visa/questions - Get all B visa questions
export async function GET() {
  try {
    const questions = await prisma.bVisaQuestion.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching B visa questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch B visa questions' },
      { status: 500 }
    );
  }
}

// POST /api/visa/b-visa/questions - Create a new B visa question (admin only)
export async function POST(request: Request) {
  try {
    // Check if user is admin
    const { getCurrentUser } = await import('@/lib/auth');
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { question, answer, order } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    // If no order is provided, get the next available order
    let questionOrder = order;
    if (questionOrder === undefined || questionOrder === null) {
      const lastQuestion = await prisma.bVisaQuestion.findFirst({
        orderBy: { order: 'desc' }
      });
      questionOrder = lastQuestion ? lastQuestion.order + 1 : 1;
    }

    const newQuestion = await prisma.bVisaQuestion.create({
      data: {
        question,
        answer,
        order: questionOrder,
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating B visa question:', error);
    return NextResponse.json(
      { error: 'Failed to create B visa question' },
      { status: 500 }
    );
  }
} 