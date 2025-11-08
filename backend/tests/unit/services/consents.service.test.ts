import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConsentsService } from '../../../src/services/consents.service';
import prisma from '../../../src/config/database';
import { cacheService } from '../../../src/services/cache.service';
import { NotFoundError, ValidationError } from '../../../src/utils/errors';
import { CACHE_TTL } from '../../../src/config/constants';

// Mock dependencies
vi.mock('../../../src/config/database', () => ({
  default: {
    patient: {
      findUnique: vi.fn(),
    },
    consent: {
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

describe('ConsentsService', () => {
  let consentsService: ConsentsService;

  beforeEach(() => {
    vi.clearAllMocks();
    consentsService = new ConsentsService();
  });

  describe('getPatientConsents', () => {
    it('should return paginated consents', async () => {
      const mockConsents = [
        { id: '1', patientId: 'patient-1', title: 'Consent 1', status: 'pending' },
        { id: '2', patientId: 'patient-1', title: 'Consent 2', status: 'signed' },
      ];

      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(cacheService.get).mockResolvedValue(null);
      vi.mocked(prisma.consent.findMany).mockResolvedValue(mockConsents as any);
      vi.mocked(prisma.consent.count).mockResolvedValue(2);

      const result = await consentsService.getPatientConsents('patient-1', { page: 1, limit: 50 });

      expect(result.items).toEqual(mockConsents);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should return cached data if available', async () => {
      const cachedData = {
        items: [{ id: '1', title: 'Cached Consent' }],
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      };

      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(cacheService.get).mockResolvedValue(cachedData);

      const result = await consentsService.getPatientConsents('patient-1');

      expect(result).toEqual(cachedData);
      expect(prisma.consent.findMany).not.toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(cacheService.get).mockResolvedValue(null);
      vi.mocked(prisma.consent.findMany).mockResolvedValue([]);
      vi.mocked(prisma.consent.count).mockResolvedValue(0);

      await consentsService.getPatientConsents('patient-1', { status: 'signed' });

      expect(prisma.consent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'signed' }),
        })
      );
    });

    it('should throw NotFoundError if patient does not exist', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(null);

      await expect(consentsService.getPatientConsents('invalid-patient')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getConsentById', () => {
    it('should return consent by id', async () => {
      const mockConsent = { id: '1', patientId: 'patient-1', title: 'Test Consent' };
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(prisma.consent.findFirst).mockResolvedValue(mockConsent as any);

      const result = await consentsService.getConsentById('patient-1', '1');

      expect(result).toEqual(mockConsent);
    });

    it('should throw NotFoundError if consent does not exist', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(prisma.consent.findFirst).mockResolvedValue(null);

      await expect(consentsService.getConsentById('patient-1', '999')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('createConsent', () => {
    it('should create consent with valid data', async () => {
      const consentData = {
        date: '2024-01-15',
        type: 'procedure' as const,
        title: 'Test Consent',
        description: 'Test description',
      };

      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(prisma.consent.create).mockResolvedValue({ id: '1', ...consentData } as any);

      const result = await consentsService.createConsent('patient-1', consentData);

      expect(result).toBeDefined();
      expect(prisma.consent.create).toHaveBeenCalled();
      expect(cacheService.deletePattern).toHaveBeenCalled();
    });

    it('should throw NotFoundError if patient does not exist', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(null);

      await expect(
        consentsService.createConsent('invalid-patient', {
          date: '2024-01-15',
          type: 'procedure',
          title: 'Test',
          description: 'Test',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateConsent', () => {
    it('should update consent', async () => {
      const updateData = { status: 'signed' as const };
      const updatedConsent = { id: '1', status: 'signed' };

      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(prisma.consent.findFirst).mockResolvedValue({ id: '1' } as any);
      vi.mocked(prisma.consent.update).mockResolvedValue(updatedConsent as any);

      const result = await consentsService.updateConsent('patient-1', '1', updateData);

      expect(result).toEqual(updatedConsent);
      expect(cacheService.deletePattern).toHaveBeenCalled();
    });
  });

  describe('deleteConsent', () => {
    it('should delete consent', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(prisma.consent.findFirst).mockResolvedValue({ id: '1' } as any);
      vi.mocked(prisma.consent.delete).mockResolvedValue({} as any);

      await consentsService.deleteConsent('patient-1', '1');

      expect(prisma.consent.delete).toHaveBeenCalled();
      expect(cacheService.deletePattern).toHaveBeenCalled();
    });
  });
});

