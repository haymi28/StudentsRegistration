
'use server';

import prisma from './prisma';
import { z } from 'zod';
import { getStudentRegistrationSchema } from './validations/student';
import { revalidatePath } from 'next/cache';
import { Student, User, Class, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getCreateUserSchema, getUpdateUserSchema } from './validations/user';
import { getCreateClassSchema } from './validations/class';
import { getRoleSchema } from './validations/role';
import { Prisma } from '@prisma/client';


type StudentData = z.infer<ReturnType<typeof getStudentRegistrationSchema>>;
type ClassData = z.infer<ReturnType<typeof getCreateClassSchema>>;
type RoleData = z.infer<ReturnType<typeof getRoleSchema>>;
type UserUpdateData = z.infer<ReturnType<typeof getUpdateUserSchema>>;


// Updated getStudents function
export async function getStudents(userId: string, role: Role) {
  const userPermissions = role.permissions as Record<string, boolean> || {};

  if (userPermissions.manage_all_students) {
    return await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
      include: { class: true },
    });
  }

  const userClass = await prisma.class.findFirst({
    where: { managerId: userId },
  });

  if (!userClass) return [];

  return await prisma.student.findMany({
    where: { classId: userClass.id },
    orderBy: { createdAt: 'desc' },
    include: { class: true },
  });
}

export async function getStudentById(id: string) {
  return await prisma.student.findUnique({
    where: { id },
    include: { class: true }
  });
}

export async function createStudent(data: StudentData) {
    const validatedData = getStudentRegistrationSchema().safeParse(data);
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
    const validationSchema = getStudentRegistrationSchema();
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
    const validatedData = getStudentRegistrationSchema().partial().safeParse(data);
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
    const users = await prisma.user.findMany({
        include: { role: true },
        orderBy: { createdAt: 'desc' }
    });

    if (excludeSuperAdmin) {
        return users.filter(user => user.role.name !== 'Super Admin');
    }
    
    return users;
}

export async function getUserById(id: string) {
    return await prisma.user.findUnique({ 
        where: { id },
        include: { role: true }
    });
}

export async function getUserByUsername(username: string) {
    return await prisma.user.findUnique({ 
        where: { username },
        include: { role: true }
    });
}

export async function updateUser(id: string, data: Partial<UserUpdateData>) {
  const validationSchema = getUpdateUserSchema();

  const validatedData = validationSchema.safeParse(data);

  if (!validatedData.success) {
      throw new Error('Invalid user data: ' + JSON.stringify(validatedData.error.issues, null, 2));
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
    const validationSchema = getCreateUserSchema();
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

    const { password, confirmPassword, ...userData } = validatedData.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            ...userData,
            password: hashedPassword,
        },
    });

    revalidatePath('/users');
}

export async function deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, include: { role: true }});
    if (user?.role.name === 'Super Admin') {
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
    const validationSchema = getCreateClassSchema();
    const validatedData = validationSchema.safeParse(data);
    
    if (!validatedData.success) {
        throw new Error('Invalid class data: ' + validatedData.error.message);
    }
    
    await prisma.class.create({ data: validatedData.data });
    revalidatePath('/classes');
}

export async function updateClass(id: string, data: ClassData) {
    const validationSchema = getCreateClassSchema();
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

// Role & Permission Functions

export async function getRoles() {
    return await prisma.role.findMany({
        include: {
            _count: { select: { users: true } },
        },
        orderBy: { name: 'asc' }
    });
}

export async function getRoleById(id: string) {
    return await prisma.role.findUnique({
        where: { id },
    });
}

export async function createRole(data: RoleData) {
    const { name, description, permissions } = data;
    
    const permissionsObject = permissions?.reduce((acc, perm) => {
        acc[perm] = true;
        return acc;
    }, {} as Record<string, boolean>) || {};

    await prisma.role.create({
        data: {
            name,
            description,
            permissions: permissionsObject,
        }
    });

    revalidatePath('/roles');
}

export async function updateRole(id: string, data: RoleData) {
    const { name, description, permissions } = data;

    const permissionsObject = permissions?.reduce((acc, perm) => {
        acc[perm] = true;
        return acc;
    }, {} as Record<string, boolean>) || {};


    await prisma.role.update({
        where: { id },
        data: { 
            name, 
            description, 
            permissions: permissionsObject,
        }
    });


    revalidatePath('/roles');
    revalidatePath(`/roles/edit/${id}`);
}


export async function deleteRole(id: string) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (['Super Admin', 'Admin', 'Teacher'].includes(role?.name || '')) {
        throw new Error("Cannot delete default system roles.");
    }
    const userCount = await prisma.user.count({ where: { roleId: id } });
    if (userCount > 0) {
        throw new Error("Cannot delete a role that is assigned to users.");
    }

    await prisma.role.delete({ where: { id } });
    revalidatePath('/roles');
}

    