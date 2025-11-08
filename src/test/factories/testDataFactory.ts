import { Patient, User, Appointment, Medication, VitalSigns, LabResult } from '../../types';

// Base factory for generating test data with consistent patterns

export class TestDataFactory {
  private static idCounter = 1000;

  static generateId(): number {
    return ++this.idCounter;
  }

  static resetIdCounter(): void {
    this.idCounter = 1000;
  }
}

// Patient factory
export class PatientFactory {
  static create(overrides: Partial<Patient> = {}): Patient {
    const id = TestDataFactory.generateId();
    return {
      id: id.toString(),
      firstName: `Patient${id}`,
      lastName: 'Test',
      dateOfBirth: '1980-01-01',
      gender: 'female',
      email: `patient${id}@example.com`,
      phone: '(555) 123-4567',
      address: '123 Test Street, Test City, TS 12345',
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'spouse',
        phone: '(555) 987-6543'
      },
      medicalHistory: [],
      medications: [],
      allergies: [],
      riskScore: Math.floor(Math.random() * 100),
      conditions: ['Hypertension'],
      lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextAppointment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      insurance: {
        provider: 'Test Insurance Co',
        policyNumber: `POL${id}`,
        groupNumber: `GRP${id}`
      },
      notes: 'Test patient notes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    };
  }

  static createMany(count: number, overrides: Partial<Patient>[] = []): Patient[] {
    return Array.from({ length: count }, (_, index) =>
      this.create(overrides[index] || {})
    );
  }

  static createWithConditions(conditions: string[]): Patient {
    return this.create({
      conditions,
      riskScore: conditions.length > 2 ? 80 : 45
    });
  }

  static createHighRisk(): Patient {
    return this.create({
      riskScore: 85,
      conditions: ['Hypertension', 'Diabetes', 'Heart Disease'],
      notes: 'High risk patient requiring close monitoring'
    });
  }

  static createLowRisk(): Patient {
    return this.create({
      riskScore: 25,
      conditions: ['Mild Hypertension'],
      notes: 'Low risk patient with stable condition'
    });
  }

  static createWithAllergies(allergies: string[]): Patient {
    return this.create({
      allergies,
      notes: `Patient with allergies: ${allergies.join(', ')}`
    });
  }
}

// User factory
export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    const id = TestDataFactory.generateId();
    const roles = ['doctor', 'nurse', 'admin'];
    const specialties = ['cardiology', 'pediatrics', 'emergency', 'general'];

    return {
      id: id.toString(),
      email: `user${id}@hospital2035.com`,
      firstName: `User${id}`,
      lastName: 'Test',
      role: roles[Math.floor(Math.random() * roles.length)] as any,
      specialty: specialties[Math.floor(Math.random() * specialties.length)],
      phone: '(555) 123-4567',
      department: 'Test Department',
      licenseNumber: `LIC${id}`,
      isActive: true,
      permissions: ['read', 'write'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    };
  }

  static createDoctor(): User {
    return this.create({
      role: 'doctor',
      specialty: 'cardiology'
    });
  }

  static createNurse(): User {
    return this.create({
      role: 'nurse',
      specialty: 'emergency'
    });
  }

  static createAdmin(): User {
    return this.create({
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin']
    });
  }

  static createInactive(): User {
    return this.create({
      isActive: false
    });
  }
}

// Appointment factory
export class AppointmentFactory {
  static create(overrides: Partial<Appointment> = {}): Appointment {
    const id = TestDataFactory.generateId();
    const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
    const types = ['consultation', 'follow-up', 'emergency', 'check-up'];

    const startTime = new Date();
    startTime.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 4) * 15, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30);

    return {
      id: id.toString(),
      patientId: TestDataFactory.generateId().toString(),
      doctorId: TestDataFactory.generateId().toString(),
      date: new Date().toISOString().split('T')[0],
      startTime: startTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)] as any,
      notes: 'Test appointment notes',
      location: 'Room 101',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    };
  }

  static createMany(count: number, overrides: Partial<Appointment>[] = []): Appointment[] {
    return Array.from({ length: count }, (_, index) =>
      this.create(overrides[index] || {})
    );
  }

  static createForToday(): Appointment {
    return this.create({
      date: new Date().toISOString().split('T')[0],
      status: 'scheduled'
    });
  }

  static createCompleted(): Appointment {
    return this.create({
      status: 'completed',
      notes: 'Appointment completed successfully'
    });
  }

  static createCancelled(): Appointment {
    return this.create({
      status: 'cancelled',
      notes: 'Patient cancelled appointment'
    });
  }
}

// Medication factory
export class MedicationFactory {
  static create(overrides: Partial<Medication> = {}): Medication {
    const id = TestDataFactory.generateId();
    const medications = [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
      { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' },
      { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily' }
    ];

    const med = medications[Math.floor(Math.random() * medications.length)];

    return {
      id: id.toString(),
      patientId: TestDataFactory.generateId().toString(),
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: null,
      prescribedBy: TestDataFactory.generateId().toString(),
      instructions: 'Take with food',
      sideEffects: [],
      interactions: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    };
  }

  static createMany(count: number, overrides: Partial<Medication>[] = []): Medication[] {
    return Array.from({ length: count }, (_, index) =>
      this.create(overrides[index] || {})
    );
  }

  static createWithSideEffects(sideEffects: string[]): Medication {
    return this.create({
      sideEffects,
      instructions: `Take as prescribed. Monitor for: ${sideEffects.join(', ')}`
    });
  }

  static createCompleted(): Medication {
    const endDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.create({
      endDate: endDate.toISOString().split('T')[0],
      isActive: false
    });
  }
}

// Vital signs factory
export class VitalSignsFactory {
  static create(overrides: Partial<VitalSigns> = {}): VitalSigns {
    const id = TestDataFactory.generateId();
    const patientId = TestDataFactory.generateId().toString();

    // Generate realistic vital signs
    const systolic = 110 + Math.floor(Math.random() * 40); // 110-150
    const diastolic = 70 + Math.floor(Math.random() * 30); // 70-100
    const heartRate = 60 + Math.floor(Math.random() * 40); // 60-100
    const temperature = 97 + Math.random() * 3; // 97-100
    const weight = 150 + Math.random() * 50; // 150-200
    const height = 65 + Math.random() * 10; // 65-75 inches

    return {
      id: id.toString(),
      patientId,
      date: new Date().toISOString(),
      bloodPressure: {
        systolic,
        diastolic
      },
      heartRate,
      temperature: Math.round(temperature * 10) / 10,
      weight: Math.round(weight * 10) / 10,
      height: Math.round(height * 10) / 10,
      bmi: Math.round((weight / (height * height)) * 703 * 10) / 10,
      oxygenSaturation: 95 + Math.floor(Math.random() * 5), // 95-100
      respiratoryRate: 12 + Math.floor(Math.random() * 8), // 12-20
      notes: 'Vital signs within normal range',
      takenBy: TestDataFactory.generateId().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    };
  }

  static createMany(count: number, overrides: Partial<VitalSigns>[] = []): VitalSigns[] {
    return Array.from({ length: count }, (_, index) =>
      this.create(overrides[index] || {})
    );
  }

  static createAbnormal(): VitalSigns {
    return this.create({
      bloodPressure: { systolic: 160, diastolic: 95 },
      heartRate: 110,
      temperature: 101.5,
      notes: 'Elevated blood pressure and temperature'
    });
  }

  static createNormal(): VitalSigns {
    return this.create({
      bloodPressure: { systolic: 120, diastolic: 80 },
      heartRate: 72,
      temperature: 98.6,
      notes: 'All vitals within normal range'
    });
  }
}

// Lab result factory
export class LabResultFactory {
  static create(overrides: Partial<LabResult> = {}): LabResult {
    const id = TestDataFactory.generateId();
    const tests = [
      { name: 'Complete Blood Count', code: 'CBC' },
      { name: 'Comprehensive Metabolic Panel', code: 'CMP' },
      { name: 'Lipid Panel', code: 'LIPID' },
      { name: 'Hemoglobin A1C', code: 'HBA1C' },
      { name: 'Thyroid Function Tests', code: 'TFT' }
    ];

    const test = tests[Math.floor(Math.random() * tests.length)];

    return {
      id: id.toString(),
      patientId: TestDataFactory.generateId().toString(),
      testName: test.name,
      testCode: test.code,
      value: Math.round((Math.random() * 100 + 50) * 100) / 100,
      unit: test.code === 'HBA1C' ? '%' : test.code === 'CBC' ? '10^9/L' : 'mg/dL',
      referenceRange: test.code === 'HBA1C' ? '< 5.7' : test.code === 'CBC' ? '4.5-11.0' : '70-99',
      status: 'completed',
      date: new Date().toISOString(),
      orderedBy: TestDataFactory.generateId().toString(),
      performedBy: TestDataFactory.generateId().toString(),
      notes: 'Results within normal range',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    };
  }

  static createMany(count: number, overrides: Partial<LabResult>[] = []): LabResult[] {
    return Array.from({ length: count }, (_, index) =>
      this.create(overrides[index] || {})
    );
  }

  static createAbnormal(testName: string): LabResult {
    return this.create({
      testName,
      value: 150 + Math.random() * 50, // High value
      status: 'critical',
      notes: 'Abnormal result - requires follow-up'
    });
  }

  static createPending(): LabResult {
    return this.create({
      status: 'pending',
      value: undefined,
      notes: 'Test in progress'
    });
  }
}

// Mock API response factory
export class MockApiFactory {
  static successResponse<T>(data: T, message = 'Success') {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  static errorResponse(message: string, code = 400, details?: any) {
    return {
      success: false,
      error: {
        message,
        code,
        details
      },
      timestamp: new Date().toISOString()
    };
  }

  static paginatedResponse<T>(
    items: T[],
    page = 1,
    limit = 25,
    total?: number
  ) {
    const totalItems = total ?? items.length;
    return {
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total: totalItems,
        totalPages: Math.ceil(totalItems / limit),
        hasNext: page * limit < totalItems,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString()
    };
  }

  static validationErrorResponse(errors: Record<string, string[]>) {
    return this.errorResponse('Validation failed', 422, { errors });
  }

  static rateLimitResponse(retryAfter = 300) {
    return {
      success: false,
      error: {
        message: `Too many requests. Try again in ${Math.floor(retryAfter / 60)} minutes.`,
        code: 429,
        retryAfter
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Test scenario factory for complex test setups
export class TestScenarioFactory {
  static createCompletePatientRecord(): {
    patient: Patient;
    appointments: Appointment[];
    medications: Medication[];
    vitals: VitalSigns[];
    labs: LabResult[];
  } {
    const patient = PatientFactory.create();

    const appointments = AppointmentFactory.createMany(3, [
      { patientId: patient.id, status: 'completed' },
      { patientId: patient.id, status: 'scheduled' },
      { patientId: patient.id, status: 'confirmed' }
    ]);

    const medications = MedicationFactory.createMany(2, [
      { patientId: patient.id },
      { patientId: patient.id }
    ]);

    const vitals = VitalSignsFactory.createMany(5, [
      { patientId: patient.id },
      { patientId: patient.id },
      { patientId: patient.id },
      { patientId: patient.id },
      { patientId: patient.id }
    ]);

    const labs = LabResultFactory.createMany(3, [
      { patientId: patient.id },
      { patientId: patient.id },
      { patientId: patient.id }
    ]);

    return {
      patient,
      appointments,
      medications,
      vitals,
      labs
    };
  }

  static createBusyClinicDay(): {
    patients: Patient[];
    appointments: Appointment[];
    users: User[];
  } {
    const patients = PatientFactory.createMany(10);
    const users = [
      UserFactory.createDoctor(),
      UserFactory.createDoctor(),
      UserFactory.createNurse(),
      UserFactory.createNurse()
    ];

    const appointments: Appointment[] = [];
    patients.forEach(patient => {
      const appointmentCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < appointmentCount; i++) {
        appointments.push(AppointmentFactory.create({
          patientId: patient.id,
          doctorId: users[Math.floor(Math.random() * users.length)].id
        }));
      }
    });

    return {
      patients,
      appointments,
      users
    };
  }

  static createEmergencyScenario(): {
    patient: Patient;
    emergencyVitals: VitalSigns;
    emergencyAppointment: Appointment;
  } {
    const patient = PatientFactory.create({
      riskScore: 95,
      conditions: ['Acute Coronary Syndrome', 'Hypertension'],
      notes: 'Emergency case - chest pain'
    });

    const emergencyVitals = VitalSignsFactory.createAbnormal();

    const emergencyAppointment = AppointmentFactory.create({
      patientId: patient.id,
      type: 'emergency',
      status: 'scheduled',
      notes: 'Emergency consultation - chest pain evaluation'
    });

    return {
      patient,
      emergencyVitals,
      emergencyAppointment
    };
  }
}

// Reset all factories (useful for test isolation)
export function resetTestFactories(): void {
  TestDataFactory.resetIdCounter();
}
