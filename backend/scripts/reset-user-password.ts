/**
 * Script to reset a user's password
 * Run with: cd backend && npx tsx scripts/reset-user-password.ts <email> <newPassword>
 * Or run interactively: cd backend && npx tsx scripts/reset-user-password.ts
 */

import prisma from '../src/config/database';
import { AuthService } from '../src/services/auth.service';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function resetPassword() {
  try {
    const args = process.argv.slice(2);
    let email: string;
    let newPassword: string;

    if (args.length >= 2) {
      email = args[0];
      newPassword = args[1];
    } else {
      console.log('\n🔐 Password Reset Tool\n');
      email = await question('Enter email address: ');
      newPassword = await question('Enter new password: ');
    }

    if (!email || !newPassword) {
      console.log('❌ Email and password are required');
      process.exit(1);
    }

    if (newPassword.length < 8) {
      console.log('❌ Password must be at least 8 characters');
      process.exit(1);
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    console.log(`\n📧 Looking for user: ${email}`);
    console.log(`📧 Normalized: ${normalizedEmail}\n`);

    // Find user (case-insensitive)
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: 'insensitive',
          },
        },
      });
    }

    if (!user) {
      console.log('❌ User not found');
      
      // Show similar emails
      const similarUsers = await prisma.user.findMany({
        where: {
          email: {
            contains: normalizedEmail.split('@')[0],
            mode: 'insensitive',
          },
        },
        select: { email: true, firstName: true, lastName: true },
        take: 5,
      });

      if (similarUsers.length > 0) {
        console.log('\n📋 Similar emails found:');
        similarUsers.forEach((u) => {
          console.log(`   - ${u.email} (${u.firstName} ${u.lastName})`);
        });
      }
      
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}\n`);

    // Hash new password
    const authService = new AuthService();
    const passwordHash = await authService.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    console.log('✅ Password reset successfully!');
    console.log(`\n📝 User can now login with:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${newPassword}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

resetPassword();

