'use server';

import { cookies } from 'next/headers';
import prisma from './prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-bytes-long';
const COOKIE_NAME = 'session';

type TokenPayload = {
  id: string;
  username: string;
  role: string;
};

// -------------------- SIGN IN --------------------
export async function signIn(credentials: { username: string; password: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: credentials.username },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      return { success: false, error: 'Invalid username or password' };
    }

    const passwordsMatch = await bcrypt.compare(credentials.password, user.password);
    if (!passwordsMatch) {
      return { success: false, error: 'Invalid username or password' };
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role.name,
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

    (await cookies()).set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax',
    });

    
console.log('JWT Cookie set:', (await cookies()).get(COOKIE_NAME));


    return { success: true, user: tokenPayload };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// -------------------- SIGN OUT --------------------
export async function signOut() {
  (await cookies()).delete(COOKIE_NAME);
}

// -------------------- GET SERVER SESSION --------------------
export async function getServerSession(): Promise<{ user: TokenPayload } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
   console.log('Token from cookie:', token); // Add this

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return { user: decoded };
  } catch (error) {
    console.error('JWT verify error:', error);
    cookieStore.delete(COOKIE_NAME);
    return null;
  }
}
