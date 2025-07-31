import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
    {
        username: 'superadmin',
        password: 'Admin123!',
        role: 'super_admin' as UserRole,
        displayName: 'ዋና ሃላፊ',
    },
    {
        username: 'children_admin',
        password: 'Password123!',
        role: 'children_admin' as UserRole,
        displayName: 'ቀዳማይ -1 ክፍል',
    },
    {
        username: 'children_2_admin',
        password: 'Password123!',
        role: 'children_2_admin' as UserRole,
        displayName: 'ቀዳማይ -2 ክፍል',
    },
    {
        username: 'junior_admin',
        password: 'Password123!',
        role: 'junior_admin' as UserRole,
        displayName: 'ካእላይ ክፍል',
    },
    {
        username: 'senior_admin',
        password: 'Password123!',
        role: 'senior_admin' as UserRole,
        displayName: 'ማእከላይ ክፍል',
    },
    {
        username: 'youth_admin',
        password: 'Password123!',
        role: 'youth_admin' as UserRole,
        displayName: 'የወጣት ክፍል',
    },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        username: u.username,
        password: u.password,
        role: u.role,
        displayName: u.displayName,
      },
    });
    console.log(`Created user with id: ${user.id}`);
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
