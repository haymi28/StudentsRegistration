
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { serviceDepartments } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      password: hashedPassword,
      role: 'super_admin',
      displayName: 'Super Admin',
    },
  });
  console.log(`Created super_admin user with id: ${superAdmin.id}`);

  // Create Admins and Teachers for each department
  for (const department of serviceDepartments) {
    // Admin for the department
    const adminUsername = `${department.replace(/\s+/g, '_').toLowerCase()}_admin`;
    const adminUser = await prisma.user.upsert({
        where: { username: adminUsername },
        update: {},
        create: {
            username: adminUsername,
            password: hashedPassword,
            role: 'admin',
            displayName: `${department} Admin`,
            serviceDepartment: department,
        }
    });
    console.log(`Created admin for ${department} with id: ${adminUser.id}`);

    // Teacher for the department
    const teacherUsername = `${department.replace(/\s+/g, '_').toLowerCase()}_teacher`;
    const teacherUser = await prisma.user.upsert({
        where: { username: teacherUsername },
        update: {},
        create: {
            username: teacherUsername,
            password: hashedPassword,
            role: 'teacher',
            displayName: `${department} Teacher`,
            serviceDepartment: department,
        }
    });
    console.log(`Created teacher for ${department} with id: ${teacherUser.id}`);
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
