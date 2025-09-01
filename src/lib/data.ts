
'use server';

import prisma from './prisma';
import { z } from 'zod';
import { getStudentRegistrationSchema } from './validations/student';
import { revalidatePath } from 'next/cache';
import { UserRole } from './constants';
import { Student, User, Class } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getCreateUserSchema, getUpdateUserSchema } from './validations/user';
import { getCreateClassSchema } from './validations/class';


type StudentData = z.infer<ReturnType<typeof getStudentRegistrationSchema>>;
type ClassData = z.infer<ReturnType<typeof getCreateClassSchema>>;

export async function getStudents(userId: string, role: UserRole) {
  if (role === 'super_admin') {
    return await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
      include: { class: true }
    });
  }

  const userClass = await prisma.class.findFirst({
    where: { managerId: userId }
  });

  if (!userClass) {
    return [];
  }

  return await prisma.student.findMany({
    where: { classId: userClass.id },
    orderBy: { createdAt: 'desc' },
    include: { class: true }
  });
}

export async function getStudentById(id: string) {
  return await prisma.student.findUnique({
    where: { id },
    include: { class: true }
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
export async function getUsers(excludeSuperAdmin = false) {
    return await prisma.user.findMany({
        where: excludeSuperAdmin ? { role: { not: 'super_admin' } } : {},
        orderBy: { createdAt: 'desc' }
    });
}

export async function getUserById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
}

export async function getUserByUsername(username: string) {
    return await prisma.user.findUnique({ where: { username }});
}

export async function updateUser(id: string, data: Partial<z.infer<ReturnType<typeof getUpdateUserSchema>>>) {
    const validationSchema = getUpdateUserSchema(() => '');
    const validatedData = validationSchema.safeParse(data);

    if (!validatedData.success) {
        throw new Error('Invalid user data: ' + validatedData.error.message);
    }
    
    const { password, ...rest } = validatedData.data;

    const dataToUpdate: any = { ...rest };

    if (password) {
        dataToUpdate.password = await bcrypt.hash(password, 10);
    }
    
    await prisma.user.update({
        where: { id },
        data: dataToUpdate
    });
    revalidatePath('/account');
    revalidatePath('/users');
    revalidatePath(`/users/edit/${id}`);
}

export async function createUser(data: z.infer<ReturnType<typeof getCreateUserSchema>>) {
    const validationSchema = getCreateUserSchema(() => '');
    const validatedData = validationSchema.safeParse(data);

    if (!validatedData.success) {
        throw new Error('Invalid user data: ' + validatedData.error.message);
    }

    const existingUser = await prisma.user.findUnique({
        where: { username: validatedData.data.username },
    });

    if (existingUser) {
        throw new Error('User with this username already exists.');
    }

    const hashedPassword = await bcrypt.hash(validatedData.data.password, 10);

    await prisma.user.create({
        data: {
            ...validatedData.data,
            password: hashedPassword,
            serviceDepartment: null
        },
    });

    revalidatePath('/users');
}

export async function deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id }});
    if (user?.username === 'superadmin') {
        throw new Error("Cannot delete the default super administrator.");
    }
    await prisma.user.delete({ where: { id }});
    revalidatePath('/users');
    revalidatePath('/classes');
}


// Class Functions
export async function getClasses() {
  return await prisma.class.findMany({
    include: {
      manager: true,
      _count: {
        select: { students: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getClassById(id: string) {
    return await prisma.class.findUnique({
        where: { id },
        include: { manager: true }
    });
}

export async function createClass(data: ClassData) {
    const validationSchema = getCreateClassSchema(() => '');
    const validatedData = validationSchema.safeParse(data);
    
    if (!validatedData.success) {
        throw new Error('Invalid class data: ' + validatedData.error.message);
    }
    
    await prisma.class.create({ data: validatedData.data });
    revalidatePath('/classes');
}

export async function updateClass(id: string, data: ClassData) {
    const validationSchema = getCreateClassSchema(() => '');
    const validatedData = validationSchema.safeParse(data);

    if (!validatedData.success) {
        throw new Error('Invalid class data: ' + validatedData.error.message);
    }

    await prisma.class.update({
        where: { id },
        data: validatedData.data
    });
    revalidatePath('/classes');
    revalidatePath(`/classes/edit/${id}`);
}

export async function deleteClass(id: string) {
    const studentCount = await prisma.student.count({ where: { classId: id } });
    if (studentCount > 0) {
        throw new Error("Cannot delete a class with students assigned to it.");
    }
    await prisma.class.delete({ where: { id }});
    revalidatePath('/classes');
}

export async function transferStudentsToClass(studentIds: string[], targetClassId: string) {
    await prisma.student.updateMany({
        where: {
            id: {
                in: studentIds,
            },
        },
        data: {
            classId: targetClassId,
        },
    });
    revalidatePath('/students');
}
