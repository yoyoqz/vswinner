import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/blogs/[id] - Get a blog post by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === 'ADMIN';

    const blog = await prisma.blog.findUnique({
      where: { id },
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

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog post not found' },
        { status: 404 }
      );
    }

    // If the blog is not published and the user is not an admin, don't allow access
    if (!blog.published && !isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(blog);
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/blogs/[id] - Update a blog post
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    // Only admins can update blog posts
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { title, slug, content, summary, published } = body;

    // Validate the blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return NextResponse.json(
        { message: 'Blog post not found' },
        { status: 404 }
      );
    }

    // If slug is being updated, check it's not already in use by another blog
    if (slug && slug !== existingBlog.slug) {
      const slugExists = await prisma.blog.findUnique({
        where: { slug },
      });

      if (slugExists && slugExists.id !== id) {
        return NextResponse.json(
          { message: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update the blog post
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(content && { content }),
        ...(summary !== undefined && { summary }),
        ...(published !== undefined && { published }),
      },
    });

    return NextResponse.json(updatedBlog);
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Delete a blog post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    // Only admins can delete blog posts
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate the blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return NextResponse.json(
        { message: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Delete the blog post
    await prisma.blog.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Blog post deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 