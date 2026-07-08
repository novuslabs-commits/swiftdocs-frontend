export type DocType = "invoice" | "purchase_order" | "delivery_note" | "receipt" | "unrecognized";
export type DocStatus = "queued" | "processing" | "completed" | "failed";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_url: string | null;
  doc_type: DocType | null;
  status: DocStatus;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Extraction {
  extraction_id: string;
  document_id: string;
  filename: string | null;
  doc_type: DocType | null;
  file_url: string | null;
  fields: Record<string, unknown>;
  confidence_scores: Record<string, number>;
  overall_confidence: number | null;
  fields_found: number;
  fields_total: number;
  processing_time_ms: number | null;
  created_at: string;
}

export interface ExtractionListItem {
  document_id: string;
  filename: string;
  doc_type: DocType | null;
  status: DocStatus;
  overall_confidence: number | null;
  fields_found: number;
  fields_total: number;
  created_at: string;
  extraction_id: string;
}

export interface Metrics {
  total_documents: number;
  completed: number;
  average_confidence: number;
  average_processing_time_ms: number;
}

export interface ExportFilters {
  doc_type?: string;
  vendor?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
}
