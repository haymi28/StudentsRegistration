
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
  assignedClassId: string | null;
  requiresPasswordChange: boolean;
};

interface SignInResult {
    success: boolean;
    user?: Omit<UserWithRole, 'password'>;
    error?: string;
    errorType?: 'inactive' | 'credentials';
    landingPage?: string;
}

// -------------------- SIGN IN --------------------
export async function signIn(credentials: { username: string; password: string }, reauth = false): Promise<SignInResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { username: credentials.username },
      include: { role: true, managedClasses: { select: { id: true }, take: 1 } },
    });

    if (!user) {
      return { success: false, error: 'login.failDescription', errorType: 'credentials' };
    }
    
    if (!user.isActive) {
        return { success: false, errorType: 'inactive' };
    }

    if (!reauth) {
        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordsMatch) {
            return { success: false, error: 'login.failDescription', errorType: 'credentials' };
        }
    }

    const { password, ...userWithoutPassword } = user;
    const assignedClassId = user.managedClasses[0]?.id || null;

    const tokenPayload: TokenPayload = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: {
        name: user.role.name,
        permissions: user.role.permissions as Record<string, boolean>,
      },
      assignedClassId,
      requiresPasswordChange: user.requiresPasswordChange,
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

    (await cookies()).set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax',
    });

    return { 
        success: true, 
        user: userWithoutPassword, 
        landingPage: await getLandingPage(userWithoutPassword as any) 
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'common.errorDescription', errorType: 'credentials' };
  }
}

// -------------------- REFRESH SESSION --------------------
export async function refreshSession() {
  try {
    const session = await getServerSession();
    if (!session) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        displayName: true,
        isActive: true,
        requiresPasswordChange: true,
        role: true,
        managedClasses: { select: { id: true }, take: 1 }
      }
    });

    if (!user || !user.isActive) {
      (await cookies()).delete(COOKIE_NAME);
      return null;
    }

    const assignedClassId = user.managedClasses[0]?.id || null;

    const tokenPayload: TokenPayload = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: {
        name: user.role.name,
        permissions: user.role.permissions as Record<string, boolean>,
      },
      assignedClassId,
      requiresPasswordChange: user.requiresPasswordChange,
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

    (await cookies()).set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax',
    });

    return { 
      user: user, 
      landingPage: await getLandingPage(user as any) 
    };
  } catch (error) {
    console.error('Refresh session error:', error);
    return null;
  }
}

// -------------------- SIGN OUT --------------------
export async function signOut() {
  (await cookies()).delete(COOKIE_NAME);
}

// -------------------- GET SERVER SESSION --------------------
export async function getServerSession(): Promise<{ user: TokenPayload } | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;

  // Validate token format before verifying
  if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
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

// -------------------- RBAC HELPERS --------------------
import { notFound, redirect } from 'next/navigation';

export async function checkPermission(permission: string): Promise<boolean> {
  const session = await getServerSession();
  if (!session) return false;
  
  if (session.user.role.name === 'Super Admin') return true;
  
  const permissions = session.user.role.permissions as Record<string, boolean>;
  return !!permissions?.[permission];
}

export async function requirePermission(permission: string) {
  const session = await getServerSession();
  if (!session) {
    redirect('/');
  }
  
  if (session.user.role.name === 'Super Admin') return session;
  
  const permissions = session.user.role.permissions as Record<string, boolean>;
  if (!permissions?.[permission]) {
    notFound(); // Returns 404 for unauthorized access to hide admin routes
  }
  
  return session;
}

export async function requireAnyPermission(permissionsList: string[]) {
    const session = await getServerSession();
    if (!session) {
      redirect('/');
    }
    
    if (session.user.role.name === 'Super Admin') return session;
    
    const userPermissions = session.user.role.permissions as Record<string, boolean>;
    const hasAny = permissionsList.some(p => userPermissions?.[p]);
    
    if (!hasAny) {
      notFound();
    }
    
    return session;
}

// -------------------- LANDING PAGE HELPERS --------------------

const ROUTE_PRIORITY = [
  { href: '/dashboard', permission: 'view_dashboard' },
  { href: '/students', permission: 'view_students' },
  { href: '/register', permission: 'manage_class_students' },
  { href: '/settings', permissions: ['manage_classes', 'manage_users', 'manage_roles'] },
  { href: '/students/import', permission: 'import_students_text' },
  { href: '/students/export', permission: 'export_students_text' },
  { href: '/students/import-photos', permission: 'import_students_photos' },
  { href: '/students/export-photos', permission: 'export_students_photos' },
  { href: '/account', always: true },
];

export async function getLandingPage(user: TokenPayload | Omit<UserWithRole, 'password'>) {
    const isSuperAdmin = 'role' in user && typeof user.role === 'object' && user.role !== null && 'name' in user.role && user.role.name === 'Super Admin';
    
    if (isSuperAdmin) {
        return '/dashboard';
    }

    const permissions = 'role' in user && typeof user.role === 'object' && user.role !== null && 'permissions' in user.role 
        ? (user.role.permissions as Record<string, boolean>) 
        : {};

    for (const route of ROUTE_PRIORITY) {
        if (route.always) return route.href;
        
        if (route.permission && permissions[route.permission]) {
            return route.href;
        }
        
        if (route.permissions && route.permissions.some(p => permissions[p])) {
            return route.href;
        }
    }

    return '/account'; // Absolute fallback
}
