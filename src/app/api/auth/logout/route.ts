import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

export async function GET() {
  // Remove auth cookie
  removeAuthCookie();
  
  // Redirect to home page
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
} 