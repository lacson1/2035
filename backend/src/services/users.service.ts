import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { User } from '@prisma/client';
import { logger } from '../utils/logger';

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  isActive?: boolean;
}

export interface UserListResult {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UsersService {
  async getUsers(params: UserListParams = {}): Promise<UserListResult> {
    logger.debug('getUsers called', params);
    
    const page = params.page || 1;
    const limit = params.limit || 100;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.role) {
      where.role = params.role;
      logger.debug('Filtering by role', params.role);
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
      logger.debug('Filtering by isActive', params.isActive);
    } else {
      // Default to active users only
      where.isActive = true;
      logger.debug('Defaulting to active users only');
    }

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { username: { contains: params.search, mode: 'insensitive' } },
      ];
      logger.debug('Adding search filter', params.search);
    }

    logger.debug('Prisma where clause', where);

    try {
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            specialty: true,
            department: true,
            phone: true,
            avatarUrl: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
            // Exclude password hash
          },
          orderBy: [
            { lastName: 'asc' },
            { firstName: 'asc' },
          ],
        }),
        prisma.user.count({ where }),
      ]);

      logger.debug('getUsers result', { 
        count: users.length, 
        total,
        sample: users.length > 0 ? {
          id: users[0].id,
          name: `${users[0].firstName} ${users[0].lastName}`,
          role: users[0].role,
          email: users[0].email,
        } : null
      });

      const totalPages = Math.ceil(total / limit);

      return {
        items: users as any,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error('Error in getUsers', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        specialty: true,
        department: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    return user as any;
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username?: string;
    role?: string;
    specialty?: string;
    department?: string;
    phone?: string;
  }): Promise<User> {
    const { AuthService } = await import('./auth.service');
    const authService = new AuthService();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username || data.email.split('@')[0] },
        ],
      },
    });

    if (existingUser) {
      throw new ValidationError('User already exists', {
        email: existingUser.email === data.email ? ['Email already registered'] : [],
        username: existingUser.username === (data.username || data.email.split('@')[0]) ? ['Username already taken'] : [],
      });
    }

    // Hash password
    const passwordHash = await authService.hashPassword(data.password);

    // Generate username from email if not provided
    const generatedUsername = data.username || data.email.split('@')[0];

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: generatedUsername,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: (data.role as any) || 'read_only',
        specialty: data.specialty,
        department: data.department,
        phone: data.phone,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        specialty: true,
        department: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as any;
  }

  async getProviders(params: { role?: string; search?: string } = {}): Promise<User[]> {
    logger.debug('getProviders called', params);
    
    // Allowed provider roles
    const allowedRoles = ['physician', 'nurse_practitioner', 'physician_assistant', 'nurse'];
    
    const where: any = {
      isActive: true,
      role: {
        in: allowedRoles,
      },
    };

    // If a specific role is requested, validate it's in the allowed list
    if (params.role) {
      if (allowedRoles.includes(params.role)) {
        where.role = params.role;
        logger.debug('Filtering providers by role', params.role);
      } else {
        logger.warn('Invalid role requested for providers', params.role);
        // Return empty array if invalid role requested
        return [];
      }
    }

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
      logger.debug('Adding search filter', params.search);
    }

    logger.debug('Prisma where clause for providers', where);

    try {
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          specialty: true,
          department: true,
          phone: true,
          avatarUrl: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
      });

      logger.debug('getProviders result', { 
        count: users.length,
        providers: users.length > 0 ? users.map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          role: u.role,
          email: u.email,
        })) : []
      });

      if (users.length === 0) {
        logger.debug('No providers found. Checking all users...');
        const allUsers = await prisma.user.findMany({
          select: { id: true, firstName: true, lastName: true, role: true, isActive: true },
        });
        logger.debug('All users in database', allUsers.map(u => ({
          name: `${u.firstName} ${u.lastName}`,
          role: u.role,
          isActive: u.isActive,
        })));
      }

      return users as any;
    } catch (error) {
      logger.error('Error in getProviders', error);
      throw error;
    }
  }

  async updateUser(
    id: string,
    data: Partial<{
      email: string;
      firstName: string;
      lastName: string;
      username: string;
      role: string;
      specialty: string;
      department: string;
      phone: string;
      isActive: boolean;
      avatarUrl: string;
    }>
  ): Promise<User> {
    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError('User', id);
    }

    // Check if email or username conflicts with another user
    if (data.email || data.username) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(data.email ? [{ email: data.email }] : []),
            ...(data.username ? [{ username: data.username }] : []),
          ],
        },
      });

      if (conflictUser) {
        throw new ValidationError('Email or username already in use');
      }
    }

    const updateData: any = { ...data };
    
    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        specialty: true,
        department: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as any;
  }

  async deleteUser(id: string): Promise<void> {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    // Soft delete by setting isActive to false
    // Hard delete would cascade and break relations
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    // Get user's role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // Get permissions for the role
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role: {
          code: user.role,
        },
      },
      include: {
        permission: true,
      },
    });

    return rolePermissions.map((rp) => rp.permission.code);
  }
}

export const usersService = new UsersService();

