
'use server';

import { cookies } from 'next/headers';
import { getUserByUsername } from './data';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = 'session';

export async function signIn(credentials: { username: string; password: string }): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    const user = await getUserByUsername(credentials.username);

    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

    if (!passwordsMatch) {
      return { success: false, error: 'Invalid username or password' };
    }

    const { password, ...userWithoutPassword } = user;

    const token = jwt.sign(userWithoutPassword, JWT_SECRET, {
      expiresIn: '1d', // Token expires in 1 day
    });

    const cookieStore = cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day in seconds
      path: '/',
    });

    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function signOut() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
  // Also clear relevant local storage on sign out
}

export async function getServerSession(): Promise<{ user: Omit<User, 'password'> } | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Omit<User, 'password'>;
    return { user: decoded };
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}
