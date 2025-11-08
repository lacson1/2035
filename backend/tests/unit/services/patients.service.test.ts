import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PatientsService } from '../../../src/services/patients.service';
import prisma from '../../../src/config/database';
import { cacheService } from '../../../src/services/cache.service';
import { NotFoundError, ValidationError } from '../../../src/utils/errors';
import { CACHE_TTL } from '../../../src/config/constants';

// Mock dependencies
vi.mock('../../../src/config/database', () => ({
  default: {
    patient: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('../../../src/services/cache.service', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('PatientsService', () => {
  let patientsService: PatientsService;

  beforeEach(() => {
    vi.clearAllMocks();
    patientsService = new PatientsService();
  });

  describe('getPatients', () => {
    it('should return paginated patients', async () => {
      const mockPatients = [
        { id: '1', name: 'John Doe', riskScore: 50 },
        { id: '2', name: 'Jane Smith', riskScore: 30 },
      ];

      vi.mocked(prisma.patient.findMany).mockResolvedValue(mockPatients as any);
      vi.mocked(prisma.patient.count).mockResolvedValue(2);
      vi.mocked(cacheService.get).mockResolvedValue(null);

      const result = await patientsService.getPatients({ page: 1, limit: 20 });

      expect(result.items).toEqual(mockPatients);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(cacheService.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        CACHE_TTL.PATIENT_LIST
      );
    });

    it('should return cached data if available', async () => {
      const cachedData = {
        items: [{ id: '1', name: 'Cached Patient' }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      vi.mocked(cacheService.get).mockResolvedValue(cachedData);

      const result = await patientsService.getPatients();

      expect(result).toEqual(cachedData);
      expect(prisma.patient.findMany).not.toHaveBeenCalled();
    });

    it('should filter by search term', async () => {
      vi.mocked(cacheService.get).mockResolvedValue(null);
      vi.mocked(prisma.patient.findMany).mockResolvedValue([]);
      vi.mocked(prisma.patient.count).mockResolvedValue(0);

      await patientsService.getPatients({ search: 'John' });

      expect(prisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.any(Object) }),
            ]),
          }),
        })
      );
    });

    it('should filter by risk level', async () => {
      vi.mocked(cacheService.get).mockResolvedValue(null);
      vi.mocked(prisma.patient.findMany).mockResolvedValue([]);
      vi.mocked(prisma.patient.count).mockResolvedValue(0);

      await patientsService.getPatients({ risk: 'high' });

      expect(prisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            riskScore: expect.objectContaining({ gt: 66 }),
          }),
        })
      );
    });

    it('should respect pagination limits', async () => {
      vi.mocked(cacheService.get).mockResolvedValue(null);
      vi.mocked(prisma.patient.findMany).mockResolvedValue([]);
      vi.mocked(prisma.patient.count).mockResolvedValue(0);

      await patientsService.getPatients({ limit: 150 }); // Over max limit

      expect(prisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100, // Should cap at MAX_LIMIT
        })
      );
    });
  });

  describe('getPatientById', () => {
    it('should return patient with relations', async () => {
      const mockPatient = {
        id: '1',
        name: 'John Doe',
        medications: [],
        appointments: [],
        clinicalNotes: [],
        imagingStudies: [],
        timelineEvents: [],
        careTeamMembers: [],
      };

      vi.mocked(cacheService.get).mockResolvedValue(null);
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);

      const result = await patientsService.getPatientById('1');

      expect(result).toEqual(mockPatient);
      expect(prisma.patient.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          include: expect.any(Object),
        })
      );
      expect(cacheService.set).toHaveBeenCalledWith(
        'patient:1',
        mockPatient,
        CACHE_TTL.PATIENT_DETAIL
      );
    });

    it('should return cached patient if available', async () => {
      const cachedPatient = { id: '1', name: 'Cached Patient' };
      vi.mocked(cacheService.get).mockResolvedValue(cachedPatient as any);

      const result = await patientsService.getPatientById('1');

      expect(result).toEqual(cachedPatient);
      expect(prisma.patient.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if patient does not exist', async () => {
      vi.mocked(cacheService.get).mockResolvedValue(null);
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(null);

      await expect(patientsService.getPatientById('999')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('createPatient', () => {
    it('should create patient with valid data', async () => {
      const patientData = {
        name: 'New Patient',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'Male',
      };

      const createdPatient = { id: '1', ...patientData };
      vi.mocked(prisma.patient.create).mockResolvedValue(createdPatient as any);

      const result = await patientsService.createPatient(patientData, 'user-1');

      expect(result).toEqual(createdPatient);
      expect(prisma.patient.create).toHaveBeenCalled();
    });

    it('should deduplicate allergies', async () => {
      const patientData = {
        name: 'New Patient',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'Male',
        allergies: ['Penicillin', 'penicillin', 'Aspirin'],
      };

      vi.mocked(prisma.patient.create).mockResolvedValue({
        id: '1',
        ...patientData,
      } as any);

      await patientsService.createPatient(patientData, 'user-1');

      expect(prisma.patient.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            allergies: ['Penicillin', 'Aspirin'], // Duplicates removed
          }),
        })
      );
    });
  });

  describe('updatePatient', () => {
    it('should update patient', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedPatient = { id: '1', name: 'Updated Name' };

      vi.mocked(prisma.patient.findUnique).mockResolvedValue({
        id: '1',
      } as any);
      vi.mocked(prisma.patient.update).mockResolvedValue(updatedPatient as any);
      vi.mocked(cacheService.delete).mockResolvedValue(true);

      const result = await patientsService.updatePatient('1', updateData, 'user-1');

      expect(result).toEqual(updatedPatient);
      expect(cacheService.delete).toHaveBeenCalledWith('patient:1');
    });

    it('should throw NotFoundError if patient does not exist', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(null);

      await expect(
        patientsService.updatePatient('999', {}, 'user-1')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deletePatient', () => {
    it('should delete patient', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({
        id: '1',
      } as any);
      vi.mocked(prisma.patient.delete).mockResolvedValue({} as any);
      vi.mocked(cacheService.delete).mockResolvedValue(true);

      await patientsService.deletePatient('1');

      expect(prisma.patient.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(cacheService.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundError if patient does not exist', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(null);

      await expect(patientsService.deletePatient('999')).rejects.toThrow(
        NotFoundError
      );
    });
  });
});

