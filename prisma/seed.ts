
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // --- All Permissions Definition ---
  const allPermissions = {
    view_dashboard: true,
    view_students: true,
    manage_class_students: true,
    manage_classes: true,
    manage_users: true,
    manage_roles: true,
    import_students_text: true,
    import_students_photos: true,
    export_students_text: true,
    export_students_photos: true,
    transfer_students: true,
    manage_all_students: true,
  };

  // --- Create Super Admin Role ---
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {
      permissions: allPermissions,
    },
    create: {
      name: 'Super Admin',
      description: 'Has all permissions.',
      permissions: allPermissions,
    },
  });
  console.log('Created Super Admin role with all permissions.');
  
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
