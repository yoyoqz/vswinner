import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/visa/info - Get visa information by type
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json(
        { error: 'Visa type is required' },
        { status: 400 }
      );
    }

    const visaInfo = await prisma.visaInfo.findFirst({
      where: { 
        // Use type as a string since we know it's valid in this context
        type: type as any
      },
    });

    if (!visaInfo) {
      return NextResponse.json(
        { error: 'Visa information not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(visaInfo);
  } catch (error) {
    console.error('Error fetching visa information:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visa information' },
      { status: 500 }
    );
  }
} 