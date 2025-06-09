import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// Types
export type JwtPayload = {
  id: string;
  email: string;
  role: string;
  name?: string;
};

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production';
const TOKEN_EXPIRY = '7d';
const COOKIE_NAME = 'auth_token';

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

// Compare password with hash
export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (e) {
    console.error("Token verification failed:", e);
    return null;
  }
};

// Set auth cookie
// export const setAuthCookie = async (token: string): Promise<void> => {
//   const cookieStore = await cookies();
//   cookieStore.set({
//     name: COOKIE_NAME,
//     value: token,
//     httpOnly: true,
//     path: '/',
//     secure: process.env.NODE_ENV === 'production',
//     maxAge: 60 * 60 * 24 * 7, // 7 days
//   });
// };

// Get auth token from cookies
export const getAuthToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
};

// Remove auth cookie
export const removeAuthCookie = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
};

// Get current user from token
export const getCurrentUser = async (): Promise<JwtPayload | null> => {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}; 