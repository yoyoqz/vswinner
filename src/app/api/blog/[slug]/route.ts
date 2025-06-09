import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/blog/[slug] - Get a published blog post by slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await prisma.blog.findUnique({
      where: {
        slug,
        published: true,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { message: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Convert dates to strings for client-side consumption
    const serializedPost = {
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };

    return NextResponse.json(serializedPost);
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 