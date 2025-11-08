import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersService } from '../../../src/services/users.service';
import prisma from '../../../src/config/database';
import { NotFoundError } from '../../../src/utils/errors';

// Mock Prisma
vi.mock('../../../src/config/database', () => ({
  default: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(() => {
    vi.clearAllMocks();
    usersService = new UsersService();
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'physician',
          isActive: true,
        },
        {
          id: '2',
          email: 'user2@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'nurse',
          isActive: true,
        },
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
      vi.mocked(prisma.user.count).mockResolvedValue(2);

      const result = await usersService.getUsers({ page: 1, limit: 20 });

      expect(result.items).toEqual(mockUsers);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should filter by role', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      await usersService.getUsers({ role: 'physician' });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: 'physician',
          }),
        })
      );
    });

    it('should filter by active status', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      await usersService.getUsers({ isActive: false });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: false,
          }),
        })
      );
    });

    it('should default to active users only', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      await usersService.getUsers();

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should search by name or email', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      await usersService.getUsers({ search: 'john' });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ firstName: expect.any(Object) }),
              expect.objectContaining({ lastName: expect.any(Object) }),
              expect.objectContaining({ email: expect.any(Object) }),
            ]),
          }),
        })
      );
    });

    it('should exclude password hash from results', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      await usersService.getUsers();

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            // passwordHash should NOT be in select
          }),
        })
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'physician',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await usersService.getUserById('1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundError if user does not exist', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(usersService.getUserById('999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getUsersByRole', () => {
    it('should return users filtered by role', async () => {
      const mockUsers = [
        { id: '1', role: 'physician' },
        { id: '2', role: 'physician' },
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);

      const result = await usersService.getUsersByRole('physician');

      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: 'physician',
            isActive: true,
          }),
        })
      );
    });
  });
});

