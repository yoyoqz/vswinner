import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get a specific video
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;

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
    
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the video
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error('Video fetch error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the video' },
      { status: 500 }
    );
  }
}

// Update a video
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;

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
    
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const { title, description, url, thumbnail, duration, published, order } = await request.json();

    // Validate request
    if (!title || !url) {
      return NextResponse.json(
        { message: 'Title and URL are required' },
        { status: 400 }
      );
    }

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!existingVideo) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    // Update video
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        title,
        description,
        url,
        thumbnail,
        duration: duration ? parseInt(duration) : null,
        published: published !== undefined ? published : true,
        order: order ? parseInt(order) : 0,
      },
    });

    return NextResponse.json(updatedVideo);
  } catch (error) {
    console.error('Video update error:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the video' },
      { status: 500 }
    );
  }
}

// Delete a video
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;

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
    
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!existingVideo) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    // Delete video
    await prisma.video.delete({
      where: { id: videoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Video deletion error:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the video' },
      { status: 500 }
    );
  }
} 