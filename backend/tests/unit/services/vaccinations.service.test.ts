import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VaccinationsService } from '../../../src/services/vaccinations.service';
import prisma from '../../../src/config/database';
import { cacheService } from '../../../src/services/cache.service';
import { NotFoundError } from '../../../src/utils/errors';

vi.mock('../../../src/config/database', () => ({
  default: {
    patient: {
      findUnique: vi.fn(),
    },
    vaccination: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
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
    deletePattern: vi.fn(),
  },
}));

describe('VaccinationsService', () => {
  let vaccinationsService: VaccinationsService;

  beforeEach(() => {
    vi.clearAllMocks();
    vaccinationsService = new VaccinationsService();
  });

  describe('getPatientVaccinations', () => {
    it('should return paginated vaccinations', async () => {
      const mockVaccinations = [
        { id: '1', patientId: 'patient-1', vaccineName: 'COVID-19', verified: false },
        { id: '2', patientId: 'patient-1', vaccineName: 'Flu', verified: true },
      ];

      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(cacheService.get).mockResolvedValue(null);
      vi.mocked(prisma.vaccination.findMany).mockResolvedValue(mockVaccinations as any);
      vi.mocked(prisma.vaccination.count).mockResolvedValue(2);

      const result = await vaccinationsService.getPatientVaccinations('patient-1', { page: 1, limit: 50 });

      expect(result.items).toEqual(mockVaccinations);
      expect(result.total).toBe(2);
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should filter by verified status', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(cacheService.get).mockResolvedValue(null);
      vi.mocked(prisma.vaccination.findMany).mockResolvedValue([]);
      vi.mocked(prisma.vaccination.count).mockResolvedValue(0);

      await vaccinationsService.getPatientVaccinations('patient-1', { verified: true });

      expect(prisma.vaccination.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ verified: true }),
        })
      );
    });
  });

  describe('createVaccination', () => {
    it('should create vaccination', async () => {
      const vaccinationData = {
        vaccineName: 'COVID-19',
        date: '2024-01-15',
      };

      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(prisma.vaccination.create).mockResolvedValue({ id: '1', ...vaccinationData } as any);

      const result = await vaccinationsService.createVaccination('patient-1', vaccinationData);

      expect(result).toBeDefined();
      expect(cacheService.deletePattern).toHaveBeenCalled();
    });
  });
});

