// src/api.ts
import axios from "axios";

export const API_BASE = "";

export interface LoginResponse {
  access_token: string;
  role: string;
}

export interface PredictionResponse {
  label: string;
  confidence: number;
  original_url: string;
  gradcam_url: string;
  timestamp: string;
  scan_id?: number;
  patient_name?: string;
  patient_id?: string;
  patient_age?: number;
  eye?: string;
}

export interface ScanRecord {
  id: number;
  timestamp: string;
  label: string;
  confidence: number;
  original_url: string;
  gradcam_url: string;
  patient_name?: string;
  patient_id?: string;
  patient_age?: number;
  eye?: string;
  uploaded_by?: string;
  deleted_by_user?: boolean;
}

export async function register(email: string, password: string): Promise<LoginResponse> {
  const res = await axios.post<LoginResponse>("/auth/register", { email, password });
  return res.data;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await axios.post<LoginResponse>("/auth/login", { email, password });
  return res.data;
}

export async function logout(token: string): Promise<void> {
  await axios.post(`/auth/logout?token=${token}`);
}

export async function predict(
  file: File,
  token: string,
  patientName: string,
  patientId: string,
  patientAge?: string,
  eye?: string
): Promise<PredictionResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("patient_name", patientName);
  formData.append("patient_id", patientId);
  if (patientAge !== undefined) formData.append("patient_age", patientAge);
  if (eye) formData.append("eye", eye);

  const res = await axios.post<PredictionResponse>(
    `/predict?token=${token}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
}

export async function fetchRecords(token: string): Promise<ScanRecord[]> {
  const res = await axios.get<ScanRecord[]>(`/records?token=${token}`);
  return res.data;
}

export async function deleteScan(scanId: number, token: string): Promise<void> {
  await axios.delete(`/scans/${scanId}?token=${token}`);
}

export async function downloadReport(scanId: number, token: string): Promise<Blob> {
  const res = await axios.get(`/report/${scanId}?token=${token}`, { responseType: "blob" });
  return res.data;
}

export async function adminFetchAllScans(token: string): Promise<ScanRecord[]> {
  const res = await axios.get<ScanRecord[]>(`/admin/scans?token=${token}`);
  return res.data;
}

export async function adminFetchUsers(token: string): Promise<{ id: number; email: string; role: string }[]> {
  const res = await axios.get(`/admin/users?token=${token}`);
  return res.data;
}
