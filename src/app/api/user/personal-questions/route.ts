import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// Get user's personal questions
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

    // Fetch user's personal questions
    const questions = await prisma.personalQuestion.findMany({
      where: {
        userId: payload.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('User personal questions fetch error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching your questions' },
      { status: 500 }
    );
  }
}

// Add a new personal question
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

    // Parse request body
    const body = await request.json();
    const { question, answer } = body;

    if (!question) {
      return NextResponse.json(
        { message: 'Question is required' },
        { status: 400 }
      );
    }

    // Create new personal question
    const newQuestion = await prisma.personalQuestion.create({
      data: {
        id: uuidv4(),
        question,
        answer: answer || 'No answer provided yet.',
        userId: payload.id,
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Add personal question error:', error);
    return NextResponse.json(
      { message: 'An error occurred while adding your question' },
      { status: 500 }
    );
  }
}

// Update a personal question
export async function PATCH(request: Request) {
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

    // Parse request body
    const body = await request.json();
    const { id, question, answer } = body;

    if (!id) {
      return NextResponse.json(
        { message: 'Question ID is required' },
        { status: 400 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { message: 'Question is required' },
        { status: 400 }
      );
    }

    // Check if the question belongs to the user
    const existingQuestion = await prisma.personalQuestion.findFirst({
      where: {
        id,
        userId: payload.id,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { message: 'Question not found or access denied' },
        { status: 404 }
      );
    }

    // Update the personal question
    const updatedQuestion = await prisma.personalQuestion.update({
      where: {
        id,
      },
      data: {
        question,
        answer: answer || 'No answer provided yet.',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Update personal question error:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating your question' },
      { status: 500 }
    );
  }
}

// Delete a personal question
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

    // Get question ID from URL search params
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Question ID is required' },
        { status: 400 }
      );
    }

    // Check if the question belongs to the user
    const existingQuestion = await prisma.personalQuestion.findFirst({
      where: {
        id,
        userId: payload.id,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { message: 'Question not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the personal question
    await prisma.personalQuestion.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: 'Question deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete personal question error:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting your question' },
      { status: 500 }
    );
  }
} 