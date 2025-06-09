import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { lookup } from 'mime-types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePath } = await params;
    
    if (!filePath || filePath.length === 0) {
      return NextResponse.json(
        { error: 'File path not provided' },
        { status: 400 }
      );
    }

    // Join the path segments
    const requestedPath = filePath.join('/');
    
    // Resolve the full file path
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const fullPath = path.join(uploadsDir, requestedPath);
    
    // Security check: ensure the path is within uploads directory
    if (!fullPath.startsWith(uploadsDir)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await fs.readFile(fullPath);
    
    // Get MIME type
    const mimeType = lookup(fullPath) || 'application/octet-stream';
    
    // Return the file
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 