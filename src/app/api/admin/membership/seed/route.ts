import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { seedMembershipPlans, resetMembershipPlans } from '@/lib/seedMemberships';

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
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

    const { action } = await request.json();

    let result;
    if (action === 'reset') {
      result = await resetMembershipPlans();
    } else {
      result = await seedMembershipPlans();
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action === 'reset' ? 'reset' : 'seeded'} membership plans`,
      plans: result,
    });

  } catch (error) {
    console.error('Membership seed error:', error);
    return NextResponse.json(
      { message: 'An error occurred while seeding membership plans' },
      { status: 500 }
    );
  }
} 