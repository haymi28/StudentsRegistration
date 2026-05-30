
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
import { createAppError } from './errors';

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
 * Extracts authorized context including the managed class ID.
 * This is the source of truth for all scoped queries.
 */
async function getAuthorizedContext() {
  const user = await getAuthenticatedUser();
  const permissions = user.role.permissions as Record<string, boolean> || {};
  
  const isSuperAdmin = user.role.name === 'Super Admin';
  const assignedClassId = user.assignedClassId;

  // STRICT RBAC CHECK: If you are not a super admin, you MUST have an assigned class
  if (!isSuperAdmin && !assignedClassId) {
    throw new Error('Unauthorized: Your account is not assigned to any class. Please contact an administrator.');
  }

  return { user, permissions, assignedClassId, isSuperAdmin };
}

/**
 * Fetches students with strict backend-enforced access control.
 */
export async function getStudents(classId?: string) {
  const { isSuperAdmin, assignedClassId } = await getAuthorizedContext();

  let whereClause: Prisma.StudentWhereInput = {};

  if (!isSuperAdmin) {
    // BLOCK filtering: Ignore any provided classId and force the assigned one
    if (!assignedClassId) return [];
    whereClause.classId = assignedClassId;
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
  const { isSuperAdmin, assignedClassId } = await getAuthorizedContext();

  const student = await prisma.student.findUnique({
    where: { id },
    include: { class: true }
  });

  if (!student) return null;

  if (!isSuperAdmin) {
    // Strict ownership check: Does this student belong to the class managed by the user?
    if (student.classId !== assignedClassId) {
      throw new Error("Unauthorized Access Attempt");
    }
  }

  return student;
}

export async function createStudent(data: StudentFormValues) {
    const { isSuperAdmin, assignedClassId } = await getAuthorizedContext();
    
    const validatedData = getStudentRegistrationSchema({}).safeParse(data);
    if (!validatedData.success) {
        throw createAppError('invalid_data', 'Invalid student data', validatedData.error);
    }

    // Security check: ensure non-admins only register students to their own class
    if (!isSuperAdmin) {
        if (!assignedClassId || validatedData.data.classId !== assignedClassId) {
            throw createAppError('unauthorized', 'You are not authorized to perform this action', { action: 'register_student_to_other_class' });
        }
    }

    const existingStudent = await prisma.student.findUnique({
        where: { registrationNumber: validatedData.data.registrationNumber }
    });

    if (existingStudent) {
        throw createAppError('duplicate_registration_number', 'This registration number is already in use', { registrationNumber: validatedData.data.registrationNumber });
    }

    await prisma.student.create({ data: validatedData.data });
    revalidatePath('/students');
}

export async function importStudents(students: Partial<Student & { className: string }>[]) {
    const { isSuperAdmin, permissions, assignedClassId } = await getAuthorizedContext();
    
    if (!permissions.import_students) throw createAppError('unauthorized', 'You are not authorized to perform this action', { action: 'import_students' });

    const validationSchema = getStudentRegistrationSchema();
    const classes = await prisma.class.findMany();
    const classMap = new Map(classes.map(c => [c.name.toLowerCase(), c.id]));

    const validatedStudents: StudentFormValues[] = [];

    for (const student of students) {
        const studentWithClassId = { ...student };
        const className = student.className?.toLowerCase();
        
        if (className && classMap.has(className)) {
          studentWithClassId.classId = classMap.get(className);
        }

        // Security override: force correct class for non-superadmins
        if (!isSuperAdmin) {
            if (!assignedClassId) throw createAppError('unauthorized', 'You are not authorized to perform this action', { action: 'import_no_assigned_class' });
            studentWithClassId.classId = assignedClassId;
        }

        const result = validationSchema.safeParse(studentWithClassId);
        if (result.success) {
            validatedStudents.push(result.data as StudentFormValues);
        } else {
             throw createAppError('invalid_data', 'Validation failed for some students', result.error);
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
    const { isSuperAdmin, assignedClassId } = await getAuthorizedContext();

    // Verify ownership before updating
    const student = await prisma.student.findUnique({ where: { id }, select: { id: true, classId: true } });
    if (!student) throw createAppError('student_not_found', 'The student could not be found', { id });
    
    if (!isSuperAdmin && student.classId !== assignedClassId) {
        throw createAppError('unauthorized', 'You are not authorized to perform this action', { action: 'update_student_other_class' });
    }

    const validatedData = getStudentRegistrationSchema().partial().safeParse(data);
    if (!validatedData.success) {
        throw createAppError('invalid_data', 'Invalid student data', validatedData.error);
    }

    // Prevent non-admins from moving students to other classes via API injection
    if (!isSuperAdmin && validatedData.data.classId && validatedData.data.classId !== student.classId) {
        throw createAppError('unauthorized', 'You are not authorized to change student class', { action: 'change_student_class' });
    }

    await prisma.student.update({ where: { id }, data: validatedData.data });
    revalidatePath('/students');
    revalidatePath(`/students/edit/${id}`);
}

export async function deleteStudent(id: string) {
    const { isSuperAdmin } = await getAuthorizedContext();
    
    if (!isSuperAdmin) {
        throw createAppError('unauthorized', 'You are not authorized to delete students', { action: 'delete_student' });
    }

    await prisma.student.delete({ where: { id }});
    revalidatePath('/students');
}

export async function deleteStudents(ids: string[]) {
    const { isSuperAdmin } = await getAuthorizedContext();
    
    if (!isSuperAdmin) {
        throw createAppError('unauthorized', 'You are not authorized to perform bulk deletion', { action: 'delete_students_bulk' });
    }

    await prisma.student.deleteMany({ where: { id: { in: ids } } });
    revalidatePath('/students');
}

export async function updateStudentPhotos(photoData: { registrationNumber: string; photo: string }[]) {
  const { isSuperAdmin, permissions, assignedClassId } = await getAuthorizedContext();
  
  if (!permissions.import_students) throw new Error("Unauthorized");

  const registrationNumbers = photoData.map(p => p.registrationNumber);
  
  let whereClause: Prisma.StudentWhereInput = {
    registrationNumber: { in: registrationNumbers },
  };

  // Restrict to managed class if not superadmin
  if (!isSuperAdmin) {
    if (!assignedClassId) return { count: 0, notFound: registrationNumbers };
    whereClause.classId = assignedClassId;
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
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_users && !permissions.manage_classes) {
        throw createAppError('unauthorized', 'You are not authorized to view users', { action: 'get_users' });
    }

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
    const { user: currentUser, permissions } = await getAuthorizedContext();
    if (currentUser.id !== id && !permissions.manage_users) {
        throw createAppError('unauthorized', 'You are not authorized to view this user', { action: 'get_user' });
    }
    return await prisma.user.findUnique({ 
        where: { id },
        include: { role: true }
    });
}

export async function getUserByUsername(username: string) {
    const { user: currentUser, permissions } = await getAuthorizedContext();
    const targetUser = await prisma.user.findUnique({ 
        where: { username },
        include: { role: true }
    });
    
    if (targetUser && currentUser.id !== targetUser.id && !permissions.manage_users) {
        throw createAppError('unauthorized', 'You are not authorized to view this user', { action: 'get_user_by_username' });
    }
    return targetUser;
}

export async function updateUser(id: string, data: Partial<UserUpdateData>) {
    const { user: currentUser, permissions } = await getAuthorizedContext();

    // Users can update their own profile; admins can update anyone
    if (currentUser.id !== id && !permissions.manage_users) {
        throw createAppError('unauthorized', 'You are not authorized to update this user', { action: 'update_user' });
    }

    const validatedData = serverUpdateUserSchema.safeParse(data);
    if (!validatedData.success) {
        throw createAppError('invalid_data', 'Invalid user data', validatedData.error);
    }
    
    const { password, ...rest } = validatedData.data;
    const dataToUpdate: Prisma.UserUpdateInput = { ...rest };
    
    if (rest.username) {
        const existingUser = await prisma.user.findFirst({
            where: { username: rest.username, id: { not: id } }
        });
        if (existingUser) throw createAppError('duplicate_username', 'This username is already taken', { username: rest.username });
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
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_users) throw createAppError('unauthorized', 'You are not authorized to create users', { action: 'create_user' });

    const validatedData = serverCreateUserSchema.safeParse(data);
    if (!validatedData.success) throw createAppError('invalid_data', 'Invalid user data', validatedData.error);

    const existingUser = await prisma.user.findUnique({
        where: { username: validatedData.data.username },
    });
    if (existingUser) throw createAppError('duplicate_username', 'This username is already taken', { username: validatedData.data.username });

    const { password, ...userData } = validatedData.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: { ...userData, password: hashedPassword },
    });

    revalidatePath('/users');
}

export async function deleteUser(id: string) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_users) throw createAppError('unauthorized', 'You are not authorized to delete users', { action: 'delete_user' });

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (userToDelete?.username === 'superadmin') throw createAppError('cannot_delete_superadmin', 'You cannot delete the super admin account', { action: 'delete_superadmin' });
    
    await prisma.user.delete({ where: { id }});
    revalidatePath('/users');
}

/**
 * Fetches classes with access control.
 */
export async function getClasses() {
  const { isSuperAdmin, assignedClassId } = await getAuthorizedContext();

  let whereClause: Prisma.ClassWhereInput = {};

  if (!isSuperAdmin) {
    // Managers only see their own class
    if (!assignedClassId) return [];
    whereClause.id = assignedClassId;
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
  const { isSuperAdmin, assignedClassId } = await getAuthorizedContext();

  const classData = await prisma.class.findUnique({
    where: { id },
    include: { manager: true }
  });

  if (!classData) return null;
  if (!isSuperAdmin && classData.id !== assignedClassId) {
    throw createAppError('unauthorized', 'Access denied', { action: 'get_class', classId: id });
  }

  return classData;
}

export async function createClass(data: ClassData) {
  const { permissions } = await getAuthorizedContext();
  if (!permissions.manage_classes) throw createAppError('unauthorized', 'You are not authorized to create classes', { action: 'create_class' });

  const validationSchema = getCreateClassSchema();
  const validatedData = validationSchema.safeParse(data);
  if (!validatedData.success) throw createAppError('invalid_data', 'Invalid class data', validatedData.error);

  await prisma.class.create({ data: validatedData.data });
  revalidatePath('/classes');
}

export async function updateClass(id: string, data: ClassData) {
  const { permissions } = await getAuthorizedContext();
  if (!permissions.manage_classes) throw createAppError('unauthorized', 'You are not authorized to update classes', { action: 'update_class' });

  const validationSchema = getCreateClassSchema();
  const validatedData = validationSchema.safeParse(data);
  if (!validatedData.success) throw createAppError('invalid_data', 'Invalid class data', validatedData.error);

  await prisma.class.update({ where: { id }, data: validatedData.data });
  revalidatePath('/classes');
}

export async function deleteClass(id: string) {
  const { permissions } = await getAuthorizedContext();
  if (!permissions.manage_classes) throw createAppError('unauthorized', 'You are not authorized to delete classes', { action: 'delete_class' });

  const studentCount = await prisma.student.count({ where: { classId: id } });
  if (studentCount > 0) throw createAppError('class_has_students', 'You cannot delete a class that has students assigned to it', { classId: id });
  
  await prisma.class.delete({ where: { id }});
  revalidatePath('/classes');
}

export async function transferStudentsToClass(studentIds: string[], targetClassId: string) {
  const { isSuperAdmin, permissions } = await getAuthorizedContext();
  
  if (!isSuperAdmin && !permissions.transfer_students) throw createAppError('unauthorized', 'You are not authorized to transfer students', { action: 'transfer_students' });

  await prisma.student.updateMany({
    where: { id: { in: studentIds } },
    data: { classId: targetClassId },
  });
  revalidatePath('/students');
}

// Role Functions
export async function getRoles() {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_roles && !permissions.manage_users) {
        throw createAppError('unauthorized', 'You are not authorized to view roles', { action: 'get_roles' });
    }
    return await prisma.role.findMany({
        include: { _count: { select: { users: true } } },
        orderBy: { name: 'asc' }
    });
}

export async function getRoleById(id: string) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_roles && !permissions.manage_users) {
        throw createAppError('unauthorized', 'You are not authorized to view this role', { action: 'get_role' });
    }
    return await prisma.role.findUnique({ where: { id } });
}

export async function createRole(data: RoleData) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_roles) throw createAppError('unauthorized', 'You are not authorized to create roles', { action: 'create_role' });
    await prisma.role.create({ data });
    revalidatePath('/roles');
}

export async function updateRole(id: string, data: RoleData) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_roles) throw createAppError('unauthorized', 'You are not authorized to update roles', { action: 'update_role' });
    await prisma.role.update({ where: { id }, data });
    revalidatePath('/roles');
}

export async function deleteRole(id: string) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_roles) throw createAppError('unauthorized', 'You are not authorized to delete roles', { action: 'delete_role' });
    await prisma.role.delete({ where: { id } });
    revalidatePath('/roles');
}
