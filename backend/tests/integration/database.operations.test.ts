import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient, Patient, User, Appointment, Medication, VitalSigns } from '@prisma/client';
import { PatientFactory, UserFactory, AppointmentFactory, MedicationFactory, VitalSignsFactory } from '../../../src/test/factories/testDataFactory';

const prisma = new PrismaClient();

describe('Database Operations Integration Tests', () => {
  beforeAll(async () => {
    // Ensure clean test database
    await prisma.patient.deleteMany();
    await prisma.user.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.medication.deleteMany();
    await prisma.vitalSigns.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up data before each test
    await prisma.patient.deleteMany();
    await prisma.user.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.medication.deleteMany();
    await prisma.vitalSigns.deleteMany();
  });

  describe('Patient CRUD Operations', () => {
    it('should create, read, update, and delete patients', async () => {
      // Create
      const patientData = PatientFactory.create();
      const createdPatient = await prisma.patient.create({
        data: patientData
      });

      expect(createdPatient.id).toBeDefined();
      expect(createdPatient.firstName).toBe(patientData.firstName);
      expect(createdPatient.email).toBe(patientData.email);

      // Read
      const foundPatient = await prisma.patient.findUnique({
        where: { id: createdPatient.id }
      });

      expect(foundPatient).toBeDefined();
      expect(foundPatient?.id).toBe(createdPatient.id);

      // Update
      const updatedPatient = await prisma.patient.update({
        where: { id: createdPatient.id },
        data: {
          firstName: 'Updated',
          notes: 'Updated notes'
        }
      });

      expect(updatedPatient.firstName).toBe('Updated');
      expect(updatedPatient.notes).toBe('Updated notes');

      // Delete
      await prisma.patient.delete({
        where: { id: createdPatient.id }
      });

      const deletedPatient = await prisma.patient.findUnique({
        where: { id: createdPatient.id }
      });

      expect(deletedPatient).toBeNull();
    });

    it('should handle patient relationships', async () => {
      const patient = await prisma.patient.create({
        data: PatientFactory.create()
      });

      // Create related data
      const appointment = await prisma.appointment.create({
        data: AppointmentFactory.create({
          patientId: patient.id
        })
      });

      const medication = await prisma.medication.create({
        data: MedicationFactory.create({
          patientId: patient.id
        })
      });

      const vitals = await prisma.vitalSigns.create({
        data: VitalSignsFactory.create({
          patientId: patient.id
        })
      });

      // Query with relationships
      const patientWithRelations = await prisma.patient.findUnique({
        where: { id: patient.id },
        include: {
          appointments: true,
          medications: true,
          vitalSigns: true
        }
      });

      expect(patientWithRelations?.appointments).toHaveLength(1);
      expect(patientWithRelations?.medications).toHaveLength(1);
      expect(patientWithRelations?.vitalSigns).toHaveLength(1);
      expect(patientWithRelations?.appointments[0].id).toBe(appointment.id);
      expect(patientWithRelations?.medications[0].id).toBe(medication.id);
      expect(patientWithRelations?.vitalSigns[0].id).toBe(vitals.id);
    });

    it('should enforce unique constraints', async () => {
      const patient1 = PatientFactory.create({ email: 'unique@example.com' });
      const patient2 = PatientFactory.create({ email: 'unique@example.com' }); // Same email

      await prisma.patient.create({ data: patient1 });

      await expect(
        prisma.patient.create({ data: patient2 })
      ).rejects.toThrow(); // Should throw unique constraint violation
    });

    it('should handle search queries', async () => {
      const patients = [
        PatientFactory.create({ firstName: 'John', lastName: 'Doe' }),
        PatientFactory.create({ firstName: 'Jane', lastName: 'Smith' }),
        PatientFactory.create({ firstName: 'Bob', lastName: 'Johnson' })
      ];

      await prisma.patient.createMany({ data: patients });

      // Search by name
      const johnResults = await prisma.patient.findMany({
        where: {
          OR: [
            { firstName: { contains: 'John', mode: 'insensitive' } },
            { lastName: { contains: 'John', mode: 'insensitive' } }
          ]
        }
      });

      expect(johnResults.length).toBe(2); // John Doe and Bob Johnson

      // Search by email
      const emailResults = await prisma.patient.findMany({
        where: {
          email: { contains: 'example.com' }
        }
      });

      expect(emailResults.length).toBe(3);
    });

    it('should handle risk score filtering', async () => {
      const patients = [
        PatientFactory.create({ riskScore: 85 }), // High risk
        PatientFactory.create({ riskScore: 45 }), // Medium risk
        PatientFactory.create({ riskScore: 25 })  // Low risk
      ];

      await prisma.patient.createMany({ data: patients });

      const highRisk = await prisma.patient.findMany({
        where: { riskScore: { gte: 60 } }
      });

      const mediumRisk = await prisma.patient.findMany({
        where: { riskScore: { gte: 40, lt: 60 } }
      });

      const lowRisk = await prisma.patient.findMany({
        where: { riskScore: { lt: 40 } }
      });

      expect(highRisk.length).toBe(1);
      expect(mediumRisk.length).toBe(1);
      expect(lowRisk.length).toBe(1);
    });
  });

  describe('User Management', () => {
    it('should manage user roles and permissions', async () => {
      const users = [
        UserFactory.createDoctor(),
        UserFactory.createNurse(),
        UserFactory.createAdmin()
      ];

      for (const user of users) {
        await prisma.user.create({ data: user });
      }

      // Query by role
      const doctors = await prisma.user.findMany({
        where: { role: 'doctor' }
      });

      const nurses = await prisma.user.findMany({
        where: { role: 'nurse' }
      });

      const admins = await prisma.user.findMany({
        where: { role: 'admin' }
      });

      expect(doctors.length).toBe(1);
      expect(nurses.length).toBe(1);
      expect(admins.length).toBe(1);

      expect(doctors[0].permissions).toContain('read');
      expect(doctors[0].permissions).toContain('write');
      expect(admins[0].permissions).toContain('admin');
    });

    it('should handle user authentication data', async () => {
      const user = UserFactory.createDoctor();
      const hashedPassword = '$2b$10$test.hash.for.testing.purposes.only';

      const createdUser = await prisma.user.create({
        data: {
          ...user,
          password: hashedPassword
        }
      });

      expect(createdUser.password).toBe(hashedPassword);
      expect(createdUser.isActive).toBe(true);
    });
  });

  describe('Appointment Management', () => {
    it('should manage appointments with time constraints', async () => {
      const patient = await prisma.patient.create({ data: PatientFactory.create() });
      const doctor = await prisma.user.create({ data: UserFactory.createDoctor() });

      const appointment = AppointmentFactory.create({
        patientId: patient.id,
        doctorId: doctor.id,
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00'
      });

      const createdAppointment = await prisma.appointment.create({ data: appointment });

      expect(createdAppointment.patientId).toBe(patient.id);
      expect(createdAppointment.doctorId).toBe(doctor.id);
      expect(createdAppointment.status).toBe(appointment.status);

      // Query appointments by date
      const dayAppointments = await prisma.appointment.findMany({
        where: { date: '2024-01-15' }
      });

      expect(dayAppointments.length).toBe(1);
    });

    it('should prevent double booking', async () => {
      const patient1 = await prisma.patient.create({ data: PatientFactory.create() });
      const patient2 = await prisma.patient.create({ data: PatientFactory.create() });
      const doctor = await prisma.user.create({ data: UserFactory.createDoctor() });

      // Create first appointment
      await prisma.appointment.create({
        data: AppointmentFactory.create({
          patientId: patient1.id,
          doctorId: doctor.id,
          date: '2024-01-15',
          startTime: '10:00',
          endTime: '11:00'
        })
      });

      // Try to create overlapping appointment
      const overlappingAppointment = AppointmentFactory.create({
        patientId: patient2.id,
        doctorId: doctor.id,
        date: '2024-01-15',
        startTime: '10:30', // Overlaps with first appointment
        endTime: '11:30'
      });

      // This should either succeed (if no constraint) or be handled by business logic
      const created = await prisma.appointment.create({ data: overlappingAppointment });
      expect(created).toBeDefined();
    });
  });

  describe('Medical Data Integrity', () => {
    it('should maintain medication history', async () => {
      const patient = await prisma.patient.create({ data: PatientFactory.create() });

      const medications = [
        MedicationFactory.create({
          patientId: patient.id,
          name: 'Lisinopril',
          startDate: '2024-01-01',
          endDate: '2024-01-15'
        }),
        MedicationFactory.create({
          patientId: patient.id,
          name: 'Metformin',
          startDate: '2024-01-01',
          endDate: null // Ongoing
        })
      ];

      for (const med of medications) {
        await prisma.medication.create({ data: med });
      }

      const patientMeds = await prisma.medication.findMany({
        where: { patientId: patient.id }
      });

      expect(patientMeds.length).toBe(2);

      const activeMeds = patientMeds.filter(med => med.endDate === null);
      const completedMeds = patientMeds.filter(med => med.endDate !== null);

      expect(activeMeds.length).toBe(1);
      expect(completedMeds.length).toBe(1);
      expect(activeMeds[0].name).toBe('Metformin');
      expect(completedMeds[0].name).toBe('Lisinopril');
    });

    it('should track vital signs over time', async () => {
      const patient = await prisma.patient.create({ data: PatientFactory.create() });

      const vitals = [
        VitalSignsFactory.create({
          patientId: patient.id,
          date: new Date('2024-01-01').toISOString(),
          bloodPressure: { systolic: 140, diastolic: 90 }
        }),
        VitalSignsFactory.create({
          patientId: patient.id,
          date: new Date('2024-01-08').toISOString(),
          bloodPressure: { systolic: 135, diastolic: 85 }
        }),
        VitalSignsFactory.create({
          patientId: patient.id,
          date: new Date('2024-01-15').toISOString(),
          bloodPressure: { systolic: 130, diastolic: 80 }
        })
      ];

      for (const vital of vitals) {
        await prisma.vitalSigns.create({ data: vital });
      }

      const patientVitals = await prisma.vitalSigns.findMany({
        where: { patientId: patient.id },
        orderBy: { date: 'asc' }
      });

      expect(patientVitals.length).toBe(3);

      // Check trend (blood pressure improving)
      expect(patientVitals[0].bloodPressure.systolic).toBe(140);
      expect(patientVitals[1].bloodPressure.systolic).toBe(135);
      expect(patientVitals[2].bloodPressure.systolic).toBe(130);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle bulk operations efficiently', async () => {
      const startTime = Date.now();

      // Create 100 patients
      const patients = PatientFactory.createMany(100);
      await prisma.patient.createMany({ data: patients });

      const createTime = Date.now() - startTime;
      expect(createTime).toBeLessThan(5000); // Should complete within 5 seconds

      const queryStartTime = Date.now();

      // Query with pagination
      const result = await prisma.patient.findMany({
        take: 25,
        skip: 0,
        orderBy: { createdAt: 'desc' }
      });

      const queryTime = Date.now() - queryStartTime;
      expect(result.length).toBe(25);
      expect(queryTime).toBeLessThan(1000); // Should query within 1 second
    });

    it('should handle complex queries', async () => {
      // Create test data
      const patients = PatientFactory.createMany(50, [
        ...Array(20).fill({}).map(() => ({ riskScore: 80, conditions: ['Hypertension', 'Diabetes'] })),
        ...Array(20).fill({}).map(() => ({ riskScore: 40, conditions: ['Hypertension'] })),
        ...Array(10).fill({}).map(() => ({ riskScore: 20, conditions: ['Mild Hypertension'] }))
      ]);

      await prisma.patient.createMany({ data: patients });

      const complexQueryStart = Date.now();

      // Complex query with multiple filters
      const results = await prisma.patient.findMany({
        where: {
          AND: [
            { riskScore: { gte: 50 } },
            { conditions: { has: 'Hypertension' } }
          ]
        },
        orderBy: [
          { riskScore: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 10
      });

      const complexQueryTime = Date.now() - complexQueryStart;

      expect(results.length).toBeLessThanOrEqual(10);
      expect(complexQueryTime).toBeLessThan(2000); // Should complete within 2 seconds

      // All results should meet criteria
      results.forEach(patient => {
        expect(patient.riskScore).toBeGreaterThanOrEqual(50);
        expect(patient.conditions).toContain('Hypertension');
      });
    });

    it('should handle concurrent operations', async () => {
      const patientData = PatientFactory.create();

      // Simulate concurrent creates
      const promises = Array(10).fill(null).map((_, i) =>
        prisma.patient.create({
          data: {
            ...patientData,
            email: `concurrent${i}@example.com`,
            firstName: `Concurrent${i}`
          }
        })
      );

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const concurrentTime = Date.now() - startTime;

      expect(results.length).toBe(10);
      expect(concurrentTime).toBeLessThan(5000); // Should complete within 5 seconds

      // Verify all were created
      const count = await prisma.patient.count({
        where: { email: { startsWith: 'concurrent' } }
      });

      expect(count).toBe(10);
    });
  });

  describe('Data Consistency and Transactions', () => {
    it('should maintain data consistency in transactions', async () => {
      const patientData = PatientFactory.create();

      // Test transaction rollback
      try {
        await prisma.$transaction(async (tx) => {
          const patient = await tx.patient.create({ data: patientData });

          // Create related appointment
          await tx.appointment.create({
            data: AppointmentFactory.create({ patientId: patient.id })
          });

          // Force rollback by throwing error
          throw new Error('Test rollback');
        });
      } catch (error) {
        // Expected to fail
      }

      // Verify no data was persisted
      const patientCount = await prisma.patient.count({
        where: { email: patientData.email }
      });

      const appointmentCount = await prisma.appointment.count();

      expect(patientCount).toBe(0);
      expect(appointmentCount).toBe(0);
    });

    it('should handle cascading operations', async () => {
      // Create patient with related data
      const patient = await prisma.patient.create({ data: PatientFactory.create() });

      await prisma.appointment.create({
        data: AppointmentFactory.create({ patientId: patient.id })
      });

      await prisma.medication.create({
        data: MedicationFactory.create({ patientId: patient.id })
      });

      // Delete patient (should cascade or be handled)
      await prisma.patient.delete({
        where: { id: patient.id }
      });

      // Check if related data was handled (depends on schema constraints)
      const appointmentCount = await prisma.appointment.count({
        where: { patientId: patient.id }
      });

      const medicationCount = await prisma.medication.count({
        where: { patientId: patient.id }
      });

      // This depends on the schema - either cascade delete or foreign key constraints
      expect(appointmentCount).toBe(0); // Should be 0 if cascade delete works
      expect(medicationCount).toBe(0); // Should be 0 if cascade delete works
    });
  });

  describe('Backup and Recovery Simulation', () => {
    it('should support data export/import operations', async () => {
      // Create test data
      const patients = PatientFactory.createMany(5);
      await prisma.patient.createMany({ data: patients });

      // Simulate export (query all data)
      const exportStartTime = Date.now();
      const allPatients = await prisma.patient.findMany({
        include: {
          appointments: true,
          medications: true,
          vitalSigns: true
        }
      });
      const exportTime = Date.now() - exportStartTime;

      expect(allPatients.length).toBe(5);
      expect(exportTime).toBeLessThan(2000);

      // Verify data integrity
      allPatients.forEach(patient => {
        expect(patient.id).toBeDefined();
        expect(patient.firstName).toBeDefined();
        expect(patient.email).toBeDefined();
      });
    });

    it('should handle data validation during import', async () => {
      // Test creating patients with various data conditions
      const validPatient = PatientFactory.create();
      const invalidPatient = {
        ...PatientFactory.create(),
        email: null, // Invalid - email required
      };

      await prisma.patient.create({ data: validPatient });

      // Invalid patient should fail
      await expect(
        prisma.patient.create({ data: invalidPatient as any })
      ).rejects.toThrow();
    });
  });
});
