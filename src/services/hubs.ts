import apiClient, { ApiResponse } from './api';

export interface Hub {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  specialties: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HubFunction {
  id: string;
  hubId: string;
  name: string;
  description?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HubResource {
  id: string;
  hubId: string;
  title: string;
  type: string; // "protocol" | "guideline" | "reference" | "tool" | "link"
  url?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HubNote {
  id: string;
  hubId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface HubTemplate {
  id: string;
  hubId?: string;
  name: string;
  description?: string;
  template: any;
  createdAt: string;
  updatedAt: string;
}

export interface HubTeamMember {
  id: string;
  hubId: string;
  userId: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface HubListResponse {
  data: Hub[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Hub API Service
 * Handles all hub-related API calls
 */
export const hubService = {
  /**
   * Get list of all hubs
   */
  async getHubs(params?: { page?: number; limit?: number }): Promise<ApiResponse<HubListResponse>> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    
    const response = await apiClient.get<HubListResponse>('/v1/hubs', queryParams);
    // Backend returns { data: Hub[], meta: {...} }, but our response wrapper adds another data layer
    // So response.data is { data: Hub[], meta: {...} }
    return response;
  },

  /**
   * Get single hub by ID
   */
  async getHub(id: string): Promise<ApiResponse<Hub>> {
    return apiClient.get<Hub>(`/v1/hubs/${id}`);
  },

  /**
   * Create new hub (admin only)
   */
  async createHub(data: CreateHubData): Promise<ApiResponse<Hub>> {
    return apiClient.post<Hub>('/v1/hubs', data);
  },

  /**
   * Update hub (admin only)
   */
  async updateHub(id: string, data: UpdateHubData): Promise<ApiResponse<Hub>> {
    return apiClient.put<Hub>(`/v1/hubs/${id}`, data);
  },

  /**
   * Delete hub (admin only)
   */
  async deleteHub(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/hubs/${id}`);
  },

  // Hub Functions
  async getHubFunctions(hubId: string): Promise<ApiResponse<HubFunction[]>> {
    return apiClient.get<HubFunction[]>(`/v1/hubs/${hubId}/functions`);
  },

  async createHubFunction(hubId: string, data: CreateHubFunctionData): Promise<ApiResponse<HubFunction>> {
    return apiClient.post<HubFunction>(`/v1/hubs/${hubId}/functions`, data);
  },

  async updateHubFunction(hubId: string, functionId: string, data: Partial<CreateHubFunctionData>): Promise<ApiResponse<HubFunction>> {
    return apiClient.put<HubFunction>(`/v1/hubs/${hubId}/functions/${functionId}`, data);
  },

  async deleteHubFunction(hubId: string, functionId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/hubs/${hubId}/functions/${functionId}`);
  },

  // Hub Resources
  async getHubResources(hubId: string): Promise<ApiResponse<HubResource[]>> {
    return apiClient.get<HubResource[]>(`/v1/hubs/${hubId}/resources`);
  },

  async createHubResource(hubId: string, data: CreateHubResourceData): Promise<ApiResponse<HubResource>> {
    return apiClient.post<HubResource>(`/v1/hubs/${hubId}/resources`, data);
  },

  async updateHubResource(hubId: string, resourceId: string, data: Partial<CreateHubResourceData>): Promise<ApiResponse<HubResource>> {
    return apiClient.put<HubResource>(`/v1/hubs/${hubId}/resources/${resourceId}`, data);
  },

  async deleteHubResource(hubId: string, resourceId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/hubs/${hubId}/resources/${resourceId}`);
  },

  // Hub Notes
  async getHubNotes(hubId: string): Promise<ApiResponse<HubNote[]>> {
    return apiClient.get<HubNote[]>(`/v1/hubs/${hubId}/notes`);
  },

  async createOrUpdateHubNote(hubId: string, data: CreateHubNoteData): Promise<ApiResponse<HubNote>> {
    return apiClient.post<HubNote>(`/v1/hubs/${hubId}/notes`, data);
  },

  async deleteHubNote(hubId: string, noteId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/hubs/${hubId}/notes/${noteId}`);
  },

  // Hub Templates
  async getHubTemplates(hubId: string): Promise<ApiResponse<HubTemplate[]>> {
    return apiClient.get<HubTemplate[]>(`/v1/hubs/${hubId}/templates`);
  },

  async createHubTemplate(hubId: string, data: CreateHubTemplateData): Promise<ApiResponse<HubTemplate>> {
    return apiClient.post<HubTemplate>(`/v1/hubs/${hubId}/templates`, data);
  },

  async updateHubTemplate(templateId: string, data: Partial<CreateHubTemplateData>): Promise<ApiResponse<HubTemplate>> {
    return apiClient.put<HubTemplate>(`/v1/hubs/templates/${templateId}`, data);
  },

  async deleteHubTemplate(templateId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/hubs/templates/${templateId}`);
  },
};

