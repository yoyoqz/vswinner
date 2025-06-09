import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await params;

    const file = await prisma.file.findUnique({
      where: { id }
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Convert BigInt to string for JSON serialization
    const fileResponse = {
      ...file,
      fileSize: file.fileSize.toString()
    };

    return NextResponse.json(fileResponse);
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      originalName,
      description,
      filePath,
      fileSize,
      mimeType,
      category,
      published,
      order
    } = body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (originalName !== undefined) updateData.originalName = originalName;
    if (description !== undefined) updateData.description = description;
    if (filePath !== undefined) updateData.filePath = filePath;
    if (fileSize !== undefined) updateData.fileSize = BigInt(fileSize);
    if (mimeType !== undefined) updateData.mimeType = mimeType;
    if (category !== undefined) updateData.category = category;
    if (published !== undefined) updateData.published = published;
    if (order !== undefined) updateData.order = order;

    const file = await prisma.file.update({
      where: { id },
      data: updateData
    });

    // Convert BigInt to string for JSON serialization
    const fileResponse = {
      ...file,
      fileSize: file.fileSize.toString()
    };

    return NextResponse.json(fileResponse);
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await params;

    await prisma.file.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 