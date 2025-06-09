import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get comments for a specific video
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    // Get comments for the video
    const comments = await prisma.comment.findMany({
      where: {
        videoId: videoId,
      },
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
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Video comments fetch error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching video comments' },
      { status: 500 }
    );
  }
}

// Create a new comment for a specific video
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: videoId } = await params;

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    // Get request body
    const { content } = await request.json();

    // Validate request
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { message: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: payload.id,
        videoId: videoId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Video comment creation error:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the comment' },
      { status: 500 }
    );
  }
} 