/**
 * Utility to clean up expired sessions from the database
 * This should be run periodically (e.g., via cron job or scheduled task)
 */

import prisma from '../config/database';
import { logger } from './logger';

export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    logger.info(`Cleaned up ${result.count} expired sessions`);
    return result.count;
  } catch (error) {
    logger.error('Error cleaning up expired sessions:', error);
    throw error;
  }
}

/**
 * Clean up expired sessions for a specific user
 */
export async function cleanupUserExpiredSessions(userId: string): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    logger.info(`Cleaned up ${result.count} expired sessions for user ${userId}`);
    return result.count;
  } catch (error) {
    logger.error('Error cleaning up user expired sessions:', error);
    throw error;
  }
}

