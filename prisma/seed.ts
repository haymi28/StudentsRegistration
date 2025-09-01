
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
        role: 'teacher',
        displayName: classInfo.teacherName,
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
        role: 'admin',
        displayName: classInfo.adminName,
      },
    });
    console.log(`Created admin for ${classInfo.name}`);

    // Create Class and assign teacher as manager
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
