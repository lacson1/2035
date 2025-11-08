import { Request, Response, NextFunction } from 'express';
import { ReferralsService } from '../services/referrals.service';
import { UnauthorizedError } from '../utils/errors';

const referralsService = new ReferralsService();

export class ReferralsController {
  async getReferrals(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};

      if (req.query.patientId) {
        filters.patientId = req.query.patientId as string;
      }

      if (req.query.status) {
        filters.status = req.query.status;
      }

      if (req.query.priority) {
        filters.priority = req.query.priority;
      }

      if (req.query.specialty) {
        filters.specialty = req.query.specialty as string;
      }

      if (req.query.from) {
        filters.from = new Date(req.query.from as string);
      }

      if (req.query.to) {
        filters.to = new Date(req.query.to as string);
      }

      const referrals = await referralsService.getReferrals(filters);

      res.json({
        data: referrals,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPatientReferrals(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const referrals = await referralsService.getPatientReferrals(patientId);

      res.json({
        data: referrals,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReferral(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, referralId } = req.params;
      const referral = await referralsService.getReferralById(patientId, referralId);

      res.json({
        data: referral,
      });
    } catch (error) {
      next(error);
    }
  }

  async createReferral(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { patientId } = req.params;
      const {
        date,
        specialty,
        reason,
        diagnosis,
        priority,
        status,
        referringPhysicianId,
        referredToProviderId,
        referredToProvider,
        referredToFacility,
        referredToAddress,
        referredToPhone,
        appointmentDate,
        appointmentTime,
        notes,
        attachments,
        insurancePreAuth,
        preAuthNumber,
        followUpRequired,
        followUpDate,
      } = req.body;

      const referral = await referralsService.createReferral(patientId, {
        date: new Date(date),
        specialty,
        reason,
        diagnosis,
        priority,
        status,
        referringPhysicianId: referringPhysicianId || req.user.userId,
        referredToProviderId,
        referredToProvider,
        referredToFacility,
        referredToAddress,
        referredToPhone,
        appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
        appointmentTime,
        notes,
        attachments,
        insurancePreAuth,
        preAuthNumber,
        followUpRequired,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      });

      res.status(201).json({
        data: referral,
        message: 'Referral created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReferral(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, referralId } = req.params;
      const updateData: any = { ...req.body };

      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      if (updateData.appointmentDate) {
        updateData.appointmentDate = new Date(updateData.appointmentDate);
      }

      if (updateData.followUpDate) {
        updateData.followUpDate = new Date(updateData.followUpDate);
      }

      const referral = await referralsService.updateReferral(
        patientId,
        referralId,
        updateData
      );

      res.json({
        data: referral,
        message: 'Referral updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReferral(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, referralId } = req.params;
      await referralsService.deleteReferral(patientId, referralId);

      res.json({
        message: 'Referral deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const referralsController = new ReferralsController();

