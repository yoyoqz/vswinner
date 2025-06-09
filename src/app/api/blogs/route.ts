import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/blogs - Get all blog posts
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === 'ADMIN';
    
    // If admin, return all blogs; otherwise, only published ones
    const blogs = await prisma.blog.findMany({
      where: isAdmin ? {} : { published: true },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(blogs);
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create a new blog post
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    // Only admins can create blog posts
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, slug, content, summary, published, authorId } = body;

    // Validate required fields
    if (!title || !slug || !content || !authorId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug is already in use
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (existingBlog) {
      return NextResponse.json(
        { message: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Create the new blog post
    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        summary,
        published: published || false,
        authorId,
      },
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 