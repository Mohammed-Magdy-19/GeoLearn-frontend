/**
 * src/features/dashboard/types/programTypes.ts
 *
 * TypeScript types for the program management feature.
 */

export interface AdminProgramEntry {
  id: string;
  title: string;
  description: string;
  source: string;
  source_url: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgramPayload {
  title: string;
  description?: string;
  source?: string;
  source_url?: string;
  is_published?: boolean;
}

export interface AdminProgramResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminProgramEntry[];
}

export interface PublicProgramEntry {
  id: string;
  title: string;
  description: string;
  source: string;
  source_url: string;
  created_at: string;
}
