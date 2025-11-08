#!/usr/bin/env node

/**
 * Backend Debugging Script
 * Run with: node debug.js
 */

const { execSync } = require('child_process');
const http = require('http');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function check(command, description) {
  try {
    const result = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    log(`✅ ${description}`, 'green');
    return { success: true, result };
  } catch (error) {
    log(`❌ ${description}`, 'red');
    return { success: false, error: error.message };
  }
}

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          log(`✅ Backend is running on port ${port}`, 'green');
          log(`   Response: ${data.substring(0, 100)}`, 'cyan');
          resolve({ success: true, data });
        } else {
          log(`⚠️  Backend responded with status ${res.statusCode}`, 'yellow');
          resolve({ success: false, status: res.statusCode });
        }
      });
    });

    req.on('error', () => {
      log(`❌ Backend is not running on port ${port}`, 'red');
      resolve({ success: false });
    });

    req.setTimeout(2000, () => {
      req.destroy();
      log(`❌ Backend health check timed out`, 'red');
      resolve({ success: false });
    });
  });
}

async function main() {
  log('\n🔍 Backend Debugging Tool\n', 'blue');
  log('='.repeat(50), 'blue');

  // Check Node.js version
  log('\n1. Checking Node.js...', 'blue');
  const nodeCheck = check('node --version', 'Node.js installed');
  if (nodeCheck.success) {
    log(`   Version: ${nodeCheck.result.trim()}`, 'cyan');
  }

  // Check npm version
  log('\n2. Checking npm...', 'blue');
  const npmCheck = check('npm --version', 'npm installed');
  if (npmCheck.success) {
    log(`   Version: ${npmCheck.result.trim()}`, 'cyan');
  }

  // Check if .env exists
  log('\n3. Checking environment configuration...', 'blue');
  try {
    require('fs').accessSync('.env');
    log('✅ .env file exists', 'green');
    
    // Try to load env vars (without dotenv to avoid side effects)
    const envContent = require('fs').readFileSync('.env', 'utf-8');
    const envVars = {
      DATABASE_URL: envContent.match(/DATABASE_URL=(.+)/)?.[1]?.replace(/['"]/g, ''),
      JWT_SECRET: envContent.match(/JWT_SECRET=(.+)/)?.[1]?.replace(/['"]/g, ''),
      CORS_ORIGIN: envContent.match(/CORS_ORIGIN=(.+)/)?.[1]?.replace(/['"]/g, ''),
      PORT: envContent.match(/PORT=(.+)/)?.[1]?.replace(/['"]/g, '') || '3000',
    };

    if (envVars.DATABASE_URL) {
      log('✅ DATABASE_URL is set', 'green');
    } else {
      log('❌ DATABASE_URL not set', 'red');
    }

    if (envVars.JWT_SECRET && !envVars.JWT_SECRET.includes('change-me')) {
      log('✅ JWT_SECRET is set', 'green');
    } else {
      log('⚠️  JWT_SECRET not set or using default', 'yellow');
    }

    if (envVars.CORS_ORIGIN) {
      log(`✅ CORS_ORIGIN: ${envVars.CORS_ORIGIN}`, 'green');
    } else {
      log('⚠️  CORS_ORIGIN not set (using default)', 'yellow');
    }

    log(`✅ PORT: ${envVars.PORT}`, 'green');
  } catch (error) {
    log('❌ .env file not found', 'red');
  }

  // Check node_modules
  log('\n4. Checking dependencies...', 'blue');
  try {
    require('fs').accessSync('node_modules');
    log('✅ node_modules directory exists', 'green');
    
    // Check for key dependencies
    const keyDeps = ['express', '@prisma/client', 'jsonwebtoken'];
    keyDeps.forEach(dep => {
      try {
        require('fs').accessSync(`node_modules/${dep}`);
        log(`   ✅ ${dep} installed`, 'green');
      } catch {
        log(`   ❌ ${dep} not found`, 'red');
      }
    });
  } catch {
    log('❌ node_modules not found. Run: npm install', 'red');
  }

  // Check Prisma
  log('\n5. Checking Prisma setup...', 'blue');
  try {
    require('fs').accessSync('prisma/schema.prisma');
    log('✅ Prisma schema exists', 'green');
  } catch {
    log('❌ Prisma schema not found', 'red');
  }

  try {
    require('fs').accessSync('node_modules/@prisma/client');
    log('✅ Prisma Client generated', 'green');
  } catch {
    log('⚠️  Prisma Client not generated. Run: npm run prisma:generate', 'yellow');
  }

  // Check if backend is running
  log('\n6. Checking if backend is running...', 'blue');
  const port = process.env.PORT || 3000;
  const backendStatus = await checkPort(port);

  // Check database connection (if backend is running)
  if (backendStatus.success) {
    log('\n7. Testing API endpoints...', 'blue');
    
    // Test API info endpoint
    const apiTest = await new Promise((resolve) => {
      const req = http.get(`http://localhost:${port}/api/v1`, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            log('✅ API endpoint responding', 'green');
            try {
              const json = JSON.parse(data);
              log(`   Available endpoints: ${Object.keys(json.endpoints || {}).length}`, 'cyan');
            } catch {}
            resolve(true);
          } else {
            log(`⚠️  API endpoint returned status ${res.statusCode}`, 'yellow');
            resolve(false);
          }
        });
      });

      req.on('error', () => {
        log('❌ API endpoint not responding', 'red');
        resolve(false);
      });

      req.setTimeout(2000, () => {
        req.destroy();
        log('❌ API endpoint timed out', 'red');
        resolve(false);
      });
    });
  } else {
    log('\n7. Skipping API tests (backend not running)', 'yellow');
    log('   Start backend with: npm run dev', 'cyan');
  }

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('\n📋 Summary:', 'blue');
  log('\nNext steps:', 'cyan');
  log('1. If backend not running: npm run dev', 'cyan');
  log('2. If dependencies missing: npm install', 'cyan');
  log('3. If Prisma not generated: npm run prisma:generate', 'cyan');
  log('4. If database issues: npm run prisma:studio', 'cyan');
  log('5. View logs: Check terminal where backend is running', 'cyan');
  log('\nFor more help, see:', 'cyan');
  log('- DEBUG_GUIDE.md', 'cyan');
  log('- START_BACKEND.md', 'cyan');
  log('- SETUP_INSTRUCTIONS.md', 'cyan');
  log('');
}

main().catch(console.error);

