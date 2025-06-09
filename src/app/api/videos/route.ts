import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all published videos
export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      where: {
        published: true,
      },
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