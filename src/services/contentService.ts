import { api } from './api';

export interface GenerationJob {
  _id: string; // The Job Document ID
  jobId: string; // The UUID
  userId: string;
  prompt: string;
  contentType: 'Blog Post Outline' | 'Product Description' | 'Social Media Caption';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  generatedContent?: string;
  scheduledFor: string;
  completedAt?: string;
  createdAt: string;
  error?: string;
}

export interface SavedContent {
  _id: string;
  userId: string;
  title: string;
  type: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export const contentService = {
  // Get all generation jobs (history)
  getJobs: async () => {
    const response = await api.get<GenerationJob[]>('/generate-content');
    return response.data;
  },

  // Get specific job status
  getJobStatus: async (jobId: string) => {
    const response = await api.get<GenerationJob>(`/generate-content/${jobId}`);
    return response.data;
  },

  // Create a new generation job
  createJob: async (prompt: string, contentType: string) => {
    const response = await api.post<{ jobId: string; status: string; delaySeconds: number }>(
      '/generate-content',
      { prompt, contentType }
    );
    return response.data;
  },

  // Save completed job to library
  saveContent: async (jobId: string, title?: string) => {
    const response = await api.post<{ message: string; content: SavedContent }>(
      `/generate-content/${jobId}/save`,
      { title }
    );
    return response.data;
  },

 
  getLibrary: async (search?: string) => {
    const params = search ? { search } : {};
    const response = await api.get<SavedContent[]>('/content', { params });
    return response.data;
  },

  
  updateContent: async (id: string, data: { title?: string; type?: string; body?: string }) => {
    const response = await api.put<SavedContent>(`/content/${id}`, data);
    return response.data;
  },

  
  deleteContent: async (id: string) => {
    const response = await api.delete<{ id: string }>(`/content/${id}`);
    return response.data;
  },
};
