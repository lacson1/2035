import apiClient, { ApiResponse } from "./api";
import {
  Hub,
  HubFunction,
  HubResource,
  HubNote,
  HubTemplate,
  HubId,
} from "../types";

export interface HubListParams {
  page?: number;
  limit?: number;
}

export interface HubFunctionPayload {
  name: string;
  description?: string;
  category?: string;
}

export interface HubResourcePayload {
  title: string;
  type: "protocol" | "guideline" | "reference" | "tool" | "link" | string;
  url?: string;
  description?: string;
}

export interface HubNotePayload {
  content: string;
}

export interface HubTemplatePayload {
  name: string;
  description?: string;
  template: Record<string, unknown>;
}

const basePath = "/v1/hubs";

const toQueryParams = (params?: HubListParams) =>
  params
    ? Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, value?.toString() ?? ""])
      )
    : undefined;

export const hubsService = {
  async getHubs(params?: HubListParams): Promise<ApiResponse<Hub[]>> {
    return apiClient.get<Hub[]>(basePath, toQueryParams(params));
  },

  async getHub(hubId: HubId): Promise<ApiResponse<Hub>> {
    return apiClient.get<Hub>(`${basePath}/${hubId}`);
  },

  // Functions
  async getHubFunctions(hubId: HubId): Promise<ApiResponse<HubFunction[]>> {
    return apiClient.get<HubFunction[]>(`${basePath}/${hubId}/functions`);
  },

  async createHubFunction(
    hubId: HubId,
    payload: HubFunctionPayload
  ): Promise<ApiResponse<HubFunction>> {
    return apiClient.post<HubFunction>(`${basePath}/${hubId}/functions`, payload);
  },

  async updateHubFunction(
    hubId: HubId,
    functionId: string,
    payload: Partial<HubFunctionPayload>
  ): Promise<ApiResponse<HubFunction>> {
    return apiClient.put<HubFunction>(
      `${basePath}/${hubId}/functions/${functionId}`,
      payload
    );
  },

  async deleteHubFunction(hubId: HubId, functionId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${basePath}/${hubId}/functions/${functionId}`);
  },

  // Resources
  async getHubResources(hubId: HubId): Promise<ApiResponse<HubResource[]>> {
    return apiClient.get<HubResource[]>(`${basePath}/${hubId}/resources`);
  },

  async createHubResource(
    hubId: HubId,
    payload: HubResourcePayload
  ): Promise<ApiResponse<HubResource>> {
    return apiClient.post<HubResource>(`${basePath}/${hubId}/resources`, payload);
  },

  async updateHubResource(
    hubId: HubId,
    resourceId: string,
    payload: Partial<HubResourcePayload>
  ): Promise<ApiResponse<HubResource>> {
    return apiClient.put<HubResource>(
      `${basePath}/${hubId}/resources/${resourceId}`,
      payload
    );
  },

  async deleteHubResource(
    hubId: HubId,
    resourceId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${basePath}/${hubId}/resources/${resourceId}`);
  },

  // Notes
  async getHubNotes(hubId: HubId): Promise<ApiResponse<HubNote[]>> {
    return apiClient.get<HubNote[]>(`${basePath}/${hubId}/notes`);
  },

  async createOrUpdateHubNote(
    hubId: HubId,
    payload: HubNotePayload
  ): Promise<ApiResponse<HubNote>> {
    return apiClient.post<HubNote>(`${basePath}/${hubId}/notes`, payload);
  },

  async deleteHubNote(
    hubId: HubId,
    noteId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${basePath}/${hubId}/notes/${noteId}`);
  },

  // Templates
  async getHubTemplates(hubId: HubId): Promise<ApiResponse<HubTemplate[]>> {
    return apiClient.get<HubTemplate[]>(`${basePath}/${hubId}/templates`);
  },

  async createHubTemplate(
    hubId: HubId,
    payload: HubTemplatePayload
  ): Promise<ApiResponse<HubTemplate>> {
    return apiClient.post<HubTemplate>(`${basePath}/${hubId}/templates`, payload);
  },

  async updateHubTemplate(
    templateId: string,
    payload: Partial<HubTemplatePayload>
  ): Promise<ApiResponse<HubTemplate>> {
    return apiClient.put<HubTemplate>(`${basePath}/templates/${templateId}`, payload);
  },

  async deleteHubTemplate(templateId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${basePath}/templates/${templateId}`);
  },
};

export default hubsService;
