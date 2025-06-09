import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/blog - Get published blog posts for public view
export async function GET() {
  try {
    const posts = await prisma.blog.findMany({
      where: {
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    // Convert dates to strings for client-side consumption
    const serializedPosts = posts.map(post => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));

    return NextResponse.json(serializedPosts);
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 