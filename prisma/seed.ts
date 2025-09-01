
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // --- Create Permissions ---
  const permissions = [
    { name: 'manage_users', description: 'Create, edit, and delete users' },
    { name: 'manage_roles', description: 'Create, edit, and delete roles and their permissions' },
    { name: 'manage_classes', description: 'Create, edit, and delete classes and assign managers' },
    { name: 'manage_all_students', description: 'View, edit, and delete any student in any class' },
    { name: 'manage_class_students', description: 'View, edit, and delete students in their own class' },
    { name: 'view_students', description: 'View students in their own class' },
    { name: 'import_students', description: 'Bulk import students from a file' },
    { name: 'export_students', description: 'Export student data' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }
  console.log('Created permissions.');

  const allPermissions = await prisma.permission.findMany();

  // --- Create Roles ---
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      description: 'Has all permissions.',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Manages a specific class and its students.',
    },
  });

  const teacherRole = await prisma.role.upsert({
    where: { name: 'Teacher' },
    update: {},
    create: {
      name: 'Teacher',
      description: 'Views students in their assigned class.',
    },
  });
  console.log('Created roles.');

  // --- Assign Permissions to Roles ---
  await prisma.rolePermission.deleteMany({}); // Clear existing permissions
  // Super Admin gets all permissions
  for (const perm of allPermissions) {
    await prisma.rolePermission.create({
      data: { roleId: superAdminRole.id, permissionId: perm.id },
    });
  }

  // Admin permissions
  const adminPermNames = ['manage_class_students'];
  const adminPermissions = await prisma.permission.findMany({ where: { name: { in: adminPermNames } } });
  for (const perm of adminPermissions) {
    await prisma.rolePermission.create({
      data: { roleId: adminRole.id, permissionId: perm.id },
    });
  }
  
  // Teacher permissions
  const teacherPermNames = ['view_students'];
  const teacherPermissions = await prisma.permission.findMany({ where: { name: { in: teacherPermNames } } });
  for (const perm of teacherPermissions) {
      await prisma.rolePermission.create({
          data: { roleId: teacherRole.id, permissionId: perm.id },
      });
  }

  console.log('Assigned permissions to roles.');

  // --- Create Super Admin User ---
  await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {
      roleId: superAdminRole.id,
    },
    create: {
      username: 'superadmin',
      password: hashedPassword,
      displayName: 'Super Admin',
      roleId: superAdminRole.id,
    },
  });
  console.log(`Created super_admin user.`);
  
  // Create initial classes and users
  const classesToCreate = [
    { name: 'ቀዳማይ -1 ክፍል', teacherName: 'Children 1 Teacher', adminName: 'Children 1 Admin' },
    { name: 'ቀዳማይ -2 ክፍል', teacherName: 'Children 2 Teacher', adminName: 'Children 2 Admin' },
    { name: 'ካእላይ ክፍል', teacherName: 'Junior Teacher', adminName: 'Junior Admin' },
    { name: 'ማእከላይ ክፍል', teacherName: 'Senior Teacher', adminName: 'Senior Admin' },
    { name: 'የወጣት ክፍል', teacherName: 'Youth Teacher', adminName: 'Youth Admin' },
  ];

  for (const classInfo of classesToCreate) {
    // Create Teacher
    const teacherUsername = classInfo.name.replace(/\s+/g, '_').toLowerCase() + '_teacher';
    const teacher = await prisma.user.upsert({
      where: { username: teacherUsername },
      update: {},
      create: {
        username: teacherUsername,
        password: hashedPassword,
        displayName: classInfo.teacherName,
        roleId: teacherRole.id,
      },
    });
    console.log(`Created teacher for ${classInfo.name} with id: ${teacher.id}`);

    // Create Admin
    const adminUsername = classInfo.name.replace(/\s+/g, '_').toLowerCase() + '_admin';
     await prisma.user.upsert({
      where: { username: adminUsername },
      update: {},
      create: {
        username: adminUsername,
        password: hashedPassword,
        displayName: classInfo.adminName,
        roleId: adminRole.id,
      },
    });
    console.log(`Created admin for ${classInfo.name}`);

    // Create Class and assign manager
    const newClass = await prisma.class.upsert({
        where: { name: classInfo.name },
        update: { managerId: teacher.id },
        create: {
            name: classInfo.name,
            managerId: teacher.id
        }
    });
    console.log(`Created class '${newClass.name}' and assigned manager ${teacher.displayName}`);
  }


  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
