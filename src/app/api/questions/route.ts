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
    const { title, content } = await request.json();

    // Validate request
    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        title,
        content,
        userId: payload.id,
        status: 'PENDING', // Questions are pending by default until approved by admin
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('Question creation error:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the question' + error},
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'APPROVED';
    
    // Check if user is admin for non-approved questions
    if (status !== 'APPROVED') {
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
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Fetch questions
    const questions = await prisma.question.findMany({
      where: {
        status: status as any,
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

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Question fetch error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching questions' },
      { status: 500 }
    );
  }
} 