import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SurgicalNotesService } from '../../../src/services/surgical-notes.service';
import prisma from '../../../src/config/database';
import { cacheService } from '../../../src/services/cache.service';
import { NotFoundError } from '../../../src/utils/errors';

vi.mock('../../../src/config/database', () => ({
  default: {
    patient: {
      findUnique: vi.fn(),
    },
    surgicalNote: {
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

describe('SurgicalNotesService', () => {
  let surgicalNotesService: SurgicalNotesService;

  beforeEach(() => {
    vi.clearAllMocks();
    surgicalNotesService = new SurgicalNotesService();
  });

  describe('getPatientSurgicalNotes', () => {
    it('should return paginated surgical notes', async () => {
      const mockNotes = [
        { id: '1', patientId: 'patient-1', procedureName: 'Appendectomy', status: 'completed' },
      ];

      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(cacheService.get).mockResolvedValue(null);
      vi.mocked(prisma.surgicalNote.findMany).mockResolvedValue(mockNotes as any);
      vi.mocked(prisma.surgicalNote.count).mockResolvedValue(1);

      const result = await surgicalNotesService.getPatientSurgicalNotes('patient-1', { page: 1, limit: 50 });

      expect(result.items).toEqual(mockNotes);
      expect(result.total).toBe(1);
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(cacheService.get).mockResolvedValue(null);
      vi.mocked(prisma.surgicalNote.findMany).mockResolvedValue([]);
      vi.mocked(prisma.surgicalNote.count).mockResolvedValue(0);

      await surgicalNotesService.getPatientSurgicalNotes('patient-1', { status: 'completed' });

      expect(prisma.surgicalNote.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'completed' }),
        })
      );
    });
  });

  describe('createSurgicalNote', () => {
    it('should create surgical note', async () => {
      const noteData = {
        date: '2024-01-15',
        procedureName: 'Appendectomy',
        procedureType: 'elective' as const,
        indication: 'Appendicitis',
        preoperativeDiagnosis: 'Appendicitis',
        procedureDescription: 'Laparoscopic appendectomy',
      };

      vi.mocked(prisma.patient.findUnique).mockResolvedValue({ id: 'patient-1' } as any);
      vi.mocked(prisma.surgicalNote.create).mockResolvedValue({ id: '1', ...noteData } as any);

      const result = await surgicalNotesService.createSurgicalNote('patient-1', noteData);

      expect(result).toBeDefined();
      expect(cacheService.deletePattern).toHaveBeenCalled();
    });
  });
});

