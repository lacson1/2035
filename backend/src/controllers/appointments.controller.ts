import { Request, Response, NextFunction } from 'express';
import { appointmentsService } from '../services/appointments.service';
import { UnauthorizedError } from '../utils/errors';

export class AppointmentsController {
  async getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};

      if (req.query.patientId) {
        filters.patientId = req.query.patientId as string;
      }

      if (req.query.providerId) {
        filters.providerId = req.query.providerId as string;
      }

      if (req.query.status) {
        filters.status = req.query.status;
      }

      if (req.query.from) {
        filters.from = new Date(req.query.from as string);
      }

      if (req.query.to) {
        filters.to = new Date(req.query.to as string);
      }

      const appointments = await appointmentsService.getAppointments(filters);

      res.json({
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPatientAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const appointments = await appointmentsService.getPatientAppointments(patientId);

      res.json({
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, aptId } = req.params;
      const appointment = await appointmentsService.getAppointmentById(patientId, aptId);

      res.json({
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { patientId } = req.params;
      const {
        date,
        time,
        type,
        providerId,
        status,
        notes,
        consultationType,
        specialty,
        duration,
        location,
        reason,
        referralRequired,
      } = req.body;

      const appointment = await appointmentsService.createAppointment(patientId, {
        date: new Date(date),
        time,
        type,
        providerId: providerId || req.user.userId,
        status,
        notes,
        consultationType,
        specialty,
        duration,
        location,
        reason,
        referralRequired,
      });

      res.status(201).json({
        data: appointment,
        message: 'Appointment created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, aptId } = req.params;
      const updateData: any = { ...req.body };

      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      const appointment = await appointmentsService.updateAppointment(
        patientId,
        aptId,
        updateData
      );

      res.json({
        data: appointment,
        message: 'Appointment updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, aptId } = req.params;
      await appointmentsService.deleteAppointment(patientId, aptId);

      res.json({
        message: 'Appointment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentsController = new AppointmentsController();

