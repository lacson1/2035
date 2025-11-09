import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Test Helper Utilities
 * Provides common functions for setting up and cleaning up test data
 */

export async function setupTestDatabase() {
  // Note: In a real test environment, you might want to use a separate test database
  // For now, we'll rely on Prisma migrations and seed data
  // In CI/CD, you'd reset the test database here
}

export async function cleanupTestDatabase() {
  // Clean up test data if needed
  // Be careful not to delete production data!
  await prisma.$disconnect();
}

export async function createTestUser(overrides: Partial<{
  username: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
}> = {}) {
  const defaultPasswordHash = await bcrypt.hash('testpassword123', 10);
  
  return prisma.user.create({
    data: {
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Test',
      lastName: 'User',
      role: 'physician',
      ...overrides,
    },
  });
}

export async function createTestPatient(overrides: Partial<{
  name: string;
  dateOfBirth: Date;
  gender: string;
  riskScore: number;
}> = {}) {
  return prisma.patient.create({
    data: {
      name: 'Test Patient',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Male',
      ...overrides,
    },
  });
}

export async function createTestMedication(patientId: string, overrides: Partial<{
  name: string;
  status: string;
  startedDate: Date;
}> = {}) {
  return prisma.medication.create({
    data: {
      patientId,
      name: 'Test Medication',
      status: 'Active',
      startedDate: new Date(),
      ...overrides,
    },
  });
}

export async function deleteTestUser(userId: string) {
  return prisma.user.delete({
    where: { id: userId },
  });
}

export async function deleteTestPatient(patientId: string) {
  return prisma.patient.delete({
    where: { id: patientId },
  });
}

export { prisma };
