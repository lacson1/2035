/**
 * Script to add demo users for testing
 * Run with: cd backend && npx ts-node scripts/add-demo-users.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function addDemoUsers() {
  try {
    console.log('Adding demo users...\n');

    const demoUsers = [
      {
        email: 'sarah.johnson@hospital2035.com',
        username: 'sarahj',
        firstName: 'Sarah',
        lastName: 'Johnson',
        password: 'password123',
        role: 'physician' as const,
        specialty: 'Internal Medicine',
        department: 'Internal Medicine',
        phone: '555-0100',
      },
      {
        email: 'patricia.williams@hospital2035.com',
        username: 'patriciaw',
        firstName: 'Patricia',
        lastName: 'Williams',
        password: 'password123',
        role: 'nurse' as const,
        specialty: null,
        department: 'Nursing',
        phone: '555-0101',
      },
      {
        email: 'admin@hospital2035.com',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        password: 'admin123',
        role: 'admin' as const,
        specialty: null,
        department: 'Administration',
        phone: '555-0000',
      },
    ];

    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email },
            { username: userData.username },
          ],
        },
      });

      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, updating password...`);
        const passwordHash = await hashPassword(userData.password);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { passwordHash },
        });
        console.log(`✅ Updated password for: ${userData.email}`);
        continue;
      }

      // Hash password
      const passwordHash = await hashPassword(userData.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          specialty: userData.specialty,
          department: userData.department,
          phone: userData.phone,
          isActive: true,
        },
      });

      console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.email})`);
    }

    console.log('\n✨ All demo users added successfully!');
  } catch (error) {
    console.error('❌ Error adding demo users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addDemoUsers();

