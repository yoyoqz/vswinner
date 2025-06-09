import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Function to verify if user is admin (simplified authentication)
async function isAdmin(): Promise<boolean> {
  // In a real implementation, this would verify the token
  // For now, we'll allow all requests
  return true;
}

// GET /api/visa/f-visa/questions/[id] - Get a single F visa question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const question = await prisma.fVisaQuestion.findUnique({
      where: { id: id },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error fetching F visa question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

// PUT /api/visa/f-visa/questions/[id] - Update a F visa question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if user is admin
    if (!(await isAdmin())) {
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

    // Check if the question exists
    const existingQuestion = await prisma.fVisaQuestion.findUnique({
      where: { id: id },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Update the question
    const updatedQuestion = await prisma.fVisaQuestion.update({
      where: { id: id },
      data: {
        question: body.question,
        answer: body.answer,
        order: body.order !== undefined ? body.order : existingQuestion.order,
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating F visa question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

// PATCH /api/visa/f-visa/questions/[id] - Partially update a F visa question (for order updates)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Check if the question exists
    const existingQuestion = await prisma.fVisaQuestion.findUnique({
      where: { id: id },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Update the question with only provided fields
    const updatedQuestion = await prisma.fVisaQuestion.update({
      where: { id: id },
      data: {
        question: body.question ?? existingQuestion.question,
        answer: body.answer ?? existingQuestion.answer,
        order: body.order !== undefined ? body.order : existingQuestion.order,
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating F visa question order:', error);
    return NextResponse.json(
      { error: 'Failed to update question order' },
      { status: 500 }
    );
  }
}

// DELETE /api/visa/f-visa/questions/[id] - Delete a F visa question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the question exists
    const existingQuestion = await prisma.fVisaQuestion.findUnique({
      where: { id: id },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Delete the question
    await prisma.fVisaQuestion.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting F visa question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
} 