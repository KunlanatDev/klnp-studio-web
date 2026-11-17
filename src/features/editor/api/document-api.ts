import { apiClient } from '../../../core/api/api-client';
import type { KLNPDocument } from '@klnp/contracts';

export interface PageDocumentEnvelope {
  page_id: string;
  revision: number;
  document: KLNPDocument;
  updated_by?: string;
  updated_at: string;
}

export interface PatchResultEnvelope {
  page_id: string;
  revision: number;
  updated_at: string;
}

const LOCAL_CACHE_PREFIX = 'klnp_doc_cache_';

export const documentApi = {
  get: async (
    workspaceId: string,
    projectId: string,
    pageId: string
  ): Promise<PageDocumentEnvelope | null> => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: PageDocumentEnvelope;
      }>(`/workspaces/${workspaceId}/projects/${projectId}/pages/${pageId}/document`);
      const data = response.data.data;
      if (data && data.document && Object.keys(data.document.nodes || {}).length > 0) {
        return data;
      }
    } catch {
      // Fallback to localStorage cache if backend is offline or unauthenticated
    }

    const raw = localStorage.getItem(`${LOCAL_CACHE_PREFIX}${pageId}`);
    if (raw) {
      try {
        return JSON.parse(raw) as PageDocumentEnvelope;
      } catch {
        return null;
      }
    }
    return null;
  },

  save: async (
    workspaceId: string,
    projectId: string,
    pageId: string,
    baseRevision: number,
    document: KLNPDocument
  ): Promise<number> => {
    const localEnvelope: PageDocumentEnvelope = {
      page_id: pageId,
      revision: baseRevision + 1,
      document,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(`${LOCAL_CACHE_PREFIX}${pageId}`, JSON.stringify(localEnvelope));

    if (!workspaceId || !projectId || !pageId) {
      return baseRevision + 1;
    }

    const patch = [
      {
        op: 'replace',
        path: '',
        value: document,
      },
    ];

    const response = await apiClient.patch<{
      success: boolean;
      data: PatchResultEnvelope;
    }>(`/workspaces/${workspaceId}/projects/${projectId}/pages/${pageId}/document`, {
      base_revision: baseRevision,
      patch,
    });

    const newRev = response.data.data.revision;
    localStorage.setItem(
      `${LOCAL_CACHE_PREFIX}${pageId}`,
      JSON.stringify({ ...localEnvelope, revision: newRev })
    );
    return newRev;
  },
};

