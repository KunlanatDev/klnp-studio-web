import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectApi, CreateProjectRequest, UpdateProjectRequest } from '../api/project-api';

export function useProjects(workspaceId: string, keyword?: string) {
  return useQuery({
    queryKey: ['projects', workspaceId, keyword],
    queryFn: () => projectApi.list(workspaceId, keyword),
    enabled: Boolean(workspaceId),
  });
}

export function useProject(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: ['project', workspaceId, projectId],
    queryFn: () => projectApi.get(workspaceId, projectId),
    enabled: Boolean(workspaceId && projectId),
  });
}

export function useCreateProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateProjectRequest) =>
      projectApi.create(workspaceId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['entitlements', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['usage', workspaceId] });
    },
  });
}

export function useUpdateProject(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateProjectRequest) =>
      projectApi.update(workspaceId, projectId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['project', workspaceId, projectId] });
    },
  });
}

export function useArchiveProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectApi.archive(workspaceId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
}

export function useRestoreProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectApi.restore(workspaceId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
}

export function useDeleteProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectApi.delete(workspaceId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['entitlements', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['usage', workspaceId] });
    },
  });
}
