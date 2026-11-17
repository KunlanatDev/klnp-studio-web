import { apiRequest } from '../../../core/api/api-client';

export type EntitlementFeature = {
  type: 'boolean' | 'configuration';
  value: unknown;
};

export type WorkspaceEntitlements = {
  workspace_id: string;
  plan: {
    code: string;
    name: string;
  };
  limits: Record<string, number>;
  features: Record<string, EntitlementFeature>;
  usage: {
    pages: {
      used: number;
      limit: number;
      remaining: number | null;
      unlimited: boolean;
    };
  };
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export async function getWorkspaceEntitlements(
  workspaceId: string,
): Promise<WorkspaceEntitlements> {
  const result = await apiRequest<ApiResponse<WorkspaceEntitlements>>(
    `/workspaces/${workspaceId}/entitlements`,
  );
  return result.data;
}

export function hasFeature(
  entitlements: WorkspaceEntitlements | null,
  key: string,
): boolean {
  if (!entitlements) return false;
  const feature = entitlements.features[key];
  return feature?.type === 'boolean' && feature.value === true;
}

export function canCreateResource(
  used: number,
  limit: number,
): boolean {
  return limit === -1 || used < limit;
}

