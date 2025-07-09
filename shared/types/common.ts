import type { ComponentStatus } from 'react-daisyui/dist/types';

export interface Message {
  text: string | null;
  status: ComponentStatus | null;
}

export interface FormState {
  isLoading?: boolean;
  isPending?: boolean;
  error?: string | null;
  success?: string | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    fieldErrors?: Record<string, string[]>;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
