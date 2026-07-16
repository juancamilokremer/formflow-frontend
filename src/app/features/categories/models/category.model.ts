export interface Category {
  id: string;
  name: string;
  color: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
  description?: string | null;
}

export interface UpdateCategoryRequest {
  name: string;
  color: string;
  description?: string | null;
}
