import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const adminPassword = await hashPassword('admin123');
  const physicianPassword = await hashPassword('password123');
  const nursePassword = await hashPassword('password123');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hospital2035.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@hospital2035.com',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.admin,
      department: 'IT',
      phone: '(555) 000-0001',
      isActive: true,
    },
  });

  const physician = await prisma.user.upsert({
    where: { email: 'sarah.johnson@hospital2035.com' },
    update: {},
    create: {
      username: 'sarah.johnson',
      email: 'sarah.johnson@hospital2035.com',
      passwordHash: physicianPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.physician,
      specialty: 'Internal Medicine',
      department: 'Internal Medicine',
      phone: '(555) 123-4567',
      isActive: true,
    },
  });

  const nurse = await prisma.user.upsert({
    where: { email: 'patricia.williams@hospital2035.com' },
    update: {},
    create: {
      username: 'patricia.williams',
      email: 'patricia.williams@hospital2035.com',
      passwordHash: nursePassword,
      firstName: 'Patricia',
      lastName: 'Williams',
      role: UserRole.nurse,
      department: 'Nursing',
      phone: '(555) 345-6789',
      isActive: true,
    },
  });

  console.log('✅ Created users:', { admin, physician, nurse });

  // Create sample patient
  const patient = await prisma.patient.upsert({
    where: { id: 'pt-001' },
    update: {},
    create: {
      id: 'pt-001',
      name: 'Ava Mensah',
      dateOfBirth: new Date('1972-06-15'),
      gender: 'F',
      bloodPressure: '138/86',
      condition: 'T2D',
      riskScore: 62,
      address: '123 Oak Street, Springfield, IL 62701',
      email: 'ava.mensah@email.com',
      phone: '(217) 555-0123',
      allergies: ['Penicillin', 'Sulfa drugs'],
      emergencyContact: {
        name: 'James Mensah',
        relationship: 'Spouse',
        phone: '(217) 555-0124',
      },
      insurance: {
        provider: 'BlueCross BlueShield',
        policyNumber: 'BCBS-789456123',
        groupNumber: 'GRP-12345',
      },
      familyHistory: [
        'Type 2 Diabetes (mother, maternal grandmother)',
        'Hypertension (father)',
        'Coronary artery disease (paternal grandfather)',
      ],
      createdById: physician.id,
    },
  });

  console.log('✅ Created sample patient:', patient);

  // Create sample medication
  const medication = await prisma.medication.create({
    data: {
      patientId: patient.id,
      name: 'Metformin 1000mg BID',
      status: 'Active',
      startedDate: new Date('2025-09-13'),
      instructions: 'Take with meals',
      prescribedById: physician.id,
    },
  });

  console.log('✅ Created sample medication:', medication);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

