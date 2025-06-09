import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';


export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const published = searchParams.get('published');

    const whereClause: any = {};

    if (category) {
      whereClause.category = category;
    }

    if (published !== null) {
      whereClause.published = published === 'true';
    }

    const files = await prisma.file.findMany({
      where: whereClause,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Convert BigInt to string for JSON serialization
    const filesResponse = files.map(file => ({
      ...file,
      fileSize: file.fileSize.toString()
    }));

    return NextResponse.json(filesResponse);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      name,
      originalName,
      description,
      filePath,
      fileSize,
      mimeType,
      category,
      published = true,
      order = 0
    } = body;

    if (!name || !originalName || !filePath || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const file = await prisma.file.create({
      data: {
        name,
        originalName,
        description,
        filePath,
        fileSize: BigInt(fileSize || 0),
        mimeType,
        category,
        published,
        order,
      }
    });

    // Convert BigInt to string for JSON serialization
    const fileResponse = {
      ...file,
      fileSize: file.fileSize.toString()
    };

    return NextResponse.json(fileResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating file:', error);
    return NextResponse.json(
      { error: 'Failed to create file' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 