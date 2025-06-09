import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/user/b-visa-personal-questions - Get user's B visa personal questions
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const questions = await prisma.bVisaPersonalQuestion.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching B visa personal questions:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching personal questions' },
      { status: 500 }
    );
  }
}

// POST /api/user/b-visa-personal-questions - Create a new B visa personal question
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { question, answer } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { message: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const newQuestion = await prisma.bVisaPersonalQuestion.create({
      data: {
        question,
        answer,
        userId: currentUser.id,
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating B visa personal question:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the personal question' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/b-visa-personal-questions - Update a B visa personal question
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, question, answer } = await request.json();

    if (!id || !question || !answer) {
      return NextResponse.json(
        { message: 'ID, question and answer are required' },
        { status: 400 }
      );
    }

    // Check if the question belongs to the current user
    const existingQuestion = await prisma.bVisaPersonalQuestion.findFirst({
      where: {
        id,
        userId: currentUser.id,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { message: 'Personal question not found or unauthorized' },
        { status: 404 }
      );
    }

    const updatedQuestion = await prisma.bVisaPersonalQuestion.update({
      where: { id },
      data: {
        question,
        answer,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating B visa personal question:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the personal question' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/b-visa-personal-questions - Delete a B visa personal question
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Question ID is required' },
        { status: 400 }
      );
    }

    // Check if the question belongs to the current user
    const existingQuestion = await prisma.bVisaPersonalQuestion.findFirst({
      where: {
        id,
        userId: currentUser.id,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { message: 'Personal question not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.bVisaPersonalQuestion.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Personal question deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting B visa personal question:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the personal question' },
      { status: 500 }
    );
  }
} 