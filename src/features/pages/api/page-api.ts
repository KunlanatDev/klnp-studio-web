import { apiClient } from '../../../core/api/api-client';

export interface Page {
  id: string;
  project_id: string;
  workspace_id: string;
  name: string;
  slug: string;
  position: number;
  is_home: boolean;
  status: 'active' | 'archived';
  document_version: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  archived_at?: string;
}

export interface CreatePageRequest {
  name: string;
  slug?: string;
}

export interface UpdatePageRequest {
  name?: string;
  slug?: string;
}

export interface ReorderPagesRequest {
  page_ids: string[];
}

export const pageApi = {
  list: async (workspaceId: string, projectId: string): Promise<Page[]> => {
    const response = await apiClient.get<{ success: boolean; data: Page[] }>(
      `/workspaces/${workspaceId}/projects/${projectId}/pages`,
    );
    return response.data.data;
  },

  get: async (workspaceId: string, projectId: string, pageId: string): Promise<Page> => {
    const response = await apiClient.get<{ success: boolean; data: Page }>(
      `/workspaces/${workspaceId}/projects/${projectId}/pages/${pageId}`,
    );
    return response.data.data;
  },

  create: async (
    workspaceId: string,
    projectId: string,
    request: CreatePageRequest,
  ): Promise<Page> => {
    const response = await apiClient.post<{ success: boolean; data: Page }>(
      `/workspaces/${workspaceId}/projects/${projectId}/pages`,
      request,
    );
    return response.data.data;
  },

  update: async (
    workspaceId: string,
    projectId: string,
    pageId: string,
    request: UpdatePageRequest,
  ): Promise<Page> => {
    const response = await apiClient.patch<{ success: boolean; data: Page }>(
      `/workspaces/${workspaceId}/projects/${projectId}/pages/${pageId}`,
      request,
    );
    return response.data.data;
  },

  delete: async (
    workspaceId: string,
    projectId: string,
    pageId: string,
  ): Promise<void> => {
    await apiClient.delete(
      `/workspaces/${workspaceId}/projects/${projectId}/pages/${pageId}`,
    );
  },

  duplicate: async (
    workspaceId: string,
    projectId: string,
    pageId: string,
  ): Promise<Page> => {
    const response = await apiClient.post<{ success: boolean; data: Page }>(
      `/workspaces/${workspaceId}/projects/${projectId}/pages/${pageId}/duplicate`,
    );
    return response.data.data;
  },

  setHome: async (
    workspaceId: string,
    projectId: string,
    pageId: string,
  ): Promise<void> => {
    await apiClient.post(
      `/workspaces/${workspaceId}/projects/${projectId}/pages/${pageId}/home`,
    );
  },

  reorder: async (
    workspaceId: string,
    projectId: string,
    pageIds: string[],
  ): Promise<Page[]> => {
    const response = await apiClient.put<{ success: boolean; data: Page[] }>(
      `/workspaces/${workspaceId}/projects/${projectId}/pages/reorder`,
      { page_ids: pageIds },
    );
    return response.data.data;
  },

  archive: async (
    workspaceId: string,
    projectId: string,
    pageId: string,
  ): Promise<void> => {
    await apiClient.post(
      `/workspaces/${workspaceId}/projects/${projectId}/pages/${pageId}/archive`,
    );
  },

  restore: async (
    workspaceId: string,
    projectId: string,
    pageId: string,
  ): Promise<void> => {
    await apiClient.post(
      `/workspaces/${workspaceId}/projects/${projectId}/pages/${pageId}/restore`,
    );
  },
};
