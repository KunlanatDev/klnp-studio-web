import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pageApi, CreatePageRequest, UpdatePageRequest } from '../api/page-api';

export function usePages(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: ['pages', workspaceId, projectId],
    queryFn: () => pageApi.list(workspaceId, projectId),
    enabled: Boolean(workspaceId && projectId),
  });
}

export function usePage(workspaceId: string, projectId: string, pageId: string) {
  return useQuery({
    queryKey: ['page', workspaceId, projectId, pageId],
    queryFn: () => pageApi.get(workspaceId, projectId, pageId),
    enabled: Boolean(workspaceId && projectId && pageId),
  });
}

export function useCreatePage(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePageRequest) =>
      pageApi.create(workspaceId, projectId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['usage', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['entitlements', workspaceId] });
    },
  });
}

export function useUpdatePage(workspaceId: string, projectId: string, pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdatePageRequest) =>
      pageApi.update(workspaceId, projectId, pageId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['page', workspaceId, projectId, pageId] });
    },
  });
}

export function useDeletePage(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pageId: string) => pageApi.delete(workspaceId, projectId, pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['usage', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['entitlements', workspaceId] });
    },
  });
}

export function useDuplicatePage(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pageId: string) => pageApi.duplicate(workspaceId, projectId, pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['usage', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['entitlements', workspaceId] });
    },
  });
}

export function useSetHomePage(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pageId: string) => pageApi.setHome(workspaceId, projectId, pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', workspaceId, projectId] });
    },
  });
}

export function useReorderPages(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pageIds: string[]) => pageApi.reorder(workspaceId, projectId, pageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', workspaceId, projectId] });
    },
  });
}
