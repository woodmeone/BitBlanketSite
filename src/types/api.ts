export interface Suggestion {
  id: number;
  type: 'topic' | 'article' | 'project' | 'other';
  nickname: string;
  content: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  votes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: number;
  suggestionId: number;
  voterId: string;
  createdAt: string;
}

export interface DownloadStats {
  id: number;
  softwareId: string;
  softwareName: string;
  totalDownloads: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageView {
  id: number;
  path: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
