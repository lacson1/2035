/**
 * Script to add 2 providers to the database
 * Run with: npx ts-node backend/scripts/add-providers.ts
 * or: cd backend && npx ts-node scripts/add-providers.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function addProviders() {
  try {
    console.log('Adding providers...\n');

    const providers = [
      {
        email: 'dr.smith@hospital2035.com',
        username: 'drsmith',
        firstName: 'John',
        lastName: 'Smith',
        password: 'password123',
        role: 'physician' as const,
        specialty: 'Cardiology',
        department: 'Cardiology',
        phone: '555-0101',
      },
      {
        email: 'dr.jones@hospital2035.com',
        username: 'drjones',
        firstName: 'Sarah',
        lastName: 'Jones',
        password: 'password123',
        role: 'physician' as const,
        specialty: 'Internal Medicine',
        department: 'Internal Medicine',
        phone: '555-0102',
      },
    ];

    for (const providerData of providers) {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: providerData.email },
            { username: providerData.username },
          ],
        },
      });

      if (existingUser) {
        console.log(`⚠️  User ${providerData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const passwordHash = await hashPassword(providerData.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: providerData.email,
          username: providerData.username,
          passwordHash,
          firstName: providerData.firstName,
          lastName: providerData.lastName,
          role: providerData.role,
          specialty: providerData.specialty,
          department: providerData.department,
          phone: providerData.phone,
          isActive: true,
        },
      });

      console.log(`✅ Created provider: ${user.firstName} ${user.lastName} (${user.email})`);
    }

    console.log('\n✨ All providers added successfully!');
  } catch (error) {
    console.error('❌ Error adding providers:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addProviders();

