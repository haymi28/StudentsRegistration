
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
 * Extracts authorized context including the managed class ID.
 * This is the source of truth for all scoped queries.
 */
async function getAuthorizedContext() {
  const user = await getAuthenticatedUser();
  const permissions = user.role.permissions as Record<string, boolean> || {};
  
  const isSuperAdmin = user.role.name === 'Super Admin';
  const assignedClassId = user.assignedClassId;

  // Relaxed check: Allow users without a class if they have administrative permissions
  // or if they are super admins.
  const hasAdminPermissions = permissions.manage_users || permissions.manage_roles || permissions.manage_classes || permissions.view_dashboard;
  
  if (!isSuperAdmin && !assignedClassId && !hasAdminPermissions) {
    throw new Error('Unauthorized: Your account is not assigned to any class and lacks administrative permissions.');
  }

  return { user, permissions, assignedClassId, isSuperAdmin };
}

/**
 * Fetches students with strict backend-enforced access control.
 */
export async function getStudents(classId?: string) {
  const { isSuperAdmin, assignedClassId, permissions } = await getAuthorizedContext();

  let whereClause: Prisma.StudentWhereInput = {};

  if (!isSuperAdmin && !permissions.manage_all_students) {
    // If not a superadmin and can't manage all students, force the assigned class
    if (!assignedClassId) return [];
    whereClause.classId = assignedClassId;
  } else if (classId && classId !== 'all') {
    // Super admins or users with manage_all_students can apply class filters
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
  const { isSuperAdmin, assignedClassId, permissions } = await getAuthorizedContext();

  const student = await prisma.student.findUnique({
    where: { id },
    include: { class: true }
  });

  if (!student) return null;

  if (!isSuperAdmin && !permissions.manage_all_students) {
    // Strict ownership check: Does this student belong to the class managed by the user?
    if (student.classId !== assignedClassId) {
      throw new Error("Unauthorized Access Attempt");
    }
  }

  return student;
}

export async function createStudent(data: StudentFormValues) {
    const { isSuperAdmin, assignedClassId, permissions } = await getAuthorizedContext();
    
    const validatedData = getStudentRegistrationSchema({}).safeParse(data);
    if (!validatedData.success) {
        throw new Error('Invalid student data');
    }

    // Security check: ensure non-admins only register students to their own class
    if (!isSuperAdmin && !permissions.manage_all_students) {
        if (!assignedClassId || validatedData.data.classId !== assignedClassId) {
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
    const { isSuperAdmin, permissions, assignedClassId } = await getAuthorizedContext();
    
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

        // Security override: force correct class for non-superadmins without manage_all_students
        if (!isSuperAdmin && !permissions.manage_all_students) {
            if (!assignedClassId) throw new Error("Unauthorized: No assigned class found for import.");
            studentWithClassId.classId = assignedClassId;
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
    const { isSuperAdmin, assignedClassId, permissions } = await getAuthorizedContext();

    // Verify ownership before updating
    const student = await prisma.student.findUnique({ where: { id }, select: { id: true, classId: true } });
    if (!student) throw new Error("Student not found");
    
    if (!isSuperAdmin && !permissions.manage_all_students && student.classId !== assignedClassId) {
        throw new Error("Unauthorized");
    }

    const validatedData = getStudentRegistrationSchema().partial().safeParse(data);
    if (!validatedData.success) {
        throw new Error('Invalid student data');
    }

    // Prevent non-admins from moving students to other classes via API injection
    if (!isSuperAdmin && !permissions.manage_all_students && validatedData.data.classId && validatedData.data.classId !== student.classId) {
        throw new Error("Unauthorized: You cannot change a student's class.");
    }

    await prisma.student.update({ where: { id }, data: validatedData.data });
    revalidatePath('/students');
    revalidatePath(`/students/edit/${id}`);
}

export async function deleteStudent(id: string) {
    const { isSuperAdmin } = await getAuthorizedContext();
    
    if (!isSuperAdmin) {
        throw new Error("Unauthorized: Only super admins can delete students.");
    }

    await prisma.student.delete({ where: { id }});
    revalidatePath('/students');
}

export async function deleteStudents(ids: string[]) {
    const { isSuperAdmin } = await getAuthorizedContext();
    
    if (!isSuperAdmin) {
        throw new Error("Unauthorized: Only super admins can perform bulk deletion.");
    }

    await prisma.student.deleteMany({ where: { id: { in: ids } } });
    revalidatePath('/students');
}

export async function updateStudentPhotos(photoData: { registrationNumber: string; photo: string }[]) {
  const { isSuperAdmin, permissions, assignedClassId } = await getAuthorizedContext();
  
  if (!isSuperAdmin && !permissions.import_students_photos) throw new Error("Unauthorized");

  const registrationNumbers = photoData.map(p => p.registrationNumber);
  
  let whereClause: Prisma.StudentWhereInput = {
    registrationNumber: { in: registrationNumbers },
  };

  // Restrict to managed class if not superadmin or can manage all students
  if (!isSuperAdmin && !permissions.manage_all_students) {
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
      throw new Error("Unauthorized");
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
        throw new Error("Unauthorized");
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
        throw new Error("Unauthorized");
    }
    return targetUser;
}

export async function updateUser(id: string, data: Partial<UserUpdateData>) {
    const { user: currentUser, permissions } = await getAuthorizedContext();

    // Users can update their own profile; admins can update anyone
    if (currentUser.id !== id && !permissions.manage_users) {
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
    if (!permissions.manage_users) throw new Error("Unauthorized");

    const validatedData = serverCreateUserSchema.safeParse(data);
    if (!validatedData.success) throw new Error('Invalid user data');

    const existingUser = await prisma.user.findUnique({
        where: { username: validatedData.data.username },
    });
    if (existingUser) throw new Error('User with this username already exists.');

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
  const { isSuperAdmin, assignedClassId, permissions } = await getAuthorizedContext();

  let whereClause: Prisma.ClassWhereInput = {};

  if (!isSuperAdmin && !permissions.manage_classes) {
    // Non-admins only see their own assigned class
    if (!assignedClassId) return [];
    whereClause.id = assignedClassId;
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
    const { isSuperAdmin, assignedClassId } = await getAuthorizedContext();

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
    if (!isSuperAdmin && classData.id !== assignedClassId) {
        throw new Error("Access Denied");
    }

    return classData;
}

export async function createClass(data: ClassData) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_classes) throw new Error("Unauthorized");

    const validationSchema = getCreateClassSchema();
    const validatedData = validationSchema.safeParse(data);
    if (!validatedData.success) throw new Error('Invalid data');

    await prisma.class.create({ data: validatedData.data });
    revalidatePath('/classes');
}

export async function updateClass(id: string, data: ClassData) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_classes) throw new Error("Unauthorized");

    const validationSchema = getCreateClassSchema();
    const validatedData = validationSchema.safeParse(data);
    if (!validatedData.success) throw new Error('Invalid data');

    await prisma.class.update({ where: { id }, data: validatedData.data });
    revalidatePath('/classes');
}

export async function deleteClass(id: string) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_classes) throw new Error("Unauthorized");

    const studentCount = await prisma.student.count({ where: { classId: id } });
    if (studentCount > 0) throw new Error("Cannot delete a class with students.");
    
    await prisma.class.delete({ where: { id }});
    revalidatePath('/classes');
}

export async function transferStudentsToClass(studentIds: string[], targetClassId: string) {
    const { isSuperAdmin, permissions } = await getAuthorizedContext();
    
    if (!isSuperAdmin && !permissions.transfer_students) throw new Error("Unauthorized: Only super admins or users with transfer permission can transfer students.");

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
      throw new Error("Unauthorized");
    }
    return await prisma.role.findMany({
        include: { _count: { select: { users: true } } },
        orderBy: { name: 'asc' }
    });
}

export async function getRoleById(id: string) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_roles && !permissions.manage_users) {
      throw new Error("Unauthorized");
    }
    return await prisma.role.findUnique({ where: { id } });
}

export async function createRole(data: RoleData) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_roles) throw new Error("Unauthorized");
    await prisma.role.create({ data });
    revalidatePath('/roles');
}

export async function updateRole(id: string, data: RoleData) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_roles) throw new Error("Unauthorized");
    await prisma.role.update({ where: { id }, data });
    revalidatePath('/roles');
}

export async function deleteRole(id: string) {
    const { permissions } = await getAuthorizedContext();
    if (!permissions.manage_roles) throw new Error("Unauthorized");
    await prisma.role.delete({ where: { id } });
    revalidatePath('/roles');
}
