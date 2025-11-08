#!/usr/bin/env node

/**
 * Test all API endpoints to identify which ones are not working
 */

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'sarah.johnson@hospital2035.com';
const TEST_PASSWORD = 'password123';
const ADMIN_EMAIL = 'admin-test@hospital2035.com';
const ADMIN_PASSWORD = 'password123';

const results = {
  passed: [],
  failed: [],
  skipped: []
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(method, url, token = null, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({ message: 'No JSON response' }));
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

async function testEndpoint(name, method, path, token = null, body = null, expectedStatus = 200) {
  const url = `${BASE_URL}${path}`;
  log(`\nTesting: ${method} ${path}`, 'cyan');
  
  // Add small delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const result = await makeRequest(method, url, token, body);
  
  if (result.status === 0) {
    log(`  ❌ FAILED: Connection error - ${result.error}`, 'red');
    results.failed.push({ name, method, path, error: result.error });
    return false;
  }
  
  if (result.status === expectedStatus || (expectedStatus === 'any' && result.ok)) {
    log(`  ✅ PASSED: Status ${result.status}`, 'green');
    results.passed.push({ name, method, path, status: result.status });
    return true;
  } else if (result.status === 401) {
    log(`  ⚠️  SKIPPED: Authentication required (401)`, 'yellow');
    results.skipped.push({ name, method, path, reason: 'Authentication required' });
    return null;
  } else if (result.status === 404) {
    log(`  ❌ FAILED: Not found (404)`, 'red');
    results.failed.push({ name, method, path, status: result.status, data: result.data });
    return false;
  } else {
    log(`  ❌ FAILED: Status ${result.status} (expected ${expectedStatus})`, 'red');
    log(`  Response: ${JSON.stringify(result.data).substring(0, 200)}`, 'red');
    results.failed.push({ name, method, path, status: result.status, expected: expectedStatus, data: result.data });
    return false;
  }
}

async function main() {
  log('\n═══════════════════════════════════════════════════════════', 'blue');
  log('  API Endpoint Testing Script', 'blue');
  log('═══════════════════════════════════════════════════════════\n', 'blue');

  // Step 1: Test health endpoint (no auth required)
  log('STEP 1: Testing Health Endpoints', 'yellow');
  await testEndpoint('Health Check', 'GET', '/health');
  await testEndpoint('Health Live', 'GET', '/health/live');
  await testEndpoint('Health Ready', 'GET', '/health/ready');

  // Step 2: Login to get auth tokens (regular user and admin)
  log('\nSTEP 2: Authenticating...', 'yellow');
  
  // Login as regular user
  const loginResult = await makeRequest('POST', `${BASE_URL}/api/v1/auth/login`, null, {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });

  let authToken = null;
  if (loginResult.ok && loginResult.data?.data?.tokens?.accessToken) {
    authToken = loginResult.data.data.tokens.accessToken;
    log('  ✅ Regular user login successful', 'green');
  } else if (loginResult.ok && loginResult.data?.data?.accessToken) {
    authToken = loginResult.data.data.accessToken;
    log('  ✅ Regular user login successful', 'green');
  } else {
    log('  ❌ Regular user login failed - some tests will be skipped', 'red');
    log(`  Response: ${JSON.stringify(loginResult.data).substring(0, 300)}`, 'red');
  }

  // Try to login as admin
  let adminToken = null;
  const adminLoginResult = await makeRequest('POST', `${BASE_URL}/api/v1/auth/login`, null, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });

  if (adminLoginResult.ok && adminLoginResult.data?.data?.tokens?.accessToken) {
    adminToken = adminLoginResult.data.data.tokens.accessToken;
    log('  ✅ Admin login successful', 'green');
  } else if (adminLoginResult.ok && adminLoginResult.data?.data?.accessToken) {
    adminToken = adminLoginResult.data.data.accessToken;
    log('  ✅ Admin login successful', 'green');
  } else {
    log('  ⚠️  Admin login failed (will use regular user for admin endpoints)', 'yellow');
  }

  // Step 3: Test Auth endpoints
  log('\nSTEP 3: Testing Auth Endpoints', 'yellow');
  await testEndpoint('Get Current User', 'GET', '/api/v1/auth/me', authToken);
  
  // Test refresh token with actual refresh token if available
  if (loginResult.ok && loginResult.data?.data?.tokens?.refreshToken) {
    await testEndpoint('Refresh Token', 'POST', '/api/v1/auth/refresh', null, { 
      refreshToken: loginResult.data.data.tokens.refreshToken 
    }, 200);
  } else {
    await testEndpoint('Refresh Token', 'POST', '/api/v1/auth/refresh', null, { refreshToken: 'invalid' }, 400);
  }

  // Step 4: Test Patient endpoints
  log('\nSTEP 4: Testing Patient Endpoints', 'yellow');
  await testEndpoint('List Patients', 'GET', '/api/v1/patients', authToken);
  await testEndpoint('Get Patient by ID', 'GET', '/api/v1/patients/pt-001', authToken, null, 'any');
  
  // Step 5: Test Patient sub-resources
  log('\nSTEP 5: Testing Patient Sub-Resources', 'yellow');
  const patientId = 'pt-001';
  
  await testEndpoint('Patient Medications', 'GET', `/api/v1/patients/${patientId}/medications`, authToken, null, 'any');
  await testEndpoint('Patient Appointments', 'GET', `/api/v1/patients/${patientId}/appointments`, authToken, null, 'any');
  await testEndpoint('Patient Clinical Notes', 'GET', `/api/v1/patients/${patientId}/notes`, authToken, null, 'any');
  await testEndpoint('Patient Imaging Studies', 'GET', `/api/v1/patients/${patientId}/imaging`, authToken, null, 'any');
  await testEndpoint('Patient Lab Results', 'GET', `/api/v1/patients/${patientId}/lab-results`, authToken, null, 'any');
  await testEndpoint('Patient Care Team', 'GET', `/api/v1/patients/${patientId}/care-team`, authToken, null, 'any');
  await testEndpoint('Patient Referrals', 'GET', `/api/v1/patients/${patientId}/referrals`, authToken, null, 'any');

  // Step 6: Test Settings endpoints
  log('\nSTEP 6: Testing Settings Endpoints', 'yellow');
  await testEndpoint('Get Settings', 'GET', '/api/v1/settings', authToken, null, 'any');

  // Step 7: Test Billing endpoints
  log('\nSTEP 7: Testing Billing Endpoints', 'yellow');
  await testEndpoint('List Invoices', 'GET', '/api/v1/billing/invoices', authToken, null, 'any');
  await testEndpoint('Get Invoice by ID', 'GET', '/api/v1/billing/invoices/inv-001', authToken, null, 'any');

  // Step 8: Test Audit endpoints
  log('\nSTEP 8: Testing Audit Endpoints', 'yellow');
  await testEndpoint('List Audit Logs', 'GET', '/api/v1/audit', authToken, null, 'any');

  // Step 9: Test Hubs endpoints
  log('\nSTEP 9: Testing Hubs Endpoints', 'yellow');
  await testEndpoint('List Hubs', 'GET', '/api/v1/hubs', authToken);
  await testEndpoint('Get Hub by ID', 'GET', '/api/v1/hubs/general_surgery', authToken, null, 'any');

  // Step 10: Test Roles endpoints (admin only)
  log('\nSTEP 10: Testing Roles Endpoints', 'yellow');
  await testEndpoint('List Roles', 'GET', '/api/v1/roles', adminToken || authToken, null, 'any');
  await testEndpoint('Get Role by ID', 'GET', '/api/v1/roles/role-001', adminToken || authToken, null, 'any');

  // Step 11: Test Permissions endpoints
  log('\nSTEP 11: Testing Permissions Endpoints', 'yellow');
  await testEndpoint('List Permissions', 'GET', '/api/v1/permissions', adminToken || authToken, null, 'any');

  // Step 12: Test Users endpoints
  log('\nSTEP 12: Testing Users Endpoints', 'yellow');
  await testEndpoint('List Users', 'GET', '/api/v1/users', adminToken || authToken, null, 'any');
  await testEndpoint('Get User by ID', 'GET', '/api/v1/users/user-001', adminToken || authToken, null, 'any');

  // Step 13: Test Metrics endpoint (admin only)
  log('\nSTEP 13: Testing Metrics Endpoint', 'yellow');
  await testEndpoint('Get Metrics', 'GET', '/api/v1/metrics', adminToken || authToken, null, 'any');

  // Summary
  log('\n═══════════════════════════════════════════════════════════', 'blue');
  log('  TEST SUMMARY', 'blue');
  log('═══════════════════════════════════════════════════════════\n', 'blue');
  
  log(`✅ Passed: ${results.passed.length}`, 'green');
  log(`❌ Failed: ${results.failed.length}`, 'red');
  log(`⚠️  Skipped: ${results.skipped.length}\n`, 'yellow');

  if (results.failed.length > 0) {
    log('FAILED ENDPOINTS:', 'red');
    results.failed.forEach(({ name, method, path, status, error, data }) => {
      log(`  ❌ ${name}: ${method} ${path}`, 'red');
      if (status) log(`     Status: ${status}`, 'red');
      if (error) log(`     Error: ${error}`, 'red');
      if (data?.message) log(`     Message: ${data.message}`, 'red');
    });
  }

  if (results.skipped.length > 0) {
    log('\nSKIPPED ENDPOINTS:', 'yellow');
    results.skipped.forEach(({ name, method, path, reason }) => {
      log(`  ⚠️  ${name}: ${method} ${path} - ${reason}`, 'yellow');
    });
  }

  log('\n═══════════════════════════════════════════════════════════\n', 'blue');
  
  process.exit(results.failed.length > 0 ? 1 : 0);
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

