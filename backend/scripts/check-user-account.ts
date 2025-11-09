/**
 * User Account Diagnostic Tool
 * Checks if a user exists and provides diagnostic information
 */

import prisma from '../src/config/database';
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

async function checkUserAccount() {
  try {
    console.log('\n🔍 User Account Diagnostic Tool\n');
    
    const email = await question('Enter email address to check: ');
    
    if (!email) {
      console.log('❌ Email is required');
      process.exit(1);
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    console.log(`\n📧 Checking for: ${email}`);
    console.log(`📧 Normalized: ${normalizedEmail}\n`);

    // Check exact match (case-sensitive)
    const exactMatch = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    // Check case-insensitive match
    const caseInsensitiveMatch = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive',
        },
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
        lastLogin: true,
      },
    });

    // List all users with similar emails
    const similarEmails = await prisma.user.findMany({
      where: {
        email: {
          contains: normalizedEmail.split('@')[0],
          mode: 'insensitive',
        },
      },
      select: {
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
      take: 10,
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 DIAGNOSTIC RESULTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (exactMatch) {
      console.log('✅ EXACT MATCH FOUND (case-sensitive):');
      console.log(`   ID: ${exactMatch.id}`);
      console.log(`   Email: ${exactMatch.email}`);
      console.log(`   Username: ${exactMatch.username}`);
      console.log(`   Name: ${exactMatch.firstName} ${exactMatch.lastName}`);
      console.log(`   Role: ${exactMatch.role}`);
      console.log(`   Active: ${exactMatch.isActive ? 'Yes' : 'No'}`);
      console.log(`   Created: ${exactMatch.createdAt}`);
      console.log(`   Last Login: ${exactMatch.lastLogin || 'Never'}`);
    } else if (caseInsensitiveMatch) {
      console.log('⚠️  CASE-INSENSITIVE MATCH FOUND:');
      console.log(`   ID: ${caseInsensitiveMatch.id}`);
      console.log(`   Email in DB: ${caseInsensitiveMatch.email}`);
      console.log(`   Username: ${caseInsensitiveMatch.username}`);
      console.log(`   Name: ${caseInsensitiveMatch.firstName} ${caseInsensitiveMatch.lastName}`);
      console.log(`   Role: ${caseInsensitiveMatch.role}`);
      console.log(`   Active: ${caseInsensitiveMatch.isActive ? 'Yes' : 'No'}`);
      console.log(`   Created: ${caseInsensitiveMatch.createdAt}`);
      console.log(`   Last Login: ${caseInsensitiveMatch.lastLogin || 'Never'}`);
      console.log('\n💡 ISSUE: Email case mismatch!');
      console.log(`   You entered: ${email}`);
      console.log(`   Database has: ${caseInsensitiveMatch.email}`);
      console.log('\n🔧 SOLUTION: Use the exact email from database or update login to be case-insensitive');
    } else {
      console.log('❌ NO USER FOUND');
      console.log(`   Email "${email}" is not registered`);
      
      if (similarEmails.length > 0) {
        console.log('\n📋 Similar emails found:');
        similarEmails.forEach((user) => {
          console.log(`   - ${user.email} (${user.firstName} ${user.lastName}) - Active: ${user.isActive}`);
        });
      }
    }

    // List all users
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    if (allUsers.length > 0) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 ALL REGISTERED USERS (last 20):');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Username: ${user.username} | Name: ${user.firstName} ${user.lastName} | Active: ${user.isActive ? 'Yes' : 'No'}`);
      });
    }

    console.log('\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

checkUserAccount();

