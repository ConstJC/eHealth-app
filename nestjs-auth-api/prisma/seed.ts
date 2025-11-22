import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('AdminPassword123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', { id: admin.id, email: admin.email });

  // Create regular user
  const userPassword = await bcrypt.hash('password!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: Role.USER,
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Regular user created:', { id: user.id, email: user.email });

  // Create inactive user for testing
  const inactivePassword = await bcrypt.hash('password', 12);
  const inactiveUser = await prisma.user.upsert({
    where: { email: 'inactive@example.com' },
    update: {},
    create: {
      email: 'inactive@example.com',
      password: inactivePassword,
      firstName: 'Inactive',
      lastName: 'User',
      role: Role.USER,
      isEmailVerified: true,
      isActive: false,
    },
  });

  console.log('✅ Inactive user created:', { id: inactiveUser.id, email: inactiveUser.email });

  // Create unverified user for testing
  const unverifiedPassword = await bcrypt.hash('password!', 12);
  const unverifiedUser = await prisma.user.upsert({
    where: { email: 'unverified@example.com' },
    update: {},
    create: {
      email: 'unverified@example.com',
      password: unverifiedPassword,
      firstName: 'Unverified',
      lastName: 'User',
      role: Role.USER,
      isEmailVerified: false,
      isActive: true,
      emailVerificationToken: 'test-verification-token',
    },
  });

  console.log('✅ Unverified user created:', { id: unverifiedUser.id, email: unverifiedUser.email });

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('Admin: admin@example.com / AdminPassword123!');
  console.log('User: user@example.com / UserPassword123!');
  console.log('Inactive: inactive@example.com / InactivePassword123!');
  console.log('Unverified: unverified@example.com / UnverifiedPassword123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
