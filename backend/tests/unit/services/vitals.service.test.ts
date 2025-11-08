import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VitalsService } from '../../../src/services/vitals.service';
import prisma from '../../../src/config/database';
import { NotFoundError, ValidationError } from '../../../src/utils/errors';

// Mock dependencies
vi.mock('../../../src/config/database', () => ({
  default: {
    patient: {
      findUnique: vi.fn(),
    },
    vital: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('VitalsService', () => {
  let vitalsService: VitalsService;

  beforeEach(() => {
    vi.clearAllMocks();
    vitalsService = new VitalsService();
  });

  describe('getPatientVitals', () => {
    it('should return all vitals for a patient', async () => {
      const mockPatient = { id: 'patient-1', name: 'John Doe' };
      const mockVitals = [
        {
          id: 'vital-1',
          patientId: 'patient-1',
          date: new Date('2024-01-15'),
          systolic: 120,
          diastolic: 80,
          heartRate: 72,
        },
        {
          id: 'vital-2',
          patientId: 'patient-1',
          date: new Date('2024-01-20'),
          systolic: 118,
          diastolic: 78,
          heartRate: 70,
        },
      ];

      vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);
      vi.mocked(prisma.vital.findMany).mockResolvedValue(mockVitals as any);

      const result = await vitalsService.getPatientVitals('patient-1');

      expect(result).toEqual(mockVitals);
      expect(prisma.patient.findUnique).toHaveBeenCalledWith({
        where: { id: 'patient-1' },
      });
      expect(prisma.vital.findMany).toHaveBeenCalledWith({
        where: { patientId: 'patient-1' },
        orderBy: { date: 'desc' },
      });
    });

    it('should throw NotFoundError if patient does not exist', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(null);

      await expect(vitalsService.getPatientVitals('invalid-patient')).rejects.toThrow(
        NotFoundError
      );
      expect(prisma.vital.findMany).not.toHaveBeenCalled();
    });

    it('should return empty array if patient has no vitals', async () => {
      const mockPatient = { id: 'patient-1', name: 'John Doe' };
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);
      vi.mocked(prisma.vital.findMany).mockResolvedValue([]);

      const result = await vitalsService.getPatientVitals('patient-1');

      expect(result).toEqual([]);
    });
  });

  describe('getVitalById', () => {
    it('should return a specific vital', async () => {
      const mockVital = {
        id: 'vital-1',
        patientId: 'patient-1',
        date: new Date('2024-01-15'),
        systolic: 120,
        diastolic: 80,
        heartRate: 72,
      };

      vi.mocked(prisma.vital.findFirst).mockResolvedValue(mockVital as any);

      const result = await vitalsService.getVitalById('patient-1', 'vital-1');

      expect(result).toEqual(mockVital);
      expect(prisma.vital.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'vital-1',
          patientId: 'patient-1',
        },
      });
    });

    it('should throw NotFoundError if vital does not exist', async () => {
      vi.mocked(prisma.vital.findFirst).mockResolvedValue(null);

      await expect(
        vitalsService.getVitalById('patient-1', 'invalid-vital')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if vital belongs to different patient', async () => {
      vi.mocked(prisma.vital.findFirst).mockResolvedValue(null);

      await expect(
        vitalsService.getVitalById('patient-1', 'vital-1')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('createVital', () => {
    const mockPatient = { id: 'patient-1', name: 'John Doe' };

    beforeEach(() => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);
    });

    it('should create a vital with valid data', async () => {
      const vitalData = {
        date: '2024-01-15',
        systolic: 120,
        diastolic: 80,
        heartRate: 72,
        temperature: 98.6,
        oxygen: 98,
      };

      const createdVital = {
        id: 'vital-1',
        patientId: 'patient-1',
        ...vitalData,
        date: new Date('2024-01-15'),
      };

      vi.mocked(prisma.vital.create).mockResolvedValue(createdVital as any);

      const result = await vitalsService.createVital('patient-1', vitalData, 'user-1');

      expect(result).toEqual(createdVital);
      expect(prisma.vital.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          patientId: 'patient-1',
          systolic: 120,
          diastolic: 80,
          heartRate: 72,
          temperature: 98.6,
          oxygen: 98,
          recordedById: 'user-1',
        }),
      });
    });

    it('should create a vital with Date object', async () => {
      const vitalData = {
        date: new Date('2024-01-15'),
        systolic: 120,
        diastolic: 80,
      };

      const createdVital = {
        id: 'vital-1',
        patientId: 'patient-1',
        ...vitalData,
      };

      vi.mocked(prisma.vital.create).mockResolvedValue(createdVital as any);

      const result = await vitalsService.createVital('patient-1', vitalData);

      expect(result).toEqual(createdVital);
      expect(prisma.vital.create).toHaveBeenCalled();
    });

    it('should create a vital with ISO datetime string', async () => {
      const vitalData = {
        date: '2024-01-15T10:30:00Z',
        systolic: 120,
        diastolic: 80,
      };

      const createdVital = {
        id: 'vital-1',
        patientId: 'patient-1',
        date: new Date('2024-01-15T10:30:00Z'),
        systolic: 120,
        diastolic: 80,
      };

      vi.mocked(prisma.vital.create).mockResolvedValue(createdVital as any);

      const result = await vitalsService.createVital('patient-1', vitalData);

      expect(result).toEqual(createdVital);
      expect(prisma.vital.create).toHaveBeenCalled();
    });

    it('should parse date string correctly (YYYY-MM-DD format)', async () => {
      const vitalData = {
        date: '2024-01-15',
        systolic: 120,
        diastolic: 80,
      };

      const createdVital = {
        id: 'vital-1',
        patientId: 'patient-1',
        date: new Date(2024, 0, 15), // January 15, 2024 (month is 0-indexed)
        systolic: 120,
        diastolic: 80,
      };

      vi.mocked(prisma.vital.create).mockResolvedValue(createdVital as any);

      await vitalsService.createVital('patient-1', vitalData);

      const createCall = vi.mocked(prisma.vital.create).mock.calls[0][0];
      const dateValue = createCall.data.date;
      
      // Verify date was parsed correctly (should be local date, not UTC)
      expect(dateValue).toBeInstanceOf(Date);
      expect(dateValue.getFullYear()).toBe(2024);
      expect(dateValue.getMonth()).toBe(0); // January
      expect(dateValue.getDate()).toBe(15);
    });

    it('should throw NotFoundError if patient does not exist', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(null);

      const vitalData = {
        date: '2024-01-15',
        systolic: 120,
        diastolic: 80,
      };

      await expect(
        vitalsService.createVital('invalid-patient', vitalData)
      ).rejects.toThrow(NotFoundError);
      expect(prisma.vital.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if date is missing', async () => {
      const vitalData = {
        systolic: 120,
        diastolic: 80,
      } as any;

      await expect(
        vitalsService.createVital('patient-1', vitalData)
      ).rejects.toThrow(ValidationError);
      expect(prisma.vital.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if date is invalid', async () => {
      const vitalData = {
        date: 'invalid-date',
        systolic: 120,
        diastolic: 80,
      };

      await expect(
        vitalsService.createVital('patient-1', vitalData)
      ).rejects.toThrow(ValidationError);
      expect(prisma.vital.create).not.toHaveBeenCalled();
    });

    it('should create vital with optional fields', async () => {
      const vitalData = {
        date: '2024-01-15',
        time: '10:30',
        notes: 'Patient feeling well',
      };

      const createdVital = {
        id: 'vital-1',
        patientId: 'patient-1',
        date: new Date('2024-01-15'),
        time: '10:30',
        notes: 'Patient feeling well',
      };

      vi.mocked(prisma.vital.create).mockResolvedValue(createdVital as any);

      const result = await vitalsService.createVital('patient-1', vitalData);

      expect(result).toEqual(createdVital);
      expect(prisma.vital.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          time: '10:30',
          notes: 'Patient feeling well',
        }),
      });
    });
  });

  describe('updateVital', () => {
    const mockVital = {
      id: 'vital-1',
      patientId: 'patient-1',
      date: new Date('2024-01-15'),
      systolic: 120,
      diastolic: 80,
    };

    beforeEach(() => {
      vi.mocked(prisma.vital.findFirst).mockResolvedValue(mockVital as any);
    });

    it('should update a vital', async () => {
      const updateData = {
        systolic: 125,
        diastolic: 85,
      };

      const updatedVital = {
        ...mockVital,
        ...updateData,
      };

      vi.mocked(prisma.vital.update).mockResolvedValue(updatedVital as any);

      const result = await vitalsService.updateVital('patient-1', 'vital-1', updateData);

      expect(result).toEqual(updatedVital);
      expect(prisma.vital.update).toHaveBeenCalledWith({
        where: { id: 'vital-1' },
        data: updateData,
      });
    });

    it('should update vital with date string', async () => {
      const updateData = {
        date: '2024-01-20',
      };

      const updatedVital = {
        ...mockVital,
        date: new Date('2024-01-20'),
      };

      vi.mocked(prisma.vital.update).mockResolvedValue(updatedVital as any);

      const result = await vitalsService.updateVital('patient-1', 'vital-1', updateData);

      expect(result).toEqual(updatedVital);
      const updateCall = vi.mocked(prisma.vital.update).mock.calls[0][0];
      expect(updateCall.data.date).toBeInstanceOf(Date);
    });

    it('should throw NotFoundError if vital does not exist', async () => {
      vi.mocked(prisma.vital.findFirst).mockResolvedValue(null);

      await expect(
        vitalsService.updateVital('patient-1', 'invalid-vital', { systolic: 120 })
      ).rejects.toThrow(NotFoundError);
      expect(prisma.vital.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if vital belongs to different patient', async () => {
      vi.mocked(prisma.vital.findFirst).mockResolvedValue(null);

      await expect(
        vitalsService.updateVital('patient-2', 'vital-1', { systolic: 120 })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteVital', () => {
    const mockVital = {
      id: 'vital-1',
      patientId: 'patient-1',
      date: new Date('2024-01-15'),
    };

    beforeEach(() => {
      vi.mocked(prisma.vital.findFirst).mockResolvedValue(mockVital as any);
      vi.mocked(prisma.vital.delete).mockResolvedValue(mockVital as any);
    });

    it('should delete a vital', async () => {
      await vitalsService.deleteVital('patient-1', 'vital-1');

      expect(prisma.vital.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'vital-1',
          patientId: 'patient-1',
        },
      });
      expect(prisma.vital.delete).toHaveBeenCalledWith({
        where: { id: 'vital-1' },
      });
    });

    it('should throw NotFoundError if vital does not exist', async () => {
      vi.mocked(prisma.vital.findFirst).mockResolvedValue(null);

      await expect(
        vitalsService.deleteVital('patient-1', 'invalid-vital')
      ).rejects.toThrow(NotFoundError);
      expect(prisma.vital.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if vital belongs to different patient', async () => {
      vi.mocked(prisma.vital.findFirst).mockResolvedValue(null);

      await expect(
        vitalsService.deleteVital('patient-2', 'vital-1')
      ).rejects.toThrow(NotFoundError);
    });
  });
});




