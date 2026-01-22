// src/api.ts
import axios from "axios";

export const API_BASE = "";

export interface LoginResponse {
  access_token: string;
}

export interface PredictionResponse {
  label: string;
  confidence: number;
  original_url: string;
  gradcam_url: string;
  timestamp: string;
}

export interface ScanRecord {
  id: number;
  timestamp: string;
  label: string;
  confidence: number;
  original_url: string;
  gradcam_url: string;
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
}

export async function login(email: string, password: string) {
  const res = await axios.post<LoginResponse>(
    "/auth/login",
    { email, password }
  );
  return res.data;
}



export async function predict(
  file: File,
  token: string,
  patientName: string,
  patientId: string,
  patientAge?: string,   // 👈 change number -> string
  eye?: string
): Promise<PredictionResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("patient_name", patientName);
  formData.append("patient_id", patientId);
  if (patientAge !== undefined) {
    formData.append("patient_age", patientAge);   // string is fine here
  }
  if (eye) {
    formData.append("eye", eye);
  }

  const res = await axios.post<PredictionResponse>(
    `${API_BASE}/predict?token=${token}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
}


export async function downloadReport(scanId: number, token: string) {
  const res = await axios.get(`${API_BASE}/report/${scanId}?token=${token}`, {
    responseType: "blob",
  });
  return res.data;
}


export async function fetchRecords(token: string) {
  const res = await axios.get<ScanRecord[]>(
    `${API_BASE}/records?token=${token}`
  );
  return res.data;
}
