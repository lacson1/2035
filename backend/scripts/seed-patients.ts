/**
 * Script to seed sample patients for testing
 * Run with: cd backend && npx ts-node scripts/seed-patients.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPatients() {
  try {
    console.log('🌱 Seeding sample patients...\n');

    // Get the first physician user to assign as creator
    const physician = await prisma.user.findFirst({
      where: { role: 'physician' },
    });

    if (!physician) {
      console.error('❌ No physician user found. Please create users first.');
      process.exit(1);
    }

    const samplePatients = [
      {
        name: 'John Smith',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'Male',
        bloodPressure: '120/80',
        condition: 'Hypertension',
        riskScore: 3,
        address: '123 Main St, City, State 12345',
        email: 'john.smith@email.com',
        phone: '555-0101',
        allergies: ['Penicillin', 'Peanuts'],
        familyHistory: ['Heart Disease', 'Diabetes'],
        emergencyContact: {
          name: 'Jane Smith',
          relationship: 'Spouse',
          phone: '555-0102',
        },
        insurance: {
          provider: 'Blue Cross Blue Shield',
          policyNumber: 'BC123456789',
          groupNumber: 'GR001',
        },
      },
      {
        name: 'Emily Johnson',
        dateOfBirth: new Date('1992-07-22'),
        gender: 'Female',
        bloodPressure: '110/70',
        condition: 'Type 2 Diabetes',
        riskScore: 5,
        address: '456 Oak Ave, City, State 12345',
        email: 'emily.johnson@email.com',
        phone: '555-0201',
        allergies: ['Latex'],
        familyHistory: ['Diabetes', 'Obesity'],
        emergencyContact: {
          name: 'Michael Johnson',
          relationship: 'Brother',
          phone: '555-0202',
        },
        insurance: {
          provider: 'Aetna',
          policyNumber: 'AE987654321',
          groupNumber: 'GR002',
        },
      },
      {
        name: 'Robert Williams',
        dateOfBirth: new Date('1978-11-08'),
        gender: 'Male',
        bloodPressure: '135/85',
        condition: 'Coronary Artery Disease',
        riskScore: 7,
        address: '789 Elm St, City, State 12345',
        email: 'robert.williams@email.com',
        phone: '555-0301',
        allergies: ['Aspirin'],
        familyHistory: ['Heart Disease', 'High Cholesterol'],
        emergencyContact: {
          name: 'Linda Williams',
          relationship: 'Wife',
          phone: '555-0302',
        },
        insurance: {
          provider: 'UnitedHealthcare',
          policyNumber: 'UH456789123',
          groupNumber: 'GR003',
        },
      },
      {
        name: 'Maria Garcia',
        dateOfBirth: new Date('1995-04-30'),
        gender: 'Female',
        bloodPressure: '105/65',
        condition: 'Asthma',
        riskScore: 2,
        address: '321 Pine Rd, City, State 12345',
        email: 'maria.garcia@email.com',
        phone: '555-0401',
        allergies: ['Dust Mites', 'Pollen'],
        familyHistory: ['Asthma', 'Allergies'],
        emergencyContact: {
          name: 'Carlos Garcia',
          relationship: 'Father',
          phone: '555-0402',
        },
        insurance: {
          provider: 'Cigna',
          policyNumber: 'CI789123456',
          groupNumber: 'GR004',
        },
      },
      {
        name: 'David Chen',
        dateOfBirth: new Date('1988-09-12'),
        gender: 'Male',
        bloodPressure: '125/82',
        condition: 'Chronic Kidney Disease',
        riskScore: 6,
        address: '654 Maple Dr, City, State 12345',
        email: 'david.chen@email.com',
        phone: '555-0501',
        allergies: ['Contrast Dye'],
        familyHistory: ['Kidney Disease', 'Hypertension'],
        emergencyContact: {
          name: 'Lisa Chen',
          relationship: 'Sister',
          phone: '555-0502',
        },
        insurance: {
          provider: 'Humana',
          policyNumber: 'HU321654987',
          groupNumber: 'GR005',
        },
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const patientData of samplePatients) {
      // Check if patient already exists
      const existing = await prisma.patient.findFirst({
        where: {
          OR: [
            { email: patientData.email },
            { name: patientData.name, dateOfBirth: patientData.dateOfBirth },
          ],
        },
      });

      if (existing) {
        console.log(`⚠️  Patient ${patientData.name} already exists, skipping...`);
        skipped++;
        continue;
      }

      // Create patient
      const patient = await prisma.patient.create({
        data: {
          ...patientData,
          createdById: physician.id,
          updatedById: physician.id,
        },
      });

      console.log(`✅ Created patient: ${patient.name} (${patient.email || 'no email'})`);
      created++;
    }

    console.log(`\n✨ Seeding completed!`);
    console.log(`   Created: ${created} patients`);
    console.log(`   Skipped: ${skipped} patients (already exist)`);
    console.log(`   Total patients in database: ${await prisma.patient.count()}`);
  } catch (error) {
    console.error('❌ Error seeding patients:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
seedPatients();

