import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get all memberships (admin)
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

    // Fetch all memberships with user count
    const memberships = await prisma.membership.findMany({
      include: {
        _count: {
          select: {
            userMemberships: true,
            payments: true,
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(memberships);
  } catch (error) {
    console.error('Membership fetch error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching memberships' },
      { status: 500 }
    );
  }
}

// Create a new membership
export async function POST(request: Request) {
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
    const { name, description, price, duration, features, active, order } = await request.json();

    // Validate request
    if (!name || !price || !duration) {
      return NextResponse.json(
        { message: 'Name, price, and duration are required' },
        { status: 400 }
      );
    }

    // Create membership
    const membership = await prisma.membership.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        features: Array.isArray(features) ? features : [],
        active: active !== undefined ? active : true,
        order: order ? parseInt(order) : 0,
      },
    });

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error('Membership creation error:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the membership' },
      { status: 500 }
    );
  }
} 