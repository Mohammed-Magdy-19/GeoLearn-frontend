/**
 * src/features/dashboard/types/summaryTypes.ts
 *
 * TypeScript types for the summaries management feature.
 */

/** Admin summary object returned from the API */
export interface AdminSummary {
  id: string;
  title: string;
  description: string;
  file: string;
  file_url: string | null;
  file_name: string;
  file_size_display: string;
  source: string;
  source_url: string;
  subject: string;
  is_published: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}

/** Payload for creating/updating a summary (multipart form data) */
export interface SummaryPayload {
  title: string;
  description?: string;
  file?: File;
  source?: string;
  source_url?: string;
  subject?: string;
  is_published?: boolean;
}

/** Paginated list response from the admin API */
export interface AdminSummariesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminSummary[];
}

/** Public summary (read-only) */
export interface PublicSummary {
  id: string;
  title: string;
  description: string;
  file_url: string | null;
  file_name: string;
  file_size_display: string;
  source: string;
  source_url: string;
  subject: string;
  download_count: number;
  created_at: string;
}
