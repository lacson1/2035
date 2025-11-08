import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginTrend = new Trend('login_duration');
const apiTrend = new Trend('api_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Warm up
    { duration: '5m', target: 50 },   // Load testing
    { duration: '2m', target: 100 },  // Stress testing
    { duration: '1m', target: 0 },    // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be below 10%
    errors: ['rate<0.1'],
  },
};

// Base URL from environment
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const testUsers = [
  { email: 'admin@hospital.com', password: 'Admin123!' },
  { email: 'doctor@hospital.com', password: 'Doctor123!' },
  { email: 'nurse@hospital.com', password: 'Nurse123!' },
];

export function setup() {
  // Setup phase - login and get tokens
  const tokens = [];

  for (const user of testUsers) {
    const loginRes = http.post(`${BASE_URL}/api/auth/login`, {
      email: user.email,
      password: user.password,
    });

    check(loginRes, {
      'login status is 200': (r) => r.status === 200,
      'login response has token': (r) => r.json().accessToken !== undefined,
    });

    if (loginRes.status === 200) {
      tokens.push({
        accessToken: loginRes.json().accessToken,
        refreshToken: loginRes.json().refreshToken,
      });
    }
  }

  return { tokens };
}

export default function (data) {
  // Main test function
  const token = data.tokens[Math.floor(Math.random() * data.tokens.length)];

  if (!token) {
    errorRate.add(1);
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token.accessToken}`,
    'Content-Type': 'application/json',
  };

  // Test different endpoints
  const scenarios = [
    // Health check
    () => {
      const response = http.get(`${BASE_URL}/health`);
      check(response, {
        'health check status is 200': (r) => r.status === 200,
      });
      errorRate.add(response.status !== 200);
      apiTrend.add(response.timings.duration);
    },

    // Get patients list
    () => {
      const response = http.get(`${BASE_URL}/api/patients?page=1&limit=10`, { headers });
      check(response, {
        'patients list status is 200': (r) => r.status === 200,
      });
      errorRate.add(response.status !== 200);
      apiTrend.add(response.timings.duration);
    },

    // Get user profile
    () => {
      const response = http.get(`${BASE_URL}/api/auth/profile`, { headers });
      check(response, {
        'profile status is 200': (r) => r.status === 200,
      });
      errorRate.add(response.status !== 200);
      apiTrend.add(response.timings.duration);
    },

    // Search patients
    () => {
      const response = http.get(`${BASE_URL}/api/patients/search?q=john`, { headers });
      check(response, {
        'search status is 200': (r) => r.status === 200,
      });
      errorRate.add(response.status !== 200);
      apiTrend.add(response.timings.duration);
    },
  ];

  // Execute random scenario
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario();

  // Random sleep between 1-5 seconds
  sleep(Math.random() * 4 + 1);
}

export function teardown(data) {
  // Cleanup - logout if needed
  console.log('Load test completed');
}
