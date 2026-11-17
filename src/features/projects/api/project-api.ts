import { apiClient } from '../../../core/api/api-client';

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  platform: string;
  status: 'active' | 'archived';
  page_count: number;
  home_page_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  icon?: string;
}

export interface ProjectListResponse {
  success: boolean;
  data: Project[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export const projectApi = {
  list: async (workspaceId: string, keyword?: string): Promise<Project[]> => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<{ success: boolean; data: Project[] }>(
      `/workspaces/${workspaceId}/projects${query}`,
    );
    return response.data.data ?? [];
  },

  get: async (workspaceId: string, projectId: string): Promise<Project> => {
    const response = await apiClient.get<{ success: boolean; data: Project }>(
      `/workspaces/${workspaceId}/projects/${projectId}`,
    );
    return response.data.data;
  },

  create: async (
    workspaceId: string,
    request: CreateProjectRequest,
  ): Promise<Project> => {
    const response = await apiClient.post<{ success: boolean; data: Project }>(
      `/workspaces/${workspaceId}/projects`,
      request,
    );
    return response.data.data;
  },

  update: async (
    workspaceId: string,
    projectId: string,
    request: UpdateProjectRequest,
  ): Promise<Project> => {
    const response = await apiClient.patch<{ success: boolean; data: Project }>(
      `/workspaces/${workspaceId}/projects/${projectId}`,
      request,
    );
    return response.data.data;
  },

  archive: async (workspaceId: string, projectId: string): Promise<void> => {
    await apiClient.post(
      `/workspaces/${workspaceId}/projects/${projectId}/archive`,
    );
  },

  restore: async (workspaceId: string, projectId: string): Promise<void> => {
    await apiClient.post(
      `/workspaces/${workspaceId}/projects/${projectId}/restore`,
    );
  },

  delete: async (workspaceId: string, projectId: string): Promise<void> => {
    await apiClient.delete(
      `/workspaces/${workspaceId}/projects/${projectId}`,
    );
  },
};
