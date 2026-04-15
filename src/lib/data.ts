
'use server';

import prisma from './prisma';
import { z } from 'zod';
import { getStudentRegistrationSchema } from './validations/student';
import { revalidatePath } from 'next/cache';
import { Student, User, Class, Role, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { updateUserSchema as serverUpdateUserSchema, createUserSchema as serverCreateUserSchema } from './validations/user-server';
import { getCreateClassSchema } from './validations/class';
import { getServerSession } from './auth';

type StudentFormValues = z.infer<ReturnType<typeof getStudentRegistrationSchema>>;
type ClassData = z.infer<ReturnType<typeof getCreateClassSchema>>;
type RoleData = { name: string; description?: string | null; permissions: Prisma.JsonObject };
type UserUpdateData = z.infer<typeof serverUpdateUserSchema>;

/**
 * Internal helper to verify session and get user context.
 */
async function getAuthenticatedUser() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  return session.user;
}

/**
 * Fetches students with strict backend-enforced access control.
 */
export async function getStudents(classId?: string) {
  const user = await getAuthenticatedUser();
  const permissions = user.role.permissions as Record<string, boolean> || {};

  let whereClause: Prisma.StudentWhereInput = {};

  if (!permissions.manage_all_students) {
    // Non-super-admins are strictly limited to their managed class
    const userClass = await prisma.class.findFirst({
      where: { managerId: user.id },
    });
    if (!userClass) return [];
    whereClause.classId = userClass.id;
  } else if (classId && classId !== 'all') {
    // Super admins can apply class filters
    whereClause.classId = classId;
  }
  
  return await prisma.student.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: { class: true },
  });
}

/**
 * Fetches a single student with ownership verification at the query level.
 */
export async function getStudentById(id: string) {
  const user = await getAuthenticatedUser();
  const permissions = user.role.permissions as Record<string, boolean> || {};

  const student = await prisma.student.findUnique({
    where: { id },
    include: { class: true }
  });

  if (!student) return null;

  if (!permissions.manage_all_students) {
    // Strict ownership check: Does this student belong to the class managed by the user?
    if (student.class?.managerId !== user.id) {
      throw new Error("Access Denied");
    }
  }

  return student;
}

export async function createStudent(data: StudentFormValues) {
    const user = await getAuthenticatedUser();
    const permissions = user.role.permissions as Record<string, boolean> || {};
    
    const validatedData = getStudentRegistrationSchema({}).safeParse(data);
    if (!validatedData.success) {
        throw new Error('Invalid student data');
    }

    // Security check: ensure non-admins only register students to their own class
    if (!permissions.manage_all_students) {
        const userClass = await prisma.class.findFirst({ where: { managerId: user.id } });
        if (!userClass || validatedData.data.classId !== userClass.id) {
            throw new Error("Unauthorized: You can only register students to your assigned class.");
        }
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
    const user = await getAuthenticatedUser();
    const permissions = user.role.permissions as Record<string, boolean> || {};
    
    if (!permissions.import_students) throw new Error("Unauthorized");

    const validationSchema = getStudentRegistrationSchema();
    const classes = await prisma.class.findMany();
    const classMap = new Map(classes.map(c => [c.name.toLowerCase(), c.id]));
    
    // For non-superadmins, find their allowed class
    let allowedClassId: string | null = null;
    if (!permissions.manage_all_students) {
        const userClass = await prisma.class.findFirst({ where: { managerId: user.id } });
        allowedClassId = userClass?.id || null;
    }

    const validatedStudents: StudentFormValues[] = [];

    for (const student of students) {
        const studentWithClassId = { ...student };
        const className = student.className?.toLowerCase();
        
        if (className && classMap.has(className)) {
          studentWithClassId.classId = classMap.get(className);
        }

        // Security override: force correct class for non-superadmins
        if (!permissions.manage_all_students && allowedClassId) {
            studentWithClassId.classId = allowedClassId;
        }

        const result = validationSchema.safeParse(studentWithClassId);
        if (result.success) {
            validatedStudents.push(result.data as StudentFormValues);
        } else {
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
    const user = await getAuthenticatedUser();
    const permissions = user.role.permissions as Record<string, boolean> || {};

    // Verify ownership before updating
    const student = await prisma.student.findUnique({ where: { id }, include: { class: true } });
    if (!student) throw new Error("Student not found");
    
    if (!permissions.manage_all_students && student.class?.managerId !== user.id) {
        throw new Error("Unauthorized");
    }

    const validatedData = getStudentRegistrationSchema().partial().safeParse(data);
    if (!validatedData.success) {
        throw new Error('Invalid student data');
    }

    // Prevent non-admins from moving students to other classes via API injection
    if (!permissions.manage_all_students && validatedData.data.classId && validatedData.data.classId !== student.classId) {
        throw new Error("Unauthorized: You cannot change a student's class.");
    }

    await prisma.student.update({ where: { id }, data: validatedData.data });
    revalidatePath('/students');
    revalidatePath(`/students/edit/${id}`);
}

export async function deleteStudent(id: string) {
    const user = await getAuthenticatedUser();
    const permissions = user.role.permissions as Record<string, boolean> || {};

    const student = await prisma.student.findUnique({ where: { id }, include: { class: true } });
    if (!student) throw new Error("Student not found");
    
    if (!permissions.manage_all_students) {
        throw new Error("Unauthorized: Only super admins can delete students.");
    }

    await prisma.student.delete({ where: { id }});
    revalidatePath('/students');
}

export async function deleteStudents(ids: string[]) {
    const user = await getAuthenticatedUser();
    const permissions = user.role.permissions as Record<string, boolean> || {};
    
    if (!permissions.manage_all_students) {
        throw new Error("Unauthorized: Only super admins can perform bulk deletion.");
    }

    await prisma.student.deleteMany({ where: { id: { in: ids } } });
    revalidatePath('/students');
}

export async function updateStudentPhotos(photoData: { registrationNumber: string; photo: string }[]) {
  const user = await getAuthenticatedUser();
  const permissions = user.role.permissions as Record<string, boolean> || {};
  
  if (!permissions.import_students) throw new Error("Unauthorized");

  const registrationNumbers = photoData.map(p => p.registrationNumber);
  
  let whereClause: Prisma.StudentWhereInput = {
    registrationNumber: { in: registrationNumbers },
  };

  // Restrict to managed class if not superadmin
  if (!permissions.manage_all_students) {
    const userClass = await prisma.class.findFirst({ where: { managerId: user.id } });
    if (!userClass) return { count: 0, notFound: registrationNumbers };
    whereClause.classId = userClass.id;
  }
  
  const existingStudents = await prisma.student.findMany({
    where: whereClause,
    select: { id: true, registrationNumber: true },
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
  return { count: updates.length, notFound };
}

// User Functions
export async function getUsers(excludeSuperAdmin = false) {
    await getAuthenticatedUser(); // Ensure logged in
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
    await getAuthenticatedUser();
    return await prisma.user.findUnique({ 
        where: { id },
        include: { role: true }
    });
}

export async function getUserByUsername(username: string) {
    await getAuthenticatedUser();
    return await prisma.user.findUnique({ 
        where: { username },
        include: { role: true }
    });
}

export async function updateUser(id: string, data: Partial<UserUpdateData>) {
    const user = await getAuthenticatedUser();
    const permissions = user.role.permissions as Record<string, boolean> || {};

    // Users can update their own profile; admins can update anyone
    if (user.id !== id && !permissions.manage_users) {
        throw new Error("Unauthorized");
    }

    const validatedData = serverUpdateUserSchema.safeParse(data);
    if (!validatedData.success) {
        throw new Error('Invalid user data');
    }
    
    const { password, ...rest } = validatedData.data;
    const dataToUpdate: Prisma.UserUpdateInput = { ...rest };
    
    if (rest.username) {
        const existingUser = await prisma.user.findFirst({
            where: { username: rest.username, id: { not: id } }
        });
        if (existingUser) throw new Error("Username is already taken.");
    }

    if (password) {
        dataToUpdate.password = await bcrypt.hash(password, 10);
    }
    
    if (rest.roleId && permissions.manage_users) {
        dataToUpdate.role = { connect: { id: rest.roleId } };
        delete (dataToUpdate as any).roleId;
    }
    
    await prisma.user.update({
        where: { id },
        data: dataToUpdate
    });

    revalidatePath('/account');
    revalidatePath('/users');
}

export async function createUser(data: z.infer<typeof serverCreateUserSchema>) {
    const user = await getAuthenticatedUser();
    const permissions = user.role.permissions as Record<string, boolean> || {};
    if (!permissions.manage_users) throw new Error("Unauthorized");

    const validatedData = serverCreateUserSchema.safeParse(data);
    if (!validatedData.success) throw new Error('Invalid user data');

    const existingUser = await prisma.user.findUnique({
        where: { username: validatedData.data.username },
    });
    if (existingUser) throw new Error('User with this username already exists.');

    const { password, ...userData } = validatedData.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: { ...userData, password: hashedPassword },
    });

    revalidatePath('/users');
}

export async function deleteUser(id: string) {
    const loggedInUser = await getAuthenticatedUser();
    const permissions = loggedInUser.role.permissions as Record<string, boolean> || {};
    if (!permissions.manage_users) throw new Error("Unauthorized");

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (userToDelete?.username === 'superadmin') throw new Error("Cannot delete superadmin.");
    
    await prisma.user.delete({ where: { id }});
    revalidatePath('/users');
}

/**
 * Fetches classes with access control.
 */
export async function getClasses() {
  const user = await getAuthenticatedUser();
  const permissions = user.role.permissions as Record<string, boolean> || {};

  let whereClause: Prisma.ClassWhereInput = {};

  if (!permissions.manage_all_students) {
    // Managers only see their own class
    whereClause.managerId = user.id;
  }

  return await prisma.class.findMany({
    where: whereClause,
    include: {
      manager: true,
      _count: { select: { students: true } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getClassById(id: string) {
    const user = await getAuthenticatedUser();
    const permissions = user.role.permissions as Record<string, boolean> || {};

    const classData = await prisma.class.findUnique({
        where: { id },
        include: { manager: true }
    });

    if (!classData) return null;
    if (!permissions.manage_all_students && classData.managerId !== user.id) {
        throw new Error("Access Denied");
    }

    return classData;
}

export async function createClass(data: ClassData) {
    const user = await getAuthenticatedUser();
    const permissions = user.role.permissions as Record<string, boolean> || {};
    if (!permissions.manage_classes) throw new Error("Unauthorized");

    const validationSchema = getCreateClassSchema();
    const validatedData = validationSchema.safeParse(data);
    if (!validatedData.success) throw new Error('Invalid data');

    await prisma.class.create({ data: validatedData.data });
    revalidatePath('/classes');
}

export async function updateClass(id: string, data: ClassData) {
    const user = await getAuthenticatedUser();
    const permissions = user.role.permissions as Record<string, boolean> || {};
    if (!permissions.manage_classes) throw new Error("Unauthorized");

    const validationSchema = getCreateClassSchema();
    const validatedData = validationSchema.safeParse(data);
    if (!validatedData.success) throw new Error('Invalid data');

    await prisma.class.update({ where: { id }, data: validatedData.data });
    revalidatePath('/classes');
}

export async function deleteClass(id: string) {
    const user = await getAuthenticatedUser();
    const permissions = user.role.permissions as Record<string, boolean> || {};
    if (!permissions.manage_classes) throw new Error("Unauthorized");

    const studentCount = await prisma.student.count({ where: { classId: id } });
    if (studentCount > 0) throw new Error("Cannot delete a class with students.");
    
    await prisma.class.delete({ where: { id }});
    revalidatePath('/classes');
}

export async function transferStudentsToClass(studentIds: string[], targetClassId: string) {
    const user = await getAuthenticatedUser();
    const permissions = user.role.permissions as Record<string, boolean> || {};
    
    if (!permissions.manage_all_students) throw new Error("Unauthorized: Only super admins can transfer students.");

    await prisma.student.updateMany({
        where: { id: { in: studentIds } },
        data: { classId: targetClassId },
    });
    revalidatePath('/students');
}

// Role Functions
export async function getRoles() {
    await getAuthenticatedUser();
    return await prisma.role.findMany({
        include: { _count: { select: { users: true } } },
        orderBy: { name: 'asc' }
    });
}

export async function getRoleById(id: string) {
    await getAuthenticatedUser();
    return await prisma.role.findUnique({ where: { id } });
}

export async function createRole(data: RoleData) {
    const user = await getAuthenticatedUser();
    if (!(user.role.permissions as any).manage_roles) throw new Error("Unauthorized");
    await prisma.role.create({ data });
    revalidatePath('/roles');
}

export async function updateRole(id: string, data: RoleData) {
    const user = await getAuthenticatedUser();
    if (!(user.role.permissions as any).manage_roles) throw new Error("Unauthorized");
    await prisma.role.update({ where: { id }, data });
    revalidatePath('/roles');
}

export async function deleteRole(id: string) {
    const user = await getAuthenticatedUser();
    if (!(user.role.permissions as any).manage_roles) throw new Error("Unauthorized");
    await prisma.role.delete({ where: { id } });
    revalidatePath('/roles');
}
