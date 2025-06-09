import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get user's questions
export async function GET(request: Request) {
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

    // Fetch user's questions
    const questions = await prisma.question.findMany({
      where: {
        userId: payload.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('User questions fetch error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching your questions' },
      { status: 500 }
    );
  }
} 