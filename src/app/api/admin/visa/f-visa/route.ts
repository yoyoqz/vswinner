import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get F visa information
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

    // Fetch F visa information
    const visaInfo = await prisma.visaInfo.findFirst({
      where: { type: 'F_VISA' },
    });

    return NextResponse.json(visaInfo || {});
  } catch (error) {
    console.error('F visa info fetch error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching F visa information' },
      { status: 500 }
    );
  }
}

// Update F visa information
export async function PUT(request: Request) {
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
    const { title, content } = await request.json();

    // Validate request
    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    // Check if F visa info exists
    const existingInfo = await prisma.visaInfo.findFirst({
      where: { type: 'F_VISA' },
    });

    let visaInfo;
    
    if (existingInfo) {
      // Update existing info
      visaInfo = await prisma.visaInfo.update({
        where: { id: existingInfo.id },
        data: {
          title,
          content,
        },
      });
    } else {
      // Create new info
      visaInfo = await prisma.visaInfo.create({
        data: {
          type: 'F_VISA',
          title,
          content,
        },
      });
    }

    return NextResponse.json(visaInfo);
  } catch (error) {
    console.error('F visa info update error:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating F visa information' },
      { status: 500 }
    );
  }
} 