import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@restaurant.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+251911234567',
      isActive: true,
    },
  });

  console.log('Admin user created:', admin.email);

  // Create waiter users
  const waiter1Password = await hashPassword('waiter123');
  const waiter1 = await prisma.user.upsert({
    where: { email: 'waiter1@restaurant.com' },
    update: {},
    create: {
      name: 'John Waiter',
      email: 'waiter1@restaurant.com',
      password: waiter1Password,
      role: 'WAITER',
      phone: '+251911234569',
      isActive: true,
    },
  });

  console.log('Waiter 1 created:', waiter1.email);

  const waiter2Password = await hashPassword('waiter123');
  const waiter2 = await prisma.user.upsert({
    where: { email: 'waiter2@restaurant.com' },
    update: {},
    create: {
      name: 'Sarah Waiter',
      email: 'waiter2@restaurant.com',
      password: waiter2Password,
      role: 'WAITER',
      phone: '+251911234570',
      isActive: true,
    },
  });

  console.log('Waiter 2 created:', waiter2.email);

  const waiter3Password = await hashPassword('waiter123');
  const waiter3 = await prisma.user.upsert({
    where: { email: 'waiter3@restaurant.com' },
    update: {},
    create: {
      name: 'Mike Waiter',
      email: 'waiter3@restaurant.com',
      password: waiter3Password,
      role: 'WAITER',
      phone: '+251911234571',
      isActive: true,
    },
  });

  console.log('Waiter 3 created:', waiter3.email);

  // Create cashier users
  const cashier1Password = await hashPassword('cashier123');
  const cashier1 = await prisma.user.upsert({
    where: { email: 'cashier1@restaurant.com' },
    update: {},
    create: {
      name: 'Alice Cashier',
      email: 'cashier1@restaurant.com',
      password: cashier1Password,
      role: 'CASHIER',
      phone: '+251911234572',
      isActive: true,
    },
  });

  console.log('Cashier 1 created:', cashier1.email);

  const cashier2Password = await hashPassword('cashier123');
  const cashier2 = await prisma.user.upsert({
    where: { email: 'cashier2@restaurant.com' },
    update: {},
    create: {
      name: 'Bob Cashier',
      email: 'cashier2@restaurant.com',
      password: cashier2Password,
      role: 'CASHIER',
      phone: '+251911234573',
      isActive: true,
    },
  });

  console.log('Cashier 2 created:', cashier2.email);

  // Create kitchen staff users
  const kitchen1Password = await hashPassword('kitchen123');
  const kitchen1 = await prisma.user.upsert({
    where: { email: 'kitchen1@restaurant.com' },
    update: {},
    create: {
      name: 'Chef Gordon',
      email: 'kitchen1@restaurant.com',
      password: kitchen1Password,
      role: 'KITCHEN',
      phone: '+251911234574',
      isActive: true,
    },
  });

  console.log('Kitchen 1 created:', kitchen1.email);

  const kitchen2Password = await hashPassword('kitchen123');
  const kitchen2 = await prisma.user.upsert({
    where: { email: 'kitchen2@restaurant.com' },
    update: {},
    create: {
      name: 'Chef Julia',
      email: 'kitchen2@restaurant.com',
      password: kitchen2Password,
      role: 'KITCHEN',
      phone: '+251911234575',
      isActive: true,
    },
  });

  console.log('Kitchen 2 created:', kitchen2.email);

  const kitchen3Password = await hashPassword('kitchen123');
  const kitchen3 = await prisma.user.upsert({
    where: { email: 'kitchen3@restaurant.com' },
    update: {},
    create: {
      name: 'Chef Marco',
      email: 'kitchen3@restaurant.com',
      password: kitchen3Password,
      role: 'KITCHEN',
      phone: '+251911234576',
      isActive: true,
    },
  });

  console.log('Kitchen 3 created:', kitchen3.email);

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
