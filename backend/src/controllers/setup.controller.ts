import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

/**
 * Temporary setup controller for seeding demo patients
 * This should be removed after initial setup
 */
export class SetupController {
  /**
   * Seed demo patients
   * POST /api/v1/setup/seed-patients
   * Requires SETUP_SECRET environment variable for security
   */
  async seedPatients(req: Request, res: Response, next: NextFunction) {
    try {
      // Check for setup secret (only allow in development or with secret)
      const setupSecret = process.env.SETUP_SECRET || 'dev-setup-secret-change-in-production';
      const providedSecret = req.headers['x-setup-secret'] || req.body.secret;

      if (providedSecret !== setupSecret) {
        return res.status(401).json({
          message: 'Unauthorized - invalid setup secret',
          status: 401,
        });
      }

      logger.info('Seeding demo patients...');

      // Get the first available user (physician, admin, or any user) to assign as creator
      let creator = await prisma.user.findFirst({
        where: { role: 'physician' },
      });

      if (!creator) {
        creator = await prisma.user.findFirst({
          where: { role: 'admin' },
        });
      }

      if (!creator) {
        creator = await prisma.user.findFirst({
          orderBy: { createdAt: 'asc' },
        });
      }

      if (!creator) {
        return res.status(400).json({
          message: 'No users found. Please create users first.',
          status: 400,
        });
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

      const results = [];
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
          results.push({
            name: patientData.name,
            status: 'skipped',
            message: 'Patient already exists',
          });
          skipped++;
          continue;
        }

        // Create patient
        const patient = await prisma.patient.create({
          data: {
            ...patientData,
            createdById: creator.id,
            updatedById: creator.id,
          },
        });

        results.push({
          name: patient.name,
          status: 'created',
          message: 'Patient created successfully',
        });
        created++;
        logger.info(`Created patient: ${patient.name}`);
      }

      res.json({
        message: 'Demo patients seeded successfully',
        summary: {
          created,
          skipped,
          total: await prisma.patient.count(),
        },
        results,
      });
    } catch (error) {
      logger.error('Error seeding patients:', error);
      next(error);
    }
  }
}

export const setupController = new SetupController();

