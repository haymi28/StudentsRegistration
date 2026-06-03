
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
import { throwAppError } from './errors';

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
 * Resolves class IDs assigned to a user from the database (source of truth).
 */
async function resolveAssignedClassIds(userId: string): Promise<string[]> {
  const classes = await prisma.class.findMany({
    where: { managerId: userId },
    select: { id: true },
  });
  return classes.map((c) => c.id);
}

/**
 * Builds a Prisma where clause that scopes student queries to assigned classes.
 * Only Super Admin may query across all classes.
 */
function buildStudentListWhere(
  isSuperAdmin: boolean,
  assignedClassIds: string[],
  classId?: string
): Prisma.StudentWhereInput {
  if (isSuperAdmin) {
    if (classId && classId !== 'all') {
      return { classId };
    }
    return {};
  }

  if (assignedClassIds.length === 0) {
    return { id: { in: [] } };
  }

  if (classId && classId !== 'all') {
    if (!assignedClassIds.includes(classId)) {
      throwAppError(
        'unauthorized',
        'You do not have permission to view students in this class.',
        { action: 'view_students_other_class' }
      );
    }
    return { classId };
  }

  return { classId: { in: assignedClassIds } };
}

/**
 * Ensures a student record is within the caller's assigned class scope.
 */
function assertStudentAccessible(
  studentClassId: string | null,
  isSuperAdmin: boolean,
  assignedClassIds: string[],
  action: string
): void {
  if (isSuperAdmin) return;
  if (!studentClassId || !assignedClassIds.includes(studentClassId)) {
    throwAppError(
      'unauthorized',
      'You do not have permission to access this student record.',
      { action }
    );
  }
}

/**
 * Extracts authorized context including the managed class ID.
 * This is the source of truth for all scoped queries.
 */
async function getAuthorizedContext() {
  const user = await getAuthenticatedUser();
  const permissions = user.role.permissions as Record<string, boolean> || {};
  
  const isSuperAdmin = user.role.name === 'Super Admin';
  const assignedClassIds = isSuperAdmin ? [] : await resolveAssignedClassIds(user.id);
  const assignedClassId = assignedClassIds[0] || null;

  // Relaxed check: Allow users without a class if they have administrative permissions
  // or if they are super admins.
  const hasAdminPermissions = permissions.manage_users || permissions.manage_roles || permissions.manage_classes || permissions.view_dashboard;
  
  if (!isSuperAdmin && assignedClassIds.length === 0 && !hasAdminPermissions) {
    throw new Error('Unauthorized: Your account is not assigned to any class and lacks administrative permissions.');
  }

  return { user, permissions, assignedClassId, assignedClassIds, isSuperAdmin };
}

/**
 * Fetches students with strict backend-enforced access control.
 */
export async function getStudents(classId?: string) {
  const { isSuperAdmin, assignedClassIds } = await getAuthorizedContext();
  const whereClause = buildStudentListWhere(isSuperAdmin, assignedClassIds, classId);
  
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
  const { isSuperAdmin, assignedClassIds } = await getAuthorizedContext();

  const student = await prisma.student.findUnique({
    where: { id },
    include: { class: true }
  });

  if (!student) return null;

  assertStudentAccessible(
    student.classId,
    isSuperAdmin,
    assignedClassIds,
    'view_student_from_other_class'
  );

  return student;
}

export async function createStudent(data: StudentFormValues) {
    const { isSuperAdmin, assignedClassIds } = await getAuthorizedContext();
    
    const validatedData = getStudentRegistrationSchema({}).safeParse(data);
    if (!validatedData.success) {
        throwAppError('invalid_data', 'Invalid student data', validatedData.error);
    }

    // Security check: ensure non-super-admins only register students to their assigned class(es)
    if (!isSuperAdmin) {
        if (assignedClassIds.length === 0 || (validatedData.data.classId && !assignedClassIds.includes(validatedData.data.classId))) {
            throwAppError('unauthorized', 'You are not authorized to perform this action', { action: 'register_student_to_other_class' });
        }
    }

    const existingStudent = await prisma.student.findUnique({
        where: { registrationNumber: validatedData.data.registrationNumber }
    });

    if (existingStudent) {
        throwAppError('duplicate_registration_number', 'This registration number is already in use', { registrationNumber: validatedData.data.registrationNumber });
    }

    await prisma.student.create({ data: validatedData.data });
    revalidatePath('/students');
}

export async function importStudents(students: Partial<Student & { className: string }>[]) {
    const { isSuperAdmin, permissions, assignedClassIds } = await getAuthorizedContext();
    
    if (!isSuperAdmin && !permissions.import_students_text) throw new Error("Unauthorized");

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

        // Security override: non-super-admins may only import into their assigned class(es)
        if (!isSuperAdmin) {
            if (assignedClassIds.length === 0) throw new Error("Unauthorized: No assigned class found for import.");
            const targetClassId = studentWithClassId.classId;
            if (!targetClassId || !assignedClassIds.includes(targetClassId)) {
              studentWithClassId.classId = assignedClassIds[0];
            }
        }

        const result = validationSchema.safeParse(studentWithClassId);
        if (result.success) {
            validatedStudents.push(result.data as StudentFormValues);
        } else {
             throwAppError('invalid_data', 'Validation failed for some students', result.error);
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
    const { isSuperAdmin, assignedClassIds } = await getAuthorizedContext();

    // Verify ownership before updating
    const student = await prisma.student.findUnique({ where: { id }, select: { id: true, classId: true } });
    if (!student) throwAppError('student_not_found', 'The student could not be found', { id });
    
    assertStudentAccessible(
      student.classId,
      isSuperAdmin,
      assignedClassIds,
      'update_student_from_other_class'
    );

    const validatedData = getStudentRegistrationSchema().partial().safeParse(data);
    if (!validatedData.success) {
        throwAppError('invalid_data', 'Invalid student data', validatedData.error);
    }

    // Prevent non-super-admins from moving students to other classes via API injection
    if (!isSuperAdmin && validatedData.data.classId) {
        if (!assignedClassIds.includes(validatedData.data.classId)) {
            throwAppError('unauthorized', "You cannot change a student's class.", { action: 'change_student_class' });
        }
        if (validatedData.data.classId !== student.classId) {
            throwAppError('unauthorized', "You cannot change a student's class.", { action: 'change_student_class' });
        }
    }

    await prisma.student.update({ where: { id }, data: validatedData.data });
    revalidatePath('/students');
    revalidatePath(`/students/edit/${id}`);
}

export async function deleteStudent(id: string) {
    const { isSuperAdmin, assignedClassIds } = await getAuthorizedContext();
    
    if (!isSuperAdmin) {
        const student = await prisma.student.findUnique({ where: { id }, select: { id: true, classId: true } });
        if (!student) throwAppError('student_not_found', 'The student could not be found', { id });
        assertStudentAccessible(student.classId, isSuperAdmin, assignedClassIds, 'delete_student');
    }

    await prisma.student.delete({ where: { id }});
    revalidatePath('/students');
}

export async function deleteStudents(ids: string[]) {
    const { isSuperAdmin, assignedClassIds, permissions } = await getAuthorizedContext();
    
    if (!isSuperAdmin) {
        // Verify all students belong to assigned classes
        const students = await prisma.student.findMany({ where: { id: { in: ids } }, select: { id: true, classId: true } });
        const invalidStudents = students.filter(s => s.classId && !assignedClassIds.includes(s.classId));
        if (invalidStudents.length > 0) {
            throwAppError('unauthorized', 'You are not authorized to delete some students', { action: 'delete_students_bulk' });
        }
    }

    await prisma.student.deleteMany({ where: { id: { in: ids } } });
    revalidatePath('/students');
}

export async function updateStudentPhotos(photoData: { registrationNumber: string; photo: string }[]) {
  const { isSuperAdmin, permissions, assignedClassIds } = await getAuthorizedContext();
  
  if (!isSuperAdmin && !permissions.import_students_photos) throw new Error("Unauthorized");

  const registrationNumbers = photoData.map(p => p.registrationNumber);
  
  let whereClause: Prisma.StudentWhereInput = {
    registrationNumber: { in: registrationNumbers },
  };

  // Restrict to assigned classes for non-super-admins
  if (!isSuperAdmin) {
    if (assignedClassIds.length === 0) return { count: 0, notFound: registrationNumbers };
    whereClause.classId = { in: assignedClassIds };
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
        throwAppError('unauthorized', 'You are not authorized to view users', { action: 'get_users' });
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            displayName: true,
            isActive: true,
            requiresPasswordChange: true,
            createdAt: true,
            updatedAt: true,
            roleId: true,
            role: true,
        },
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
        throwAppError('unauthorized', 'You are not authorized to view this user', { action: 'get_user' });
    }
    return await prisma.user.findUnique({ 
        where: { id },
        select: {
            id: true,
            username: true,
            displayName: true,
            isActive: true,
            requiresPasswordChange: true,
            createdAt: true,
            updatedAt: true,
            roleId: true,
            role: true,
        }
    });
}

export async function getUserByUsername(username: string) {
    const { user: currentUser, permissions } = await getAuthorizedContext();
    const targetUser = await prisma.user.findUnique({ 
        where: { username },
        select: {
            id: true,
            username: true,
            displayName: true,
            isActive: true,
            requiresPasswordChange: true,
            createdAt: true,
            updatedAt: true,
            roleId: true,
            role: true,
        }
    });
    
    if (targetUser && currentUser.id !== targetUser.id && !permissions.manage_users) {
        throwAppError('unauthorized', 'You are not authorized to view this user', { action: 'get_user_by_username' });
    }
    return targetUser;
}

export async function updateUser(id: string, data: Partial<UserUpdateData>) {
    const { user: currentUser, permissions } = await getAuthorizedContext();

    // Users can update their own profile; admins can update anyone
    if (currentUser.id !== id && !permissions.manage_users) {
        throwAppError('unauthorized', 'You are not authorized to update this user', { action: 'update_user' });
    }

    const validatedData = serverUpdateUserSchema.safeParse(data);
    if (!validatedData.success) {
        throwAppError('invalid_data', 'Invalid user data', validatedData.error);
    }
    
    const { password, ...rest } = validatedData.data;
    const dataToUpdate: Prisma.UserUpdateInput = { ...rest };
    
    if (rest.username) {
        const existingUser = await prisma.user.findFirst({
            where: { username: rest.username, id: { not: id } }
        });
        if (existingUser) throwAppError('duplicate_username', 'This username is already taken', { username: rest.username });
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
        data: {
            ...dataToUpdate,
            requiresPasswordChange: password ? false : undefined
        }
    });

    revalidatePath('/account');
    revalidatePath('/users');
}

export async function createUser(data: z.infer<typeof serverCreateUserSchema>) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_users) throwAppError('unauthorized', 'You are not authorized to create users', { action: 'create_user' });

    const validatedData = serverCreateUserSchema.safeParse(data);
    if (!validatedData.success) throwAppError('invalid_data', 'Invalid user data', validatedData.error);

    const existingUser = await prisma.user.findUnique({
        where: { username: validatedData.data.username },
    });
    if (existingUser) throwAppError('duplicate_username', 'This username is already taken', { username: validatedData.data.username });

    const { password, ...userData } = validatedData.data;
    
    // Use the provided password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: { 
            ...userData, 
            password: hashedPassword,
            requiresPasswordChange: true 
        },
        select: {
            id: true,
            username: true,
            displayName: true,
            isActive: true,
            requiresPasswordChange: true,
            createdAt: true,
            updatedAt: true,
            roleId: true,
        }
    });

    revalidatePath('/users');
    return { ...newUser, tempPassword: password };
}

export async function changeUserPassword(data: { currentPassword: string; newPassword: string }) {
    const { user: currentUser } = await getAuthorizedContext();

    const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { id: true, password: true }
    });

    if (!user) {
        throw new Error("User not found");
    }

    const isPasswordCorrect = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordCorrect) {
        throw new Error("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            requiresPasswordChange: false
        }
    });

    revalidatePath('/account');
}

export async function deleteUser(id: string) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_users) throwAppError('unauthorized', 'You are not authorized to delete users', { action: 'delete_user' });

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (userToDelete?.username === 'superadmin') throwAppError('cannot_delete_superadmin', 'You cannot delete the super admin account', { action: 'delete_superadmin' });
    
    await prisma.user.delete({ where: { id }});
    revalidatePath('/users');
}

/**
 * Fetches classes with access control.
 */
export async function getClasses() {
  const { isSuperAdmin, assignedClassIds, permissions } = await getAuthorizedContext();

  let whereClause: Prisma.ClassWhereInput = {};

  if (!isSuperAdmin && !permissions.manage_classes) {
    // Non-admins only see their own assigned classes
    if (assignedClassIds.length === 0) return [];
    whereClause.id = { in: assignedClassIds };
  }

  return await prisma.class.findMany({
    where: whereClause,
    include: {
      manager: {
        select: {
          id: true,
          username: true,
          displayName: true,
          isActive: true,
        }
      },
      _count: { select: { students: true } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getClassById(id: string) {
  const { isSuperAdmin, assignedClassIds } = await getAuthorizedContext();

    const classData = await prisma.class.findUnique({
        where: { id },
        include: {
          manager: {
            select: {
              id: true,
              username: true,
              displayName: true,
              isActive: true,
            }
          }
        }
    });

  if (!classData) return null;
  if (!isSuperAdmin && !assignedClassIds.includes(classData.id)) {
    throwAppError('unauthorized', 'Access denied', { action: 'get_class', classId: id });
  }

  return classData;
}

export async function createClass(data: ClassData) {
  const { permissions } = await getAuthorizedContext();
  if (!permissions.manage_classes) throwAppError('unauthorized', 'You are not authorized to create classes', { action: 'create_class' });

  const validationSchema = getCreateClassSchema();
  const validatedData = validationSchema.safeParse(data);
  if (!validatedData.success) throwAppError('invalid_data', 'Invalid class data', validatedData.error);

  await prisma.class.create({ data: validatedData.data });
  revalidatePath('/classes');
}

export async function updateClass(id: string, data: ClassData) {
  const { permissions } = await getAuthorizedContext();
  if (!permissions.manage_classes) throwAppError('unauthorized', 'You are not authorized to update classes', { action: 'update_class' });

  const validationSchema = getCreateClassSchema();
  const validatedData = validationSchema.safeParse(data);
  if (!validatedData.success) throwAppError('invalid_data', 'Invalid class data', validatedData.error);

  await prisma.class.update({ where: { id }, data: validatedData.data });
  revalidatePath('/classes');
}

export async function deleteClass(id: string) {
  const { permissions } = await getAuthorizedContext();
  if (!permissions.manage_classes) throwAppError('unauthorized', 'You are not authorized to delete classes', { action: 'delete_class' });

  const studentCount = await prisma.student.count({ where: { classId: id } });
  if (studentCount > 0) throwAppError('class_has_students', 'You cannot delete a class that has students assigned to it', { classId: id });
  
  await prisma.class.delete({ where: { id }});
  revalidatePath('/classes');
}

export async function transferStudentsToClass(studentIds: string[], targetClassId: string) {
  const { isSuperAdmin, permissions, assignedClassIds } = await getAuthorizedContext();
  
  if (!isSuperAdmin && !permissions.transfer_students) throwAppError('unauthorized', 'You are not authorized to transfer students', { action: 'transfer_students' });

  // Non-super-admins may only transfer students within their assigned classes (if permitted)
  if (!isSuperAdmin) {
    if (assignedClassIds.length === 0) throwAppError('unauthorized', 'You are not assigned to any class', { action: 'transfer_students' });
    
    // Verify all students are from assigned classes
    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, classId: true }
    });
    
    const invalidStudents = students.filter(s => s.classId && !assignedClassIds.includes(s.classId));
    if (invalidStudents.length > 0) {
      throwAppError('unauthorized', 'You can only transfer students from your assigned classes', { action: 'transfer_students' });
    }
    
    // Only Super Admin may move students between classes
    throwAppError('unauthorized', 'You are not authorized to transfer students to another class', { action: 'transfer_students' });
  }

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
        throwAppError('unauthorized', 'You are not authorized to view roles', { action: 'get_roles' });
    }
    return await prisma.role.findMany({
        include: { _count: { select: { users: true } } },
        orderBy: { name: 'asc' }
    });
}

export async function getRoleById(id: string) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_roles && !permissions.manage_users) {
        throwAppError('unauthorized', 'You are not authorized to view this role', { action: 'get_role' });
    }
    return await prisma.role.findUnique({ where: { id } });
}

export async function createRole(data: RoleData) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_roles) throwAppError('unauthorized', 'You are not authorized to create roles', { action: 'create_role' });
    await prisma.role.create({ data });
    revalidatePath('/roles');
}

export async function updateRole(id: string, data: RoleData) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_roles) throwAppError('unauthorized', 'You are not authorized to update roles', { action: 'update_role' });
    await prisma.role.update({ where: { id }, data });
    revalidatePath('/roles');
}

export async function deleteRole(id: string) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_roles) throwAppError('unauthorized', 'You are not authorized to delete roles', { action: 'delete_role' });
    await prisma.role.delete({ where: { id } });
    revalidatePath('/roles');
}
