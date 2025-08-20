// API utilities for communicating with the backend
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';

// Base API URL - update if your backend runs on a different port
const API_BASE_URL = 'http://localhost:3000';

// API endpoints
const ENDPOINTS = {
  UPLOAD: '/api/upload',
  SEARCH: '/api/search',
  AGENT: '/api/agent',
  PING: '/api/ping',
  TEST_EMBEDDING: '/api/test-embedding',
  TEST_LLM: '/api/test-llm',
  TEST_CURRENCY_TOOL: '/api/test-currency-tool',
  TEST_AGENT: '/api/test-agent',
};

// Error handling helper
export const handleApiError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

// Typed API response interfaces
export interface PingResponse {
  ok: boolean;
  time: number;
}

export interface UploadResponse {
  message: string;
  chunkCount: number;
  embeddings: number;
  initialQuery: string | null;
}

export interface SearchResponse {
  message: string;
  query: string;
  answer: string;
  sources: { id: number; preview: string }[];
}

export interface AgentResponse {
  message: string;
  query: string;
  answer: string;
  agentSteps: { action: string; input: string; output: string }[];
}

// File upload function
export const uploadDocument = async (file: File, query?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (query) {
    formData.append('query', query);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.UPLOAD}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload document');
    }

    return await response.json() as UploadResponse;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// Search query function
export const searchDocument = async (query: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SEARCH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to search document');
    }

    return await response.json() as SearchResponse;
  } catch (error) {
    console.error('Error searching document:', error);
    throw error;
  }
};

// Agent query function
export const queryAgent = async (query: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AGENT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to query agent');
    }

    return await response.json() as AgentResponse;
  } catch (error) {
    console.error('Error querying agent:', error);
    throw error;
  }
};

// React Query hooks
export const usePingServer = () => {
  return useQuery({
    queryKey: ['ping'],
    queryFn: async (): Promise<PingResponse> => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PING}`);
      if (!response.ok) {
        throw new Error('Server is not responding');
      }
      return response.json();
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useUploadDocument = () => {
  return useMutation({
    mutationFn: (data: { file: File; query?: string }) => 
      uploadDocument(data.file, data.query),
  });
};

export const useSearchDocument = () => {
  return useMutation({
    mutationFn: (query: string) => searchDocument(query),
  });
};

export const useQueryAgent = () => {
  return useMutation({
    mutationFn: (query: string) => queryAgent(query),
  });
};

// Export the query client for global state management
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
