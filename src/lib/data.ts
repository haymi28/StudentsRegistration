'use server';

import prisma from './prisma';
import { z } from 'zod';
import { getStudentRegistrationSchema } from './validations/student';
import { revalidatePath } from 'next/cache';
import { UserRole } from './constants';
import { roleToServiceDepartmentMap } from './constants';
import { User } from '@prisma/client';

type StudentData = z.infer<ReturnType<typeof getStudentRegistrationSchema>>;

export async function getStudents(role: UserRole) {
  if (role === 'super_admin') {
    return await prisma.student.findMany({
        orderBy: { createdAt: 'desc'}
    });
  }
  
  const department = roleToServiceDepartmentMap[role as Exclude<UserRole, 'super_admin'>];
  
  return await prisma.student.findMany({
    where: { serviceDepartment: department },
    orderBy: { createdAt: 'desc'}
  });
}

export async function getStudentById(id: string) {
  return await prisma.student.findUnique({
    where: { id },
  });
}

export async function createStudent(data: StudentData) {
    const validatedData = getStudentRegistrationSchema(() => '').safeParse(data);
    if (!validatedData.success) {
        throw new Error('Invalid student data');
    }

    const existingStudent = await prisma.student.findUnique({
        where: { registrationNumber: validatedData.data.registrationNumber }
    });

    if (existingStudent) {
        throw new Error('A student with this registration number already exists.');
    }

    await prisma.student.create({ data: validatedData.data });
    revalidatePath('/students');
}

export async function importStudents(students: Partial<Student>[]) {
    const validationSchema = getStudentRegistrationSchema(() => '');
    const validatedStudents: StudentData[] = [];

    for (const student of students) {
        const result = validationSchema.safeParse(student);
        if (result.success) {
            validatedStudents.push(result.data);
        } else {
             console.error("Invalid student data during import:", result.error.flatten().fieldErrors);
        }
    }

    if (validatedStudents.length > 0) {
        await prisma.$transaction(
            validatedStudents.map(student =>
                prisma.student.create({
                    data: student,
                })
            )
        );
        revalidatePath('/students');
    }
}


export async function updateStudent(id: string, data: Partial<StudentData>) {
    const validatedData = getStudentRegistrationSchema(() => '').partial().safeParse(data);
    if (!validatedData.success) {
        throw new Error('Invalid student data');
    }
    await prisma.student.update({ where: { id }, data: validatedData.data });
    revalidatePath('/students');
    revalidatePath(`/students/edit/${id}`);
}

export async function deleteStudent(id: string) {
    await prisma.student.delete({ where: { id }});
    revalidatePath('/students');
}


// User Functions
export async function getUsers() {
    return await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            role: true,
            displayName: true,
            createdAt: true,
            updatedAt: true,
        }
    });
}

export async function getUserByUsername(username: string) {
    return await prisma.user.findUnique({ where: { username }});
}

export async function updateUser(id: string, data: { displayName?: string, password?: string }) {
    await prisma.user.update({
        where: { id },
        data
    });
    revalidatePath('/account');
}

export async function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    const existingUser = await prisma.user.findUnique({
        where: { username: data.username },
    });

    if (existingUser) {
        throw new Error('User with this username already exists.');
    }

    return prisma.user.create({
        data,
    });
}
