// src/App.tsx
import React, { useEffect, useState } from "react";
import "./App.css";

import {
  API_BASE,
  login,
  predict,
  fetchRecords,
  downloadReport,
} from "./api";
import type { PredictionResponse, ScanRecord } from "./api";

const DEMO_EMAIL = "doctor@example.com";
const DEMO_PASS = "optha123";

function App() {
  // -------- STATE --------
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("optha_token")
  );

  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASS);
  const [showPassword, setShowPassword] = useState(false);

  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientAge, setPatientAge] = useState<string>("");
  const [eye, setEye] = useState("Left");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------- AUTH --------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingLogin(true);

    try {
      const data = await login(email, password);
      setToken(data.access_token);
      localStorage.setItem("optha_token", data.access_token);

      const records = await fetchRecords(data.access_token);
      setHistory(records);
    } catch (err: any) {
      console.error(err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setPrediction(null);
    setHistory([]);
    setPreviewUrl(null);
    setSelectedScan(null);
    localStorage.removeItem("optha_token");
  };

  // -------- UPLOAD & PREDICT --------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPrediction(null);
    setSelectedScan(null);

    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handlePredict = async () => {
    if (!file || !token) return;

    setLoadingPredict(true);
    setError(null);

    try {
      const data = await predict(
        file,
        token,
        patientName,
        patientId,
        patientAge,
        eye
      );

      setPrediction(data);
      setSelectedScan(null); // you’re looking at the “current” upload

      const records = await fetchRecords(token);
      setHistory(records);
    } catch (err: any) {
      console.error(err);
      setError(
        "Prediction failed. Ensure the backend is running and try again."
      );
    } finally {
      setLoadingPredict(false);
    }
  };

  // -------- HISTORY CLICK --------
  const handleSelectScan = (scan: ScanRecord) => {
    setSelectedScan(scan);

    // Reshape into PredictionResponse for display
    const selected: PredictionResponse = {
      label: scan.label,
      confidence: scan.confidence,
      original_url: scan.original_url,
      gradcam_url: scan.gradcam_url,
      timestamp: scan.timestamp,
      scan_id: scan.id,
      patient_name: scan.patient_name ?? undefined,
      patient_id: scan.patient_id ?? undefined,
      patient_age: scan.patient_age ?? undefined,
      eye: scan.eye ?? undefined,
    };

    setPrediction(selected);
    setPreviewUrl(`${API_BASE}${scan.original_url}`);
  };

  // -------- PDF REPORT DOWNLOAD --------
  const handleDownloadReport = async () => {
    if (!token || !prediction || !prediction.scan_id) return;

    try {
      const blob = await downloadReport(prediction.scan_id, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OpthaDetect_Report_${prediction.timestamp}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Could not download report.");
    }
  };

  // -------- INITIAL HISTORY LOAD --------
  useEffect(() => {
    const tok = localStorage.getItem("optha_token");
    if (!tok) return;

    fetchRecords(tok)
      .then((r) => setHistory(r))
      .catch((e) => console.error(e));
  }, []);

  // -------- RENDER --------
  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo">OD</div>
          <div>
            <div className="title">OpthaDetect</div>
            <div className="subtitle">
              AI-assisted retinal screening (prototype)
            </div>
          </div>
        </div>
        <div className="topbar-right">
          {token ? (
            <>
              <span className="user-tag">Clinician</span>
              <button className="btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <span className="hint">Sign in with demo credentials below</span>
          )}
        </div>
      </header>

      <main className="main">
        {/* -------- AUTH CARD -------- */}
        <section className="card auth-card">
          <h2>Clinician access</h2>
          <p className="muted">
            This demo uses a single test account. In a real deployment, this
            would be connected to your hospital identity system.
          </p>

          <form onSubmit={handleLogin} className="form">
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <label className="toggle-line">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              <span>Show password</span>
            </label>

            <button
              type="submit"
              className="btn-primary"
              disabled={loadingLogin}
            >
              {loadingLogin ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>

        {/* -------- UPLOAD CARD -------- */}
        <section className="card upload-card">
          <h2>Upload retinal fundus image</h2>
          <p className="muted">
            Upload a colour fundus photograph. OpthaDetect will classify for
            Diabetic Retinopathy and generate a Grad-CAM heatmap highlighting
            areas of interest.
          </p>

          <div className="patient-grid">
            <label className="field">
              <span>Patient name</span>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder=""
              />
            </label>
            <label className="field">
              <span>Patient ID</span>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder=""
              />
            </label>
            <label className="field">
              <span>Age</span>
              <input
                type="number"
                min={0}
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder=""
              />
            </label>
            <label className="field">
              <span>Eye</span>
              <select value={eye} onChange={(e) => setEye(e.target.value)}>
                <option value="Left">Left</option>
                <option value="Right">Right</option>
              </select>
            </label>
          </div>

          <div className="upload-area">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {previewUrl && (
              <div className="preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}
          </div>

          <button
            className="btn-primary full"
            disabled={!file || !token || loadingPredict}
            onClick={handlePredict}
          >
            {loadingPredict ? "Analysing..." : "Analyse image"}
          </button>

         { /*<p className="note">
            Images are processed on this server only. This prototype is not a
            stand-alone diagnostic tool and must be used alongside clinical
            judgment.
          </p> */}

          {error && <div className="error">{error}</div>}
        </section>

        {/* -------- RESULT CARD -------- */}
        <section className="card result-card">
          <h2>Result & Grad-CAM</h2>
          {!prediction ? (
            <p className="muted">
              After uploading a retinal image and running analysis, the
              prediction and Grad-CAM heatmap will appear here.
            </p>
          ) : (
            <div className="result">
              <div className="result-header">
                <span
                  className={
                    "pill " +
                    (prediction.label === "DR" ? "pill-danger" : "pill-safe")
                  }
                >
                  {prediction.label === "DR"
                    ? "Diabetic Retinopathy detected"
                    : "No DR detected"}
                </span>
                <span className="confidence">
                  Confidence:{" "}
                  <strong>{prediction.confidence.toFixed(2)}</strong>
                </span>
              </div>

              <div className="timestamp">{prediction.timestamp}</div>

              {(prediction.patient_name ||
                prediction.patient_id ||
                prediction.patient_age ||
                prediction.eye) && (
                <div className="patient-summary">
                  <div>
                    <strong>Patient:</strong>{" "}
                    {prediction.patient_name ?? "—"} (
                    {prediction.patient_id ?? "—"})
                  </div>
                  <div>
                    <strong>Age:</strong>{" "}
                    {prediction.patient_age ?? "—"} · <strong>Eye:</strong>{" "}
                    {prediction.eye ?? "—"}
                  </div>
                </div>
              )}

              <div className="gradcam-wrapper">
                <div className="result-actions">
                  <button
                    className="btn-outline small"
                    onClick={handleDownloadReport}
                    disabled={!prediction.scan_id || !token}
                  >
                    Download PDF report
                  </button>

                  <a
                    href={`${API_BASE}${prediction.original_url}`}
                    download={`opthadetect_${prediction.timestamp}_original.png`}
                    className="btn-outline small"
                  >
                    Download original
                  </a>
                  <a
                    href={`${API_BASE}${prediction.gradcam_url}`}
                    download={`opthadetect_${prediction.timestamp}_gradcam.png`}
                    className="btn-outline small"
                  >
                    Download Grad-CAM
                  </a>
                </div>

                <img
                  src={`${API_BASE}${prediction.gradcam_url}`}
                  alt="Grad-CAM"
                />
              </div>
            </div>
          )}
        </section>

        {/* -------- HISTORY CARD -------- */}
        <section className="card history-card">
          <h2>Recent scans</h2>
          {history.length === 0 ? (
            <p className="muted">
              Once you start analysing images, a list of recent scans with their
              labels and confidence scores will appear here.
            </p>
          ) : (
            <div className="history-list">
              {history.map((scan) => (
                <div
                  key={scan.id}
                  className={
                    "history-item" +
                    (selectedScan?.id === scan.id ? " history-item--active" : "")
                  }
                  onClick={() => handleSelectScan(scan)}
                >
                  <img
                    src={`${API_BASE}${scan.original_url}`}
                    alt="Retina"
                    className="thumb"
                  />
                  <div className="history-meta">
                    <div className="row">
                      <span className="label">
                        {scan.label === "DR" ? "DR" : "No DR"}
                      </span>
                      <span className="conf">
                        {scan.confidence.toFixed(2)}
                      </span>
                    </div>
                    <div className="time">{scan.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        OpthaDetect · Prototype ophthalmic decision-support tool. Not approved
        for independent clinical use.
      </footer>
    </div>
  );
}

export default App;
