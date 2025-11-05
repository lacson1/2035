import { Request, Response, NextFunction } from 'express';
import { hubsService, CreateHubData, UpdateHubData } from '../services/hubs.service';
import { UnauthorizedError } from '../utils/errors';

export class HubsController {
  async getHubs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

      const result = await hubsService.getAllHubs({ page, limit });

      res.json({
        data: result.items,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getHub(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const hub = await hubsService.getHubById(id);

      if (!hub) {
        return res.status(404).json({
          message: 'Hub not found',
        });
      }

      res.json({
        data: hub,
      });
    } catch (error) {
      next(error);
    }
  }

  async createHub(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const hubData: CreateHubData = req.body;
      const hub = await hubsService.createHub(hubData);

      res.status(201).json({
        data: hub,
        message: 'Hub created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateHub(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;
      const hubData: UpdateHubData = req.body;
      const hub = await hubsService.updateHub(id, hubData);

      res.json({
        data: hub,
        message: 'Hub updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteHub(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;
      await hubsService.deleteHub(id);

      res.json({
        message: 'Hub deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Hub Functions
  async getHubFunctions(req: Request, res: Response, next: NextFunction) {
    try {
      const { hubId } = req.params;
      const functions = await hubsService.getHubFunctions(hubId);

      res.json({
        data: functions,
      });
    } catch (error) {
      next(error);
    }
  }

  async createHubFunction(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { hubId } = req.params;
      const function_ = await hubsService.createHubFunction(hubId, req.body);

      res.status(201).json({
        data: function_,
        message: 'Hub function created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateHubFunction(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { hubId, functionId } = req.params;
      const function_ = await hubsService.updateHubFunction(hubId, functionId, req.body);

      res.json({
        data: function_,
        message: 'Hub function updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteHubFunction(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { hubId, functionId } = req.params;
      await hubsService.deleteHubFunction(hubId, functionId);

      res.json({
        message: 'Hub function deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Hub Resources
  async getHubResources(req: Request, res: Response, next: NextFunction) {
    try {
      const { hubId } = req.params;
      const resources = await hubsService.getHubResources(hubId);

      res.json({
        data: resources,
      });
    } catch (error) {
      next(error);
    }
  }

  async createHubResource(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { hubId } = req.params;
      const resource = await hubsService.createHubResource(hubId, req.body);

      res.status(201).json({
        data: resource,
        message: 'Hub resource created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateHubResource(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { hubId, resourceId } = req.params;
      const resource = await hubsService.updateHubResource(hubId, resourceId, req.body);

      res.json({
        data: resource,
        message: 'Hub resource updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteHubResource(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { hubId, resourceId } = req.params;
      await hubsService.deleteHubResource(hubId, resourceId);

      res.json({
        message: 'Hub resource deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Hub Notes
  async getHubNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { hubId } = req.params;
      const notes = await hubsService.getHubNotes(hubId);

      res.json({
        data: notes,
      });
    } catch (error) {
      next(error);
    }
  }

  async createOrUpdateHubNote(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { hubId } = req.params;
      const note = await hubsService.createOrUpdateHubNote(hubId, req.body);

      res.status(201).json({
        data: note,
        message: 'Hub note saved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteHubNote(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { hubId, noteId } = req.params;
      await hubsService.deleteHubNote(hubId, noteId);

      res.json({
        message: 'Hub note deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Hub Templates
  async getHubTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const { hubId } = req.params;
      const templates = await hubsService.getHubTemplates(hubId);

      res.json({
        data: templates,
      });
    } catch (error) {
      next(error);
    }
  }

  async createHubTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const hubId = req.params.hubId || undefined;
      const template = await hubsService.createHubTemplate(hubId, req.body);

      res.status(201).json({
        data: template,
        message: 'Hub template created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateHubTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { templateId } = req.params;
      const template = await hubsService.updateHubTemplate(templateId, req.body);

      res.json({
        data: template,
        message: 'Hub template updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteHubTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { templateId } = req.params;
      await hubsService.deleteHubTemplate(templateId);

      res.json({
        message: 'Hub template deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const hubsController = new HubsController();

