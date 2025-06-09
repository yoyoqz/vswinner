import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all active membership plans
export async function GET() {
  try {
    const memberships = await prisma.membership.findMany({
      where: {
        active: true,
      },
      orderBy: [
        { order: 'asc' },
        { price: 'asc' },
      ],
    });

    return NextResponse.json(memberships);
  } catch (error) {
    console.error('Membership fetch error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching membership plans' },
      { status: 500 }
    );
  }
} 