import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { checkAIUsageLimit } from '@/lib/aiSuggestions';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usageLimit = await checkAIUsageLimit(currentUser.id);
    
    return NextResponse.json({
      success: true,
      ...usageLimit
    });

  } catch (error) {
    console.error('Error checking AI usage limit:', error);
    return NextResponse.json(
      { message: 'An error occurred while checking AI usage limit' },
      { status: 500 }
    );
  }
} 