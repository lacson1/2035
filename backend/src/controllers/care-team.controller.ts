import { Request, Response, NextFunction } from 'express';
import { careTeamService } from '../services/care-team.service';
import { UnauthorizedError } from '../utils/errors';

export class CareTeamController {
  async getPatientCareTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const members = await careTeamService.getPatientCareTeam(patientId);

      res.json({
        data: members,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCareTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, memberId } = req.params;
      const member = await careTeamService.getCareTeamMember(patientId, memberId);

      res.json({
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  async addCareTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { patientId } = req.params;
      const { userId, role, specialty, notes } = req.body;

      const member = await careTeamService.addCareTeamMember(patientId, {
        userId,
        role,
        specialty,
        notes,
      });

      res.status(201).json({
        data: member,
        message: 'Care team member added successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCareTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, memberId } = req.params;
      const member = await careTeamService.updateCareTeamMember(patientId, memberId, req.body);

      res.json({
        data: member,
        message: 'Care team member updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async removeCareTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, memberId } = req.params;
      await careTeamService.removeCareTeamMember(patientId, memberId);

      res.json({
        message: 'Care team member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const careTeamController = new CareTeamController();

