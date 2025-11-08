#!/usr/bin/env node

/**
 * Reset admin password to a known value
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  console.log('🔧 Resetting admin password...\n');

  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!admin) {
      console.log('❌ No admin user found');
      return;
    }

    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash: hashedPassword }
    });

    console.log(`✅ Admin password reset successfully!`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${newPassword}`);
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();

