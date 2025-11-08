import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NutritionService } from '../../../src/services/nutrition.service';
import prisma from '../../../src/config/database';
import { cacheService } from '../../../src/services/cache.service';
import { NotFoundError } from '../../../src/utils/errors';

vi.mock('../../../src/config/database', () => ({
  default: {
    patient: {
      findUnique: vi.fn(),
    },
    nutritionEntry: {
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

describe('NutritionService', () => {
  let nutritionService: NutritionService;

  beforeEach(() => {
    vi.clearAllMocks();
    nutritionService = new NutritionService();
  });

  describe('getPatientNutritionEntries', () => {
    it('should return paginated nutrition entries', async () => {
      const mockEntries = [
        { id: '1', patientId: 'patient-1', type: 'assessment', date: new Date() },
      ];

      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(cacheService.get).mockResolvedValue(null);
      vi.mocked(prisma.nutritionEntry.findMany).mockResolvedValue(mockEntries as any);
      vi.mocked(prisma.nutritionEntry.count).mockResolvedValue(1);

      const result = await nutritionService.getPatientNutritionEntries('patient-1', { page: 1, limit: 50 });

      expect(result.items).toEqual(mockEntries);
      expect(result.total).toBe(1);
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should filter by type', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(cacheService.get).mockResolvedValue(null);
      vi.mocked(prisma.nutritionEntry.findMany).mockResolvedValue([]);
      vi.mocked(prisma.nutritionEntry.count).mockResolvedValue(0);

      await nutritionService.getPatientNutritionEntries('patient-1', { type: 'assessment' });

      expect(prisma.nutritionEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'assessment' }),
        })
      );
    });
  });

  describe('createNutritionEntry', () => {
    it('should create nutrition entry', async () => {
      const entryData = {
        date: '2024-01-15',
        type: 'assessment' as const,
      };

      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(prisma.nutritionEntry.create).mockResolvedValue({ id: '1', ...entryData } as any);

      const result = await nutritionService.createNutritionEntry('patient-1', entryData);

      expect(result).toBeDefined();
      expect(cacheService.deletePattern).toHaveBeenCalled();
    });
  });
});

