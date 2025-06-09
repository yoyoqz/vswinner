import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JwtPayload } from '@/lib/auth';

// Function to verify if user is admin (simplified authentication)
async function isAdmin(request: Request): Promise<boolean> {
  try {
    // In a real implementation, this would verify the token
    // For now, we'll allow all requests
    return true;
  } catch (error) {
    console.error('Authorization error:', error);
    return false;
  }
}

// GET /api/visa/f-visa/questions - Get all F visa questions
export async function GET() {
  try {
    const questions = await prisma.fVisaQuestion.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching F visa questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// POST /api/visa/f-visa/questions - Create a new F visa question
export async function POST(request: Request) {
  try {
    // Check if user is admin
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    if (!body.question || !body.answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    // Get the highest order value
    const maxOrderQuestion = await prisma.fVisaQuestion.findFirst({
      orderBy: { order: 'desc' },
    });
    
    const nextOrder = maxOrderQuestion ? maxOrderQuestion.order + 1 : 0;

    // Create the question
    const question = await prisma.fVisaQuestion.create({
      data: {
        question: body.question,
        answer: body.answer,
        order: nextOrder,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('Error creating F visa question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
} 