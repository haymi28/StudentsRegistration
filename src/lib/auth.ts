'use server'

import { cookies } from 'next/headers'
import { getUserByUsername } from './data';

export type UserRole = 'super_admin' | 'children_admin' | 'children_2_admin' | 'junior_admin' | 'senior_admin';
export type ServiceDepartment = 'ቀዳማይ -1 ክፍል' | 'ቀዳማይ -2 ክፍል' | 'ካእላይ ክፍል' | 'ማእከላይ ክፍል' | 'የወጣት ክፍል';

export const roleToServiceDepartmentMap: Record<Exclude<UserRole, 'super_admin'>, ServiceDepartment> = {
  children_admin: 'ቀዳማይ -1 ክፍል',
  children_2_admin: 'ቀዳማይ -2 ክፍል',
  junior_admin: 'ካእላይ ክፍል',
  senior_admin: 'ማእከላይ ክፍል',
};

export const serviceDepartmentTransferMap: Partial<Record<ServiceDepartment, ServiceDepartment>> = {
  'ቀዳማይ -1 ክፍል': 'ቀዳማይ -2 ክፍል',
  'ቀዳማይ -2 ክፍል': 'ካእላይ ክፍል',
  'ካእላይ ክፍል': 'ማእከላይ ክፍል',
  'ማእከላይ ክፍል': 'የወጣት ክፍል',
};


export async function signIn(credentials: {username: string, password: string}): Promise<{success: boolean, error?: string, user?: any}> {
    const user = await getUserByUsername(credentials.username);

    if (!user || user.password !== credentials.password) {
        return { success: false, error: 'Invalid username or password' };
    }
    
    // In a real app, use JWTs or a session library. For this, we'll set simple cookies.
    cookies().set('auth_token', user.id, { httpOnly: true, path: '/' });
    cookies().set('user_role', user.role, { httpOnly: true, path: '/' });
    cookies().set('username', user.username, { httpOnly: true, path: '/' });
    cookies().set('displayName', user.displayName, { httpOnly: true, path: '/' });
    localStorage.setItem('auth_token', user.id);
    localStorage.setItem('user_role', user.role);
    localStorage.setItem('username', user.username);


    return { success: true, user: { ...user, serviceDepartment: roleToServiceDepartmentMap[user.role as Exclude<UserRole, 'super_admin'>] } };
}

export async function signOut() {
    cookies().delete('auth_token');
    cookies().delete('user_role');
    cookies().delete('username');
    cookies().delete('displayName');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
}

export async function getServerSession() {
    const token = cookies().get('auth_token');
    const role = cookies().get('user_role');
    const username = cookies().get('username');
    const displayName = cookies().get('displayName');

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
