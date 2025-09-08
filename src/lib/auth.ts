
'use server';

import { cookies } from 'next/headers';
import prisma from './prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-bytes-long';
const COOKIE_NAME = 'session';

type UserWithRole = User & { role: Role };

type TokenPayload = {
  id: string;
  username: string;
  displayName: string;
  role: {
    name: string;
    permissions: Record<string, boolean>;
  };
};

// -------------------- SIGN IN --------------------
export async function signIn(credentials: { username: string; password: string }, reauth = false) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: credentials.username },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      return { success: false, error: 'Invalid username or password' };
    }

    if (!reauth) {
        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordsMatch) {
            return { success: false, error: 'Invalid username or password' };
        }
    }


    const { password, ...userWithoutPassword } = user;

    const tokenPayload: TokenPayload = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: {
        name: user.role.name,
        permissions: user.role.permissions as Record<string, boolean>,
      },
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

    (await cookies()).set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax',
    });

    return { success: true, user: userWithoutPassword };
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
  const token = (await cookies()).get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return { user: decoded };
  } catch (error) {
    console.error('JWT verify error:', error);
    (await cookies()).delete(COOKIE_NAME);
    return null;
  }
}
