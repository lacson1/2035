import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import prisma from '../config/database';
import { JwtPayload, AuthTokens } from '../types';
import { UnauthorizedError, ValidationError } from '../utils/errors';

const SALT_ROUNDS = 12;

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateTokens(payload: JwtPayload): AuthTokens {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as string,
    } as SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as string,
    } as SignOptions);

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{
    tokens: AuthTokens;
    user: any;
  }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    const isPasswordValid = await this.comparePassword(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
    };

    const tokens = this.generateTokens(payload);

    // Store refresh token in database
    const expiresAt = new Date();
    // Parse refresh token expiration (e.g., "7d" = 7 days)
    const refreshExpiresIn = config.jwt.refreshExpiresIn as string;
    let secondsToAdd = 7 * 24 * 60 * 60; // Default 7 days
    if (refreshExpiresIn.endsWith('d')) {
      const days = parseInt(refreshExpiresIn.replace('d', ''), 10);
      secondsToAdd = days * 24 * 60 * 60;
    } else if (refreshExpiresIn.endsWith('h')) {
      const hours = parseInt(refreshExpiresIn.replace('h', ''), 10);
      secondsToAdd = hours * 60 * 60;
    } else if (refreshExpiresIn.endsWith('m')) {
      const minutes = parseInt(refreshExpiresIn.replace('m', ''), 10);
      secondsToAdd = minutes * 60;
    }
    expiresAt.setSeconds(expiresAt.getSeconds() + secondsToAdd);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        expiresAt,
      },
    });

    // Remove password hash from user object
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      tokens,
      user: userWithoutPassword,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // First verify the token signature
    const payload = this.verifyRefreshToken(refreshToken);

    // Verify the refresh token exists in database and is valid
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedError('Invalid or revoked refresh token');
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Delete expired session
      await prisma.session.delete({
        where: { id: session.id },
      });
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Verify user still exists and is active
    if (!session.user || !session.user.isActive) {
      // Delete session for inactive user
      await prisma.session.delete({
        where: { id: session.id },
      });
      throw new UnauthorizedError('User not found or inactive');
    }

    const newPayload: JwtPayload = {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role as any,
    };

    const accessToken = jwt.sign(newPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as string,
    } as SignOptions);

    return { accessToken };
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    tokens: AuthTokens;
    user: any;
  }> {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username: username || email.split('@')[0] },
        ],
      },
    });

    if (existingUser) {
      throw new ValidationError('User already exists', {
        email: existingUser.email === email ? ['Email already registered'] : [],
        username: existingUser.username === (username || email.split('@')[0]) ? ['Username already taken'] : [],
      });
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Generate username from email if not provided
    const generatedUsername = username || email.split('@')[0];

    // Check if this is the first user - if so, make them an administrator
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    // Create user with appropriate role
    // First user becomes administrator, others get read_only (can be changed by admin later)
    const user = await prisma.user.create({
      data: {
        email,
        username: generatedUsername,
        passwordHash,
        firstName,
        lastName,
        role: isFirstUser ? 'admin' : 'read_only',
        isActive: true,
      },
    });

    // Log successful registration
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
    };

    const tokens = this.generateTokens(payload);

    // Store refresh token in database
    const expiresAt = new Date();
    const refreshExpiresIn = config.jwt.refreshExpiresIn as string;
    let secondsToAdd = 7 * 24 * 60 * 60; // Default 7 days
    if (refreshExpiresIn.endsWith('d')) {
      const days = parseInt(refreshExpiresIn.replace('d', ''), 10);
      secondsToAdd = days * 24 * 60 * 60;
    } else if (refreshExpiresIn.endsWith('h')) {
      const hours = parseInt(refreshExpiresIn.replace('h', ''), 10);
      secondsToAdd = hours * 60 * 60;
    } else if (refreshExpiresIn.endsWith('m')) {
      const minutes = parseInt(refreshExpiresIn.replace('m', ''), 10);
      secondsToAdd = minutes * 60;
    }
    expiresAt.setSeconds(expiresAt.getSeconds() + secondsToAdd);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        expiresAt,
      },
    });

    // Remove password hash from user object
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      tokens,
      user: userWithoutPassword,
    };
  }
}

export const authService = new AuthService();

