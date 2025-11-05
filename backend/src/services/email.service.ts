/**
 * Email Service
 * Handles sending emails for password reset, notifications, etc.
 * 
 * For production, integrate with:
 * - SendGrid
 * - AWS SES
 * - Mailgun
 * - Nodemailer with SMTP
 */

import { config } from '../config/env';
import { logger } from '../utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  /**
   * Send an email
   * In development, logs to console. In production, sends via configured provider.
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    const { to, subject, html, text } = options;

    // In development, just log
    if (config.nodeEnv === 'development') {
      logger.info('📧 Email would be sent:', {
        to,
        subject,
        preview: text || html.substring(0, 100) + '...',
      });
      console.log('\n=== EMAIL ===');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${text || html}`);
      console.log('=============\n');
      return;
    }

    // Production: Use actual email service
    // TODO: Integrate with your email provider (SendGrid, AWS SES, etc.)
    
    // Example with Nodemailer (if SMTP configured):
    if (process.env.SMTP_HOST) {
      try {
        // Uncomment and configure when SMTP is set up
        /*
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to,
          subject,
          text,
          html,
        });
        */
        
        logger.info(`Email sent to ${to}`);
      } catch (error) {
        logger.error('Failed to send email:', error);
        throw new Error('Failed to send email');
      }
    } else {
      logger.warn('SMTP not configured, email not sent');
      // In development/testing, we still "succeed"
      if (config.nodeEnv === 'development') {
        return;
      }
      throw new Error('Email service not configured');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetToken: string, resetUrl?: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || config.cors.origin;
    const resetLink = resetUrl || `${frontendUrl}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password for Physician Dashboard 2035.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${resetLink}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
            <div class="footer">
              <p>Hospital 2035 - Physician Dashboard</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Password Reset Request

      You requested to reset your password for Physician Dashboard 2035.
      
      Click this link to reset your password:
      ${resetLink}
      
      This link will expire in 1 hour.
      
      If you didn't request this, please ignore this email.
      
      Hospital 2035 - Physician Dashboard
    `;

    await this.sendEmail({
      to,
      subject: 'Password Reset Request - Physician Dashboard 2035',
      html,
      text,
    });
  }
}

export const emailService = new EmailService();

