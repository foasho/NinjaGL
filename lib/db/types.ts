/**
 * DBで扱うときの型を定義
 */
export type ProjectData = {
  id: number;
  name: string;
  description: string | null;
  publish: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type CreateProjectData = {
  name: string;
  description?: string;
  publish: boolean;
  userId: number;
};