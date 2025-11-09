/**
 * Script to check if a user exists in the database
 * Run with: cd backend && npx ts-node scripts/check-user.ts <email>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser(email: string) {
  try {
    console.log(`🔍 Checking for user: ${email}\n`);

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        specialty: true,
        department: true,
      },
    });

    if (user) {
      console.log('✅ User found in database:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('❌ User not found in database');
      
      // Also check by username (in case email was used as username)
      const userByUsername = await prisma.user.findFirst({
        where: {
          username: email.toLowerCase().trim().split('@')[0],
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });

      if (userByUsername) {
        console.log('\n⚠️  Found user with similar username:');
        console.log(JSON.stringify(userByUsername, null, 2));
      }
    }

    // Also list all users for reference
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    if (allUsers.length > 0) {
      console.log('\nAll users:');
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. ${u.email} (${u.username}) - ${u.firstName} ${u.lastName} - ${u.role} - ${u.isActive ? 'Active' : 'Inactive'}`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npx ts-node scripts/check-user.ts <email>');
  console.log('Example: npx ts-node scripts/check-user.ts bisoyef@gmail.com');
  process.exit(1);
}

checkUser(email);

