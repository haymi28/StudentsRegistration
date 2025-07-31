
'use server';

import prisma from './prisma';
import { z } from 'zod';
import { getStudentRegistrationSchema } from './validations/student';
import { revalidatePath } from 'next/cache';

type StudentData = z.infer<ReturnType<typeof getStudentRegistrationSchema>>;

export async function getStudents() {
  return await prisma.student.findMany({
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

export async function importStudents(students: Partial<StudentData>[]) {
    const validationSchema = getStudentRegistrationSchema(() => '');
    const validatedStudents = students.map(student => {
        const result = validationSchema.safeParse(student);
        if (!result.success) {
            console.error("Invalid student data during import:", result.error.flatten().fieldErrors);
            return null;
        }
        return result.data;
    }).filter(Boolean) as StudentData[];

    if (validatedStudents.length > 0) {
        await prisma.student.createMany({
            data: validatedStudents,
            skipDuplicates: true,
        });
        revalidatePath('/students');
    }
}


export async function updateStudent(id: string, data: StudentData) {
    const validatedData = getStudentRegistrationSchema(() => '').safeParse(data);
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
    return await prisma.user.findMany();
}

export async function getUserByUsername(username: string) {
    return await prisma.user.findUnique({ where: { username }});
}

export async function updateUser(id: string, data: { displayName?: string, password?: string }) {
    
    const dataToUpdate: { displayName?: string; password?: string } = {};

    if (data.displayName) {
        dataToUpdate.displayName = data.displayName;
    }
    if (data.password) {
        // Password hashing would happen here, but removed since bcrypt is removed
        dataToUpdate.password = data.password;
    }

    await prisma.user.update({
        where: { id },
        data: dataToUpdate
    });
    revalidatePath('/account');
}
