#!/usr/bin/env node

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('\n🔍 Testing Database Connection...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('❌ DATABASE_URL is not set in .env file');
    console.log('\n📝 Please set DATABASE_URL in your .env file:');
    console.log('   DATABASE_URL="postgresql://user:password@host:port/database"');
    process.exit(1);
  }
  
  // Mask password in URL for display
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
  console.log(`✅ DATABASE_URL is set: ${maskedUrl}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Test 1: Basic connection
    console.log('\n📡 Test 1: Testing basic database connection...');
    await prisma.$connect();
    console.log('✅ Successfully connected to database');
    
    // Test 2: Run a simple query
    console.log('\n📊 Test 2: Running simple query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful:', result);
    
    // Test 3: Check if tables exist
    console.log('\n📋 Test 3: Checking database tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found in database');
      console.log('   Run: npm run prisma:migrate to create tables');
    } else {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.slice(0, 10).forEach(t => console.log(`   - ${t.table_name}`));
      if (tables.length > 10) {
        console.log(`   ... and ${tables.length - 10} more`);
      }
    }
    
    // Test 4: Check critical tables
    console.log('\n🔍 Test 4: Checking critical tables...');
    const criticalTables = ['users', 'patients', 'appointments', 'medications'];
    const tableNames = tables.map(t => t.table_name);
    
    let missingTables = [];
    for (const tableName of criticalTables) {
      if (tableNames.includes(tableName)) {
        console.log(`   ✅ ${tableName} table exists`);
      } else {
        console.log(`   ❌ ${tableName} table missing`);
        missingTables.push(tableName);
      }
    }
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  Missing tables detected!');
      console.log('   Run: npm run prisma:migrate to create missing tables');
    }
    
    // Test 5: Check users table
    console.log('\n👥 Test 5: Checking users table...');
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Users table accessible - ${userCount} users found`);
      
      if (userCount === 0) {
        console.log('   ⚠️  No users in database. Run seed script:');
        console.log('   npm run prisma:seed');
      } else {
        const adminUsers = await prisma.user.count({ where: { role: 'admin' } });
        console.log(`   📊 Admin users: ${adminUsers}`);
        console.log(`   📊 Total users: ${userCount}`);
      }
    } catch (error) {
      console.log('❌ Error accessing users table:', error.message);
    }
    
    // Test 6: Check patients table
    console.log('\n🏥 Test 6: Checking patients table...');
    try {
      const patientCount = await prisma.patient.count();
      console.log(`✅ Patients table accessible - ${patientCount} patients found`);
    } catch (error) {
      console.log('❌ Error accessing patients table:', error.message);
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DATABASE CONNECTION TEST COMPLETED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ DATABASE CONNECTION TEST FAILED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔴 Error:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Possible Solutions:');
      console.log('   1. Check if PostgreSQL is running');
      console.log('   2. Verify DATABASE_URL is correct');
      console.log('   3. Check if database exists');
      console.log('   4. Verify network connectivity to database');
    } else if (error.code === 'P1002') {
      console.log('\n💡 Database server timed out');
      console.log('   - Check if database server is running');
      console.log('   - Verify network connectivity');
    } else if (error.code === 'P1003') {
      console.log('\n💡 Database does not exist');
      console.log('   - Create the database first');
      console.log('   - Then run: npm run prisma:migrate');
    } else if (error.code === 'P1008') {
      console.log('\n💡 Operation timeout');
      console.log('   - Database is responding slowly');
      console.log('   - Check database server load');
    } else if (error.code === 'P1009') {
      console.log('\n💡 Database already exists');
    } else if (error.code === 'P1010') {
      console.log('\n💡 Authentication failed');
      console.log('   - Check database username and password');
      console.log('   - Verify user has proper permissions');
    }
    
    console.log('\n📚 Error Code:', error.code || 'Unknown');
    console.log('📝 Full error:', error.stack);
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database\n');
  }
}

testConnection();

