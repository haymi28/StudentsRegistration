

'use server';

import prisma from './prisma';
import { z } from 'zod';
import { getStudentRegistrationSchema, StudentValidationTranslations } from './validations/student';
import { revalidatePath } from 'next/cache';
import { Student, User, Class, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getUpdateProfileSchema } from './validations/user';
import { updateUserSchema as serverUpdateUserSchema, createUserSchema as serverCreateUserSchema } from './validations/user-server';
import { getCreateClassSchema } from './validations/class';
import { getRoleSchema } from './validations/role';
import { Prisma } from '@prisma/client';

type StudentFormValues = z.infer<ReturnType<typeof getStudentRegistrationSchema>>;
type ClassData = z.infer<ReturnType<typeof getCreateClassSchema>>;
type RoleData = { name: string; description?: string | null; permissions: Prisma.JsonObject };
type UserUpdateData = z.infer<typeof serverUpdateUserSchema>;


// Updated getStudents function
export async function getStudents(userId?: string, role?: Role, classId?: string) {
  let whereClause: Prisma.StudentWhereInput = {};

  if (role && !(role.permissions as Record<string, boolean>)?.manage_all_students) {
    const userClass = await prisma.class.findFirst({
      where: { managerId: userId },
    });
    if (!userClass) return [];
    whereClause.classId = userClass.id;
  } else if (classId && classId !== 'all') {
    whereClause.classId = classId;
  }
  
  return await prisma.student.findMany({
    where: whereClause,
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

export async function createStudent(data: StudentFormValues) {
    const validatedData = getStudentRegistrationSchema({}).safeParse(data);
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

export async function importStudents(students: Partial<Student & { className: string }>[]) {
    // Server-side validation, no translations
    const validationSchema = getStudentRegistrationSchema();
    const classes = await getClasses();
    const classMap = new Map(classes.map(c => [c.name.toLowerCase(), c.id]));
    
    const validatedStudents: StudentFormValues[] = [];

    for (const student of students) {
        const studentWithClassId = { ...student };
        const className = student.className?.toLowerCase();
        
        if (className && classMap.has(className)) {
          studentWithClassId.classId = classMap.get(className);
        }

        const result = validationSchema.safeParse(studentWithClassId);
        if (result.success) {
            validatedStudents.push(result.data as StudentFormValues);
        } else {
             console.error("Invalid student data during import:", result.error.flatten().fieldErrors);
             throw new Error("Validation failed for some students.");
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


export async function updateStudent(id: string, data: Partial<StudentFormValues>) {
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

export async function updateStudentPhotos(photoData: { registrationNumber: string; photo: string }[]) {
  const registrationNumbers = photoData.map(p => p.registrationNumber);
  
  const existingStudents = await prisma.student.findMany({
    where: {
      registrationNumber: {
        in: registrationNumbers,
      },
    },
    select: {
      id: true,
      registrationNumber: true,
    },
  });

  const studentMap = new Map(existingStudents.map(s => [s.registrationNumber, s.id]));
  const foundNumbers = new Set(existingStudents.map(s => s.registrationNumber));
  const notFound = registrationNumbers.filter(rn => !foundNumbers.has(rn));

  const updates = photoData
    .filter(p => studentMap.has(p.registrationNumber))
    .map(p => 
      prisma.student.update({
        where: { id: studentMap.get(p.registrationNumber) },
        data: { photo: p.photo },
      })
    );

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }
  
  revalidatePath('/students');
  revalidatePath('/students/export-photos');
  
  return {
    count: updates.length,
    notFound,
  };
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
    const validatedData = serverUpdateUserSchema.safeParse(data);

    if (!validatedData.success) {
        throw new Error('Invalid user data: ' + JSON.stringify(validatedData.error.issues, null, 2));
    }
    
    const { password, ...rest } = validatedData.data;

    const dataToUpdate: Prisma.UserUpdateInput = { ...rest };
    
    if (rest.username) {
        const existingUser = await prisma.user.findFirst({
            where: {
                username: rest.username,
                id: { not: id }
            }
        });
        if (existingUser) {
            throw new Error("Username is already taken.");
        }
    }

    if (password) {
        dataToUpdate.password = await bcrypt.hash(password, 10);
    }
    
    if (rest.roleId) {
        dataToUpdate.role = {
            connect: { id: rest.roleId }
        };
        delete (dataToUpdate as any).roleId;
    }
    
    await prisma.user.update({
        where: { id },
        data: dataToUpdate
    });

    revalidatePath('/account');
    revalidatePath('/users');
    revalidatePath(`/users/edit/${id}`);
}

export async function createUser(data: z.infer<typeof serverCreateUserSchema>) {
    const validatedData = serverCreateUserSchema.safeParse(data);

    if (!validatedData.success) {
        throw new Error('Invalid user data: ' + validatedData.error.message);
    }

    const existingUser = await prisma.user.findUnique({
        where: { username: validatedData.data.username },
    });

    if (existingUser) {
        throw new Error('User with this username already exists.');
    }

    const { password, ...userData } = validatedData.data;
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
    if (user?.username === 'superadmin') {
        throw new Error("Cannot delete the initial super administrator.");
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

    try {
        await prisma.class.create({ data: validatedData.data });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error('This user is already managing another class. A user can only manage one class at a time.');
        }
        throw error;
    }

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

    await prisma.role.create({
        data: {
            name,
            description: description ?? '',
            permissions: permissions,
        }
    });

    revalidatePath('/roles');
}

export async function updateRole(id: string, data: RoleData) {
    const { name, description, permissions } = data;

    await prisma.role.update({
        where: { id },
        data: { 
            name, 
            description: description ?? '', 
            permissions: permissions,
        }
    });

    revalidatePath('/roles');
    revalidatePath(`/roles/edit/${id}`);
}


export async function deleteRole(id: string) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (['Super Admin'].includes(role?.name || '')) {
        throw new Error("Cannot delete the default Super Admin role.");
    }
    const userCount = await prisma.user.count({ where: { roleId: id } });
    if (userCount > 0) {
        throw new Error("Cannot delete a role that is assigned to users.");
    }

    await prisma.role.delete({ where: { id } });
    revalidatePath('/roles');
}
