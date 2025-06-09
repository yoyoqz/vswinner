import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const whereClause: any = {
      published: true,
    };

    if (category) {
      whereClause.category = category;
    }

    const files = await prisma.file.findMany({
      where: whereClause,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        originalName: true,
        description: true,
        fileSize: true,
        mimeType: true,
        category: true,
        downloadCount: true,
        createdAt: true,
        updatedAt: true,
      }
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
  }
} 