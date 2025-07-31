
'use server'

import { cookies } from 'next/headers'
import { getUserByUsername } from './data';
import { UserRole, ServiceDepartment, roleToServiceDepartmentMap } from './constants';


export async function signIn(credentials: {username: string, password: string}): Promise<{success: boolean, error?: string, user?: any}> {
    const user = await getUserByUsername(credentials.username);

    if (!user || user.password !== credentials.password) {
        return { success: false, error: 'Invalid username or password' };
    }
    
    // In a real app, use JWTs or a session library. For this, we'll set simple cookies.
    const cookieStore = cookies();
    cookieStore.set('auth_token', user.id, { httpOnly: true, path: '/' });
    cookieStore.set('user_role', user.role, { httpOnly: true, path: '/' });
    cookieStore.set('username', user.username, { httpOnly: true, path: '/' });
    cookieStore.set('displayName', user.displayName, { httpOnly: true, path: '/' });
    
    return { success: true, user: { ...user, serviceDepartment: roleToServiceDepartmentMap[user.role as Exclude<UserRole, 'super_admin'>] } };
}

export async function signOut() {
    const cookieStore = cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('user_role');
    cookieStore.delete('username');
    cookieStore.delete('displayName');
}

export async function getServerSession() {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');
    const role = cookieStore.get('user_role');
    const username = cookieStore.get('username');
    const displayName = cookieStore.get('displayName');

    if (!token || !role || !username || !displayName) {
        return null;
    }

    return {
        isAuthenticated: true,
        user: {
            id: token.value,
            role: role.value,
            username: username.value,
            displayName: displayName.value,
            serviceDepartment: role.value !== 'super_admin' ? roleToServiceDepartmentMap[role.value as Exclude<UserRole, 'super_admin'>] : undefined
        }
    };
}
