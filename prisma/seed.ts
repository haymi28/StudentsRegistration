
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create a default super_admin user
  const superAdminUsername = 'superadmin';
  const existingUser = await prisma.user.findUnique({
    where: { username: superAdminUsername },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        username: superAdminUsername,
        displayName: 'Super Admin',
        password: 'password', // In a real app, this should be hashed
        role: 'super_admin',
      },
    });
    console.log(`Created super admin user: ${superAdminUsername}`);
  } else {
    console.log(`User ${superAdminUsername} already exists.`);
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
