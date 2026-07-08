import axios from "axios";
import { getToken } from "./auth";
import type { Document, Extraction, ExtractionListItem, Metrics, ExportFilters } from "../types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── Auth ─────────────────────────────────────────────────────────────────── */

export async function login(email: string, password: string): Promise<string> {
  const params = new URLSearchParams({ username: email, password });
  const { data } = await api.post<{ access_token: string }>("/auth/token", params);
  return data.access_token;
}

export async function generateApiKey(): Promise<string> {
  const { data } = await api.post<{ api_key: string }>("/auth/api-key");
  return data.api_key;
}

/* ── Upload ───────────────────────────────────────────────────────────────── */

export async function uploadSingle(file: File): Promise<Document> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<Document>("/upload/single", form);
  return data;
}

export async function uploadBatch(files: File[]): Promise<Document[]> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const { data } = await api.post<Document[]>("/upload/batch", form);
  return data;
}

export async function getDocumentStatus(id: string): Promise<Document> {
  const { data } = await api.get<Document>(`/upload/status/${id}`);
  return data;
}

export async function retryDocument(id: string): Promise<Document> {
  const { data } = await api.post<Document>(`/upload/retry/${id}`);
  return data;
}

/* ── Extractions ──────────────────────────────────────────────────────────── */

export async function listExtractions(
  filters?: ExportFilters,
  pagination?: { limit?: number; skip?: number }
): Promise<ExtractionListItem[]> {
  const { data } = await api.get<ExtractionListItem[]>("/extractions", {
    params: { ...filters, ...pagination },
  });
  return data;
}

export async function getExtraction(id: string): Promise<Extraction> {
  const { data } = await api.get<Extraction>(`/extractions/${id}`);
  return data;
}

export async function getExtractionByDocumentId(documentId: string): Promise<Extraction | null> {
  // List extractions and find matching document_id
  const items = await listExtractions();
  const match = items.find((i) => i.document_id === documentId);
  if (!match) return null;
  return getExtraction(match.extraction_id);
}

export async function correctField(
  extractionId: string,
  fieldName: string,
  value: unknown
): Promise<void> {
  await api.patch(`/extractions/${extractionId}/fields/${fieldName}`, { value });
}

/* ── Per-doc export ───────────────────────────────────────────────────────── */

export async function exportXlsx(extractionId: string): Promise<Blob> {
  const { data } = await api.get(`/extractions/${extractionId}/export/xlsx`, {
    responseType: "blob",
  });
  return data;
}

export async function exportCsv(extractionId: string): Promise<Blob> {
  const { data } = await api.get(`/extractions/${extractionId}/export/csv`, {
    responseType: "blob",
  });
  return data;
}

/* ── Bulk filtered export ─────────────────────────────────────────────────── */

export async function exportAllXlsx(filters?: ExportFilters): Promise<Blob> {
  const { data } = await api.get("/extractions/export/xlsx", {
    params: filters,
    responseType: "blob",
  });
  return data;
}

export async function exportAllCsv(filters?: ExportFilters): Promise<Blob> {
  const { data } = await api.get("/extractions/export/csv", {
    params: filters,
    responseType: "blob",
  });
  return data;
}

/* ── Document file download ───────────────────────────────────────────────── */

export async function downloadDocumentAsPdf(docId: string): Promise<Blob> {
  const { data } = await api.get(`/documents/${docId}/download/pdf`, { responseType: "blob" });
  return data;
}

export async function downloadDocumentAsImage(docId: string): Promise<Blob> {
  const { data } = await api.get(`/documents/${docId}/download/image`, { responseType: "blob" });
  return data;
}

/* ── Metrics ──────────────────────────────────────────────────────────────── */

export async function getMetrics(): Promise<Metrics> {
  const { data } = await api.get<Metrics>("/metrics");
  return data;
}
