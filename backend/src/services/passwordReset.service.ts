import crypto from 'crypto';
import { getRedisClient } from '../config/redis';
import prisma from '../config/database';
import { authService } from './auth.service';
import { emailService } from './email.service';
import { NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

// In-memory fallback if Redis is not available
const passwordResetTokens = new Map<string, { userId: string; expiresAt: Date }>();

const TOKEN_EXPIRY_HOURS = 1; // Token expires in 1 hour
const TOKEN_LENGTH = 32; // Token length in bytes

export class PasswordResetService {
  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
  }

  /**
   * Store password reset token
   */
  private async storeToken(token: string, userId: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

    const redis = getRedisClient();
    
    if (redis) {
      // Store in Redis with expiry
      const key = `password-reset:${token}`;
      await redis.setex(key, TOKEN_EXPIRY_HOURS * 3600, JSON.stringify({ userId, expiresAt: expiresAt.toISOString() }));
    } else {
      // Fallback to in-memory storage
      passwordResetTokens.set(token, { userId, expiresAt });
      
      // Clean up expired tokens periodically
      setTimeout(() => {
        passwordResetTokens.delete(token);
      }, TOKEN_EXPIRY_HOURS * 3600 * 1000);
    }
  }

  /**
   * Get and validate password reset token
   */
  private async getToken(token: string): Promise<{ userId: string } | null> {
    const redis = getRedisClient();
    
    if (redis) {
      const key = `password-reset:${token}`;
      const data = await redis.get(key);
      
      if (!data) {
        return null;
      }
      
      const parsed = JSON.parse(data);
      const expiresAt = new Date(parsed.expiresAt);
      
      if (expiresAt < new Date()) {
        await redis.del(key);
        return null;
      }
      
      return { userId: parsed.userId };
    } else {
      // Fallback to in-memory storage
      const tokenData = passwordResetTokens.get(token);
      
      if (!tokenData) {
        return null;
      }
      
      if (tokenData.expiresAt < new Date()) {
        passwordResetTokens.delete(token);
        return null;
      }
      
      return { userId: tokenData.userId };
    }
  }

  /**
   * Delete password reset token (after use)
   */
  private async deleteToken(token: string): Promise<void> {
    const redis = getRedisClient();
    
    if (redis) {
      const key = `password-reset:${token}`;
      await redis.del(key);
    } else {
      passwordResetTokens.delete(token);
    }
  }

  /**
   * Request password reset - generates token and sends email
   */
  async requestPasswordReset(email: string): Promise<void> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      // Still return success to prevent email enumeration
      return;
    }

    if (!user.isActive) {
      logger.warn(`Password reset requested for inactive user: ${email}`);
      // Still return success
      return;
    }

    // Generate token
    const token = this.generateToken();

    // Store token
    await this.storeToken(token, user.id);

    // Send email
    try {
      await emailService.sendPasswordResetEmail(user.email, token);
      logger.info(`Password reset email sent to ${user.email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      // Delete token if email failed
      await this.deleteToken(token);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate password
    if (!newPassword || newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Get token
    const tokenData = await this.getToken(token);
    
    if (!tokenData) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Hash new password
    const passwordHash = await authService.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });

    // Delete token (one-time use)
    await this.deleteToken(token);

    logger.info(`Password reset successful for user: ${user.email}`);
  }

  /**
   * Verify reset token (for frontend validation)
   */
  async verifyToken(token: string): Promise<boolean> {
    const tokenData = await this.getToken(token);
    return tokenData !== null;
  }
}

export const passwordResetService = new PasswordResetService();

