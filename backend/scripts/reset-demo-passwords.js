/**
 * Script to reset demo user passwords
 * Run in container: node /app/scripts/reset-demo-passwords.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function resetPasswords() {
  try {
    console.log('Resetting demo user passwords...\n');

    const users = [
      { email: 'admin@hospital2035.com', password: 'Admin123!' },
      { email: 'sarah.johnson@hospital2035.com', password: 'Password123!' },
      { email: 'patricia.williams@hospital2035.com', password: 'Password123!' },
    ];

    for (const userData of users) {
      const user = await prisma.user.findFirst({
        where: { email: userData.email },
      });

      if (!user) {
        console.log(`⚠️  User ${userData.email} not found, skipping...`);
        continue;
      }

      const passwordHash = await hashPassword(userData.password);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      console.log(`✅ Reset password for: ${userData.email}`);
    }

    console.log('\n✨ All passwords reset successfully!');
    console.log('\nDemo credentials:');
    console.log('Admin: admin@hospital2035.com / Admin123!');
    console.log('Physician: sarah.johnson@hospital2035.com / Password123!');
    console.log('Nurse: patricia.williams@hospital2035.com / Password123!');
  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPasswords();

