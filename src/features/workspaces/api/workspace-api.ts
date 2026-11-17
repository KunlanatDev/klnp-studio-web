import { apiRequest } from '../../../core/api/api-client';

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
  created_at: string;
  updated_at: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export async function listWorkspaces(): Promise<Workspace[]> {
  const result = await apiRequest<ApiResponse<Workspace[]>>('/workspaces');
  return result.data;
}

export async function createWorkspace(input: {
  name: string;
  slug: string;
}): Promise<Workspace> {
  const result = await apiRequest<ApiResponse<Workspace>>('/workspaces', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return result.data;
}

export async function getWorkspace(workspaceId: string): Promise<Workspace> {
  const result = await apiRequest<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`);
  return result.data;
}

export async function updateWorkspace(
  workspaceId: string,
  input: { name: string },
): Promise<Workspace> {
  const result = await apiRequest<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return result.data;
}
