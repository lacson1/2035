import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { PaginationParams, PaginatedResponse } from '../types';
import { Hub, HubFunction, HubResource, HubNote, HubTemplate } from '@prisma/client';

export interface CreateHubData {
  name: string;
  description: string;
  color: string;
  specialties?: string[];
  isActive?: boolean;
}

export interface UpdateHubData {
  name?: string;
  description?: string;
  color?: string;
  specialties?: string[];
  isActive?: boolean;
}

export interface CreateHubFunctionData {
  name: string;
  description?: string;
  category?: string;
}

export interface CreateHubResourceData {
  title: string;
  type: string;
  url?: string;
  description?: string;
}

export interface CreateHubNoteData {
  content: string;
}

export interface CreateHubTemplateData {
  name: string;
  description?: string;
  template: any;
}

export class HubsService {
  // Hub CRUD operations
  async getAllHubs(params: PaginationParams = {}): Promise<PaginatedResponse<Hub>> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 100, 500);
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
    };

    const [hubs, total] = await Promise.all([
      prisma.hub.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.hub.count({ where }),
    ]);

    return {
      items: hubs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getHubById(id: string): Promise<Hub | null> {
    return prisma.hub.findUnique({
      where: { id },
    });
  }

  async createHub(data: CreateHubData): Promise<Hub> {
    if (!data.name || !data.description || !data.color) {
      throw new ValidationError('Name, description, and color are required');
    }

    return prisma.hub.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        specialties: data.specialties || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async updateHub(id: string, data: UpdateHubData): Promise<Hub> {
    const hub = await this.getHubById(id);
    if (!hub) {
      throw new NotFoundError('Hub not found');
    }

    return prisma.hub.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.color && { color: data.color }),
        ...(data.specialties && { specialties: data.specialties }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async deleteHub(id: string): Promise<void> {
    const hub = await this.getHubById(id);
    if (!hub) {
      throw new NotFoundError('Hub not found');
    }

    await prisma.hub.delete({
      where: { id },
    });
  }

  // Hub Functions operations
  async getHubFunctions(hubId: string): Promise<HubFunction[]> {
    const hub = await this.getHubById(hubId);
    if (!hub) {
      throw new NotFoundError('Hub not found');
    }

    return prisma.hubFunction.findMany({
      where: { hubId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createHubFunction(hubId: string, data: CreateHubFunctionData): Promise<HubFunction> {
    const hub = await this.getHubById(hubId);
    if (!hub) {
      throw new NotFoundError('Hub not found');
    }

    if (!data.name) {
      throw new ValidationError('Function name is required');
    }

    return prisma.hubFunction.create({
      data: {
        hubId,
        name: data.name,
        description: data.description,
        category: data.category,
      },
    });
  }

  async updateHubFunction(hubId: string, functionId: string, data: Partial<CreateHubFunctionData>): Promise<HubFunction> {
    const function_ = await prisma.hubFunction.findFirst({
      where: { id: functionId, hubId },
    });

    if (!function_) {
      throw new NotFoundError('Hub function not found');
    }

    return prisma.hubFunction.update({
      where: { id: functionId },
      data,
    });
  }

  async deleteHubFunction(hubId: string, functionId: string): Promise<void> {
    const function_ = await prisma.hubFunction.findFirst({
      where: { id: functionId, hubId },
    });

    if (!function_) {
      throw new NotFoundError('Hub function not found');
    }

    await prisma.hubFunction.delete({
      where: { id: functionId },
    });
  }

  // Hub Resources operations
  async getHubResources(hubId: string): Promise<HubResource[]> {
    const hub = await this.getHubById(hubId);
    if (!hub) {
      throw new NotFoundError('Hub not found');
    }

    return prisma.hubResource.findMany({
      where: { hubId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createHubResource(hubId: string, data: CreateHubResourceData): Promise<HubResource> {
    const hub = await this.getHubById(hubId);
    if (!hub) {
      throw new NotFoundError('Hub not found');
    }

    if (!data.title || !data.type) {
      throw new ValidationError('Title and type are required');
    }

    return prisma.hubResource.create({
      data: {
        hubId,
        title: data.title,
        type: data.type,
        url: data.url,
        description: data.description,
      },
    });
  }

  async updateHubResource(hubId: string, resourceId: string, data: Partial<CreateHubResourceData>): Promise<HubResource> {
    const resource = await prisma.hubResource.findFirst({
      where: { id: resourceId, hubId },
    });

    if (!resource) {
      throw new NotFoundError('Hub resource not found');
    }

    return prisma.hubResource.update({
      where: { id: resourceId },
      data,
    });
  }

  async deleteHubResource(hubId: string, resourceId: string): Promise<void> {
    const resource = await prisma.hubResource.findFirst({
      where: { id: resourceId, hubId },
    });

    if (!resource) {
      throw new NotFoundError('Hub resource not found');
    }

    await prisma.hubResource.delete({
      where: { id: resourceId },
    });
  }

  // Hub Notes operations
  async getHubNotes(hubId: string): Promise<HubNote[]> {
    const hub = await this.getHubById(hubId);
    if (!hub) {
      throw new NotFoundError('Hub not found');
    }

    return prisma.hubNote.findMany({
      where: { hubId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createOrUpdateHubNote(hubId: string, data: CreateHubNoteData): Promise<HubNote> {
    const hub = await this.getHubById(hubId);
    if (!hub) {
      throw new NotFoundError('Hub not found');
    }

    if (!data.content) {
      throw new ValidationError('Note content is required');
    }

    // Check if note exists
    const existingNote = await prisma.hubNote.findFirst({
      where: { hubId },
    });

    if (existingNote) {
      return prisma.hubNote.update({
        where: { id: existingNote.id },
        data: { content: data.content },
      });
    }

    return prisma.hubNote.create({
      data: {
        hubId,
        content: data.content,
      },
    });
  }

  async deleteHubNote(hubId: string, noteId: string): Promise<void> {
    const note = await prisma.hubNote.findFirst({
      where: { id: noteId, hubId },
    });

    if (!note) {
      throw new NotFoundError('Hub note not found');
    }

    await prisma.hubNote.delete({
      where: { id: noteId },
    });
  }

  // Hub Templates operations
  async getHubTemplates(hubId?: string): Promise<HubTemplate[]> {
    const where = hubId ? { hubId } : {};

    return prisma.hubTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createHubTemplate(hubId: string | undefined, data: CreateHubTemplateData): Promise<HubTemplate> {
    if (!data.name || !data.template) {
      throw new ValidationError('Name and template are required');
    }

    if (hubId) {
      const hub = await this.getHubById(hubId);
      if (!hub) {
        throw new NotFoundError('Hub not found');
      }
    }

    return prisma.hubTemplate.create({
      data: {
        hubId: hubId || null,
        name: data.name,
        description: data.description,
        template: data.template,
      },
    });
  }

  async updateHubTemplate(templateId: string, data: Partial<CreateHubTemplateData>): Promise<HubTemplate> {
    const template = await prisma.hubTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundError('Hub template not found');
    }

    return prisma.hubTemplate.update({
      where: { id: templateId },
      data,
    });
  }

  async deleteHubTemplate(templateId: string): Promise<void> {
    const template = await prisma.hubTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundError('Hub template not found');
    }

    await prisma.hubTemplate.delete({
      where: { id: templateId },
    });
  }
}

export const hubsService = new HubsService();

