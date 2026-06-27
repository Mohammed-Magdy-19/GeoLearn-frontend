/**
 * src/features/dashboard/types/metadataTypes.ts
 *
 * TypeScript types for the metadata management feature.
 */

export interface AdminMetadataEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  source: string;
  source_url: string;
  file: string;
  file_url: string | null;
  file_name: string;
  file_size_display: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface MetadataPayload {
  title: string;
  description?: string;
  category?: string;
  source?: string;
  source_url?: string;
  file?: File;
  is_published?: boolean;
}

export interface AdminMetadataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminMetadataEntry[];
}

export interface PublicMetadataEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  source: string;
  source_url: string;
  file_url: string | null;
  file_name: string;
  file_size_display: string;
  created_at: string;
}
