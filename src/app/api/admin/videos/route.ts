import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get all videos (admin)
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
    
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all videos
    const videos = await prisma.video.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Videos fetch error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching videos' },
      { status: 500 }
    );
  }
}

// Create a new video
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

    // Create video
    const video = await prisma.video.create({
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

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error('Video creation error:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the video' },
      { status: 500 }
    );
  }
} 