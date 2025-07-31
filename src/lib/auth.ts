'use server'

import { getUserByUsername, getUsers } from './data';
import { UserRole, ServiceDepartment, roleToServiceDepartmentMap } from './constants';
import { User } from '@prisma/client';

// DUMMY AUTH IMPLEMENTATION

export async function signIn(credentials: {username: string, password: string}): Promise<{success: boolean, error?: string, user?: any}> {
    const user = await getUserByUsername(credentials.username);

    if (!user || user.password !== credentials.password) {
        return { success: false, error: 'Invalid username or password' };
    }
    
    // The user object will be stored in localStorage on the client
    return { success: true, user: { ...user, serviceDepartment: roleToServiceDepartmentMap[user.role as Exclude<UserRole, 'super_admin'>] } };
}

export async function signOut() {
    // This function is now a placeholder.
    // The client will clear localStorage.
}

export async function getServerSession(): Promise<{ isAuthenticated: boolean; user: any } | null> {
  // This is a dummy session for server components.
  // In a real app, you'd fetch this from cookies or a session store.
  // For this project, we primarily rely on client-side session management.
  const users = await getUsers();
  if (users.length > 0) {
    const user = users[0];
    return {
        isAuthenticated: true,
        user: {
            id: user.id,
            role: user.role,
            username: user.username,
            displayName: user.displayName,
            serviceDepartment: user.role !== 'super_admin' ? roleToServiceDepartmentMap[user.role as Exclude<UserRole, 'super_admin'>] : undefined
        }
    };
  }
  return null;
}
