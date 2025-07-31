'use server'

import { cookies } from 'next/headers'
import { getUserByUsername } from './data';
import { UserRole, ServiceDepartment, roleToServiceDepartmentMap } from './constants';


export async function signIn(credentials: {username: string, password: string}): Promise<{success: boolean, error?: string, user?: any}> {
    const user = await getUserByUsername(credentials.username);

    if (!user || user.password !== credentials.password) {
        return { success: false, error: 'Invalid username or password' };
    }
    
    const cookieStore = await cookies();
    cookieStore.set('auth_token', user.id, { httpOnly: true, path: '/' });
    cookieStore.set('user_role', user.role, { httpOnly: true, path: '/' });
    
    return { success: true, user: { ...user, serviceDepartment: roleToServiceDepartmentMap[user.role as Exclude<UserRole, 'super_admin'>] } };
}

export async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('user_role');
}

export async function getServerSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    const role = cookieStore.get('user_role');
    const username = cookieStore.get('username');
    const displayName = cookieStore.get('displayName');

    if (!token?.value || !role?.value) {
        return null;
    }

    // Since username and displayName are not in httpOnly cookies, we might not have them server-side post-login.
    // The important parts for session validation are the httpOnly cookies.
    // The client will have username/displayName in localStorage.
    
    const user = await getUserByUsername(username?.value || '');
    
    if (!user) {
        // This case can happen if the user was deleted but cookies remain.
        return null;
    }

    return {
        isAuthenticated: true,
        user: {
            id: token.value,
            role: role.value,
            username: user.username,
            displayName: user.displayName,
            serviceDepartment: role.value !== 'super_admin' ? roleToServiceDepartmentMap[role.value as Exclude<UserRole, 'super_admin'>] : undefined
        }
    };
}
