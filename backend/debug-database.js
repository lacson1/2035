#!/usr/bin/env node

/**
 * Database Debugging Script
 * Tests database connection, migrations, and basic operations
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

// Read config directly from environment variables
const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || '',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn', 'info'],
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function checkDatabaseConnection() {
  logSection('🔌 Database Connection Test');
  
  try {
    log('Testing database connection...', 'blue');
    await prisma.$connect();
    log('✅ Database connection successful!', 'green');
    
    // Get database info
    const result = await prisma.$queryRaw`SELECT version() as version`;
    log(`\n📊 Database Version:`, 'blue');
    console.log(result[0]?.version || 'Unknown');
    
    return true;
  } catch (error) {
    log('❌ Database connection failed!', 'red');
    console.error(error.message);
    if (error.code === 'P1001') {
      log('\n💡 Troubleshooting:', 'yellow');
      log('  - Check if PostgreSQL is running');
      log('  - Verify DATABASE_URL in .env file');
      log('  - Check network connectivity');
      log('  - Verify database credentials');
    }
    return false;
  }
}

async function checkMigrations() {
  logSection('📦 Database Migrations Status');
  
  try {
    const migrations = await prisma.$queryRaw`
      SELECT * FROM _prisma_migrations 
      ORDER BY finished_at DESC 
      LIMIT 10
    `;
    
    if (migrations.length === 0) {
      log('⚠️  No migrations found. Run: npm run prisma:migrate', 'yellow');
    } else {
      log(`✅ Found ${migrations.length} migration(s)`, 'green');
      console.table(migrations.map(m => ({
        migration_name: m.migration_name,
        finished_at: m.finished_at?.toISOString() || 'Pending',
        applied_steps_count: m.applied_steps_count,
      })));
    }
  } catch (error) {
    log('⚠️  Could not check migrations (this is normal if migrations table does not exist)', 'yellow');
    log('   Run: npm run prisma:migrate', 'yellow');
  }
}

async function checkTables() {
  logSection('📋 Database Tables');
  
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      log('⚠️  No tables found. Run migrations: npm run prisma:migrate', 'yellow');
    } else {
      log(`✅ Found ${tables.length} table(s):`, 'green');
      tables.forEach((table, index) => {
        log(`   ${index + 1}. ${table.table_name}`, 'blue');
      });
    }
  } catch (error) {
    log('❌ Error checking tables:', 'red');
    console.error(error.message);
  }
}

async function checkData() {
  logSection('📊 Database Data Check');
  
  try {
    // Check Users
    const userCount = await prisma.user.count();
    log(`👥 Users: ${userCount}`, userCount > 0 ? 'green' : 'yellow');
    
    // Check Patients
    const patientCount = await prisma.patient.count();
    log(`🏥 Patients: ${patientCount}`, patientCount > 0 ? 'green' : 'yellow');
    
    // Check Hubs
    const hubCount = await prisma.hub.count();
    log(`🏢 Hubs: ${hubCount}`, hubCount > 0 ? 'green' : 'yellow');
    
    // Check Appointments
    const appointmentCount = await prisma.appointment.count();
    log(`📅 Appointments: ${appointmentCount}`, appointmentCount > 0 ? 'green' : 'yellow');
    
    if (userCount === 0 && patientCount === 0) {
      log('\n💡 Tip: Run seed script to populate test data:', 'yellow');
      log('   npm run prisma:seed', 'yellow');
    }
  } catch (error) {
    log('❌ Error checking data:', 'red');
    console.error(error.message);
  }
}

async function testQueries() {
  logSection('🧪 Testing Database Queries');
  
  try {
    // Test simple query
    log('Testing simple query...', 'blue');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    log('✅ Simple query successful', 'green');
    
    // Test User model
    log('Testing User model...', 'blue');
    const userCount = await prisma.user.count();
    log(`✅ User model accessible (${userCount} users)`, 'green');
    
    // Test Patient model
    log('Testing Patient model...', 'blue');
    const patientCount = await prisma.patient.count();
    log(`✅ Patient model accessible (${patientCount} patients)`, 'green');
    
  } catch (error) {
    log('❌ Query test failed:', 'red');
    console.error(error.message);
    if (error.message.includes('does not exist')) {
      log('\n💡 Run migrations: npm run prisma:migrate', 'yellow');
    }
  }
}

async function checkEnvironment() {
  logSection('⚙️  Environment Configuration');
  
  const dbUrl = config.database.url;
  if (!dbUrl) {
    log('❌ DATABASE_URL not set!', 'red');
    return;
  }
  
  // Mask password in URL for security
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  log(`📝 DATABASE_URL: ${maskedUrl}`, 'blue');
  
  // Parse URL to show components
  try {
    const url = new URL(dbUrl.replace('postgresql://', 'http://'));
    log(`   Host: ${url.hostname}`, 'blue');
    log(`   Port: ${url.port || '5432'}`, 'blue');
    log(`   Database: ${url.pathname.slice(1)}`, 'blue');
    log(`   User: ${url.username}`, 'blue');
  } catch (error) {
    log('   Could not parse DATABASE_URL', 'yellow');
  }
  
  log(`\n🌍 NODE_ENV: ${config.nodeEnv}`, 'blue');
  log(`🔌 Port: ${config.port}`, 'blue');
}

async function checkPrismaClient() {
  logSection('🔧 Prisma Client Status');
  
  try {
    // Test Prisma Client with a simple query
    await prisma.$queryRaw`SELECT 1 as test`;
    log('✅ Prisma Client is working', 'green');
    
    // Check if migrations are needed
    try {
      await prisma.$executeRaw`SELECT 1 FROM _prisma_migrations LIMIT 1`;
      log('✅ Migrations table exists', 'green');
    } catch (error) {
      log('⚠️  Migrations table not found', 'yellow');
      log('   Run: npm run prisma:migrate', 'yellow');
    }
  } catch (error) {
    log('❌ Prisma Client error:', 'red');
    console.error(error.message);
  }
}

async function runDiagnostics() {
  log('\n🔍 Starting Database Diagnostics...\n', 'cyan');
  
  // Check environment
  await checkEnvironment();
  
  // Check Prisma Client
  await checkPrismaClient();
  
  // Test connection
  const connected = await checkDatabaseConnection();
  
  if (!connected) {
    log('\n❌ Cannot proceed without database connection', 'red');
    log('\n💡 Next Steps:', 'yellow');
    log('   1. Check if PostgreSQL is running');
    log('   2. Verify DATABASE_URL in backend/.env');
    log('   3. Check database credentials');
    log('   4. Try: docker-compose up -d (if using Docker)', 'yellow');
    process.exit(1);
  }
  
  // Check migrations
  await checkMigrations();
  
  // Check tables
  await checkTables();
  
  // Test queries
  await testQueries();
  
  // Check data
  await checkData();
  
  logSection('✅ Diagnostics Complete');
  
  log('\n💡 Useful Commands:', 'yellow');
  log('   npm run prisma:migrate    - Run migrations', 'blue');
  log('   npm run prisma:studio     - Open Prisma Studio', 'blue');
  log('   npm run prisma:seed       - Seed database', 'blue');
  log('   npm run seed:hubs         - Seed hubs', 'blue');
}

// Run diagnostics
runDiagnostics()
  .catch((error) => {
    log('\n❌ Fatal error:', 'red');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    log('\n👋 Disconnected from database', 'blue');
  });

