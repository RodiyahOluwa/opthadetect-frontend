// src/App.tsx
import { useEffect, useState } from "react";
import "./App.css";
import LandingPage from "./LandingPage";
import AdminDashboard from "./AdminDashboard";

import {
  API_BASE,
  login,
  register,
  logout,
  predict,
  fetchRecords,
  downloadReport,
  deleteScan,
} from "./api";
import type { PredictionResponse, ScanRecord } from "./api";

type Page = "landing" | "app" | "admin";

function App() {
  const [page, setPage] = useState<Page>(() => {
    // If already logged in skip landing
    return localStorage.getItem("optha_token") ? "app" : "landing";
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("optha_token")
  );
  const [userRole, setUserRole] = useState<string>(() =>
    localStorage.getItem("optha_role") || "clinician"
  );

  // Auth form state
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Patient / upload state
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientAge, setPatientAge] = useState<string>("");
  const [eye, setEye] = useState("Left");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Results
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);

  // Loading / error
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // -------- AUTH --------
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoadingAuth(true);
    try {
      const data = authMode === "login"
        ? await login(email, password)
        : await register(email, password);

      setToken(data.access_token);
      setUserRole(data.role);
      localStorage.setItem("optha_token", data.access_token);
      localStorage.setItem("optha_role", data.role);

      const records = await fetchRecords(data.access_token);
      setHistory(Array.isArray(records) ? records : []);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setAuthError(
        detail
          ? String(detail)
          : authMode === "login"
          ? "Login failed. Check your credentials."
          : "Registration failed. Email may already be in use."
      );
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    if (token) await logout(token).catch(() => {});
    setToken(null);
    setUserRole("clinician");
    setPrediction(null);
    setHistory([]);
    setPreviewUrl(null);
    setSelectedScan(null);
    localStorage.removeItem("optha_token");
    localStorage.removeItem("optha_role");
  };

  // -------- UPLOAD --------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPrediction(null);
    setSelectedScan(null);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const handlePredict = async () => {
    if (!file || !token) return;
    setLoadingPredict(true);
    setError(null);
    try {
      const data = await predict(file, token, patientName, patientId, patientAge, eye);
      setPrediction(data);
      setSelectedScan(null);
      const records = await fetchRecords(token);
      setHistory(Array.isArray(records) ? records : []);
    } catch {
      setError("Prediction failed. Ensure the backend is running and try again.");
    } finally {
      setLoadingPredict(false);
    }
  };

  // -------- HISTORY --------
  const handleSelectScan = (scan: ScanRecord) => {
    setSelectedScan(scan);
    const selected: PredictionResponse = {
      label: scan.label,
      confidence: scan.confidence,
      original_url: scan.original_url,
      gradcam_url: scan.gradcam_url,
      timestamp: scan.timestamp,
      scan_id: scan.id,
      patient_name: scan.patient_name,
      patient_id: scan.patient_id,
      patient_age: scan.patient_age,
      eye: scan.eye,
    };
    setPrediction(selected);
    setPreviewUrl(`${API_BASE}${scan.original_url}`);
  };

  const handleDeleteScan = async (id: number) => {
    if (!token) return;
    if (!confirm("Permanently delete this scan and all associated images? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteScan(id, token);
      setHistory((prev) => prev.filter((s) => s.id !== id));
      if (prediction?.scan_id === id) {
        setPrediction(null);
        setPreviewUrl(null);
        setSelectedScan(null);
      }
    } catch {
      setError("Could not delete scan. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // -------- REPORT --------
  const handleDownloadReport = async () => {
    if (!token || !prediction?.scan_id) return;
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
    } catch {
      setError("Could not download report.");
    }
  };

  // -------- INITIAL LOAD --------
  useEffect(() => {
    const tok = localStorage.getItem("optha_token");
    if (!tok) return;
    fetchRecords(tok)
      .then((r) => setHistory(Array.isArray(r) ? r : []))
      .catch(console.error);
  }, []);

  // -------- ROUTING --------
  if (page === "landing") {
    return <LandingPage onEnter={() => setPage("app")} />;
  }

  if (page === "admin" && token && userRole === "admin") {
    return <AdminDashboard token={token} onBack={() => setPage("app")} />;
  }

  // -------- MAIN APP --------
  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-left">
          <button className="logo-btn" onClick={() => setPage("landing")} title="Back to home">
            <div className="logo">OD</div>
          </button>
          <div>
            <div className="title">OpthaDetect</div>
            <div className="subtitle">AI-assisted retinal screening (prototype)</div>
          </div>
        </div>
        <div className="topbar-right">
          {token ? (
            <>
              <span className="user-tag">{userRole === "admin" ? "Admin" : "Clinician"}</span>
              {userRole === "admin" && (
                <button className="btn-outline" onClick={() => setPage("admin")}>
                  Admin Dashboard
                </button>
              )}
              <button className="btn-outline" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <span className="hint">Sign in or create an account below</span>
          )}
        </div>
      </header>

      <main className="main">
        {/* AUTH CARD */}
        <section className="card auth-card">
          <h2>Clinician access</h2>
          <p className="muted">
            {authMode === "login"
              ? "Sign in to your account to access the screening tool."
              : "Create a new account. Your scans will be private to you."}
          </p>

          <div className="auth-mode-toggle">
            <button
              className={"mode-btn" + (authMode === "login" ? " active" : "")}
              onClick={() => { setAuthMode("login"); setAuthError(null); }}
            >
              Sign in
            </button>
            <button
              className={"mode-btn" + (authMode === "register" ? " active" : "")}
              onClick={() => { setAuthMode("register"); setAuthError(null); }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="form">
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                required
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
            {authError && <div className="error">{authError}</div>}
            <button type="submit" className="btn-primary" disabled={loadingAuth}>
              {loadingAuth
                ? authMode === "login" ? "Signing in…" : "Registering…"
                : authMode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          {token && (
            <div className="logged-in-notice">
              ✓ Signed in — your scans are private to your account.
            </div>
          )}
        </section>

        {/* UPLOAD CARD */}
        <section className="card upload-card">
          <h2>Upload retinal fundus image</h2>
          <p className="muted">
            Upload a colour fundus photograph. OpthaDetect will classify for
            Diabetic Retinopathy and generate a Grad-CAM heatmap.
          </p>

          <div className="patient-grid">
            <label className="field">
              <span>Patient name</span>
              <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
            </label>
            <label className="field">
              <span>Patient ID</span>
              <input type="text" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
            </label>
            <label className="field">
              <span>Age</span>
              <input type="number" min={0} value={patientAge} onChange={(e) => setPatientAge(e.target.value)} />
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
            {loadingPredict ? "Analysing…" : "Analyse image"}
          </button>
          {error && <div className="error">{error}</div>}
        </section>

        {/* RESULT CARD */}
        <section className="card result-card">
          <h2>Result &amp; Grad-CAM</h2>
          {!prediction ? (
            <p className="muted">
              After uploading a retinal image and running analysis, the
              prediction and Grad-CAM heatmap will appear here.
            </p>
          ) : (
            <div className="result">
              <div className="result-header">
                <span className={"pill " + (prediction.label === "DR" ? "pill-danger" : "pill-safe")}>
                  {prediction.label === "DR" ? "Diabetic Retinopathy detected" : "No DR detected"}
                </span>
                <span className="confidence">
                  Confidence: <strong>{prediction.confidence.toFixed(2)}</strong>
                </span>
              </div>
              <div className="timestamp">{prediction.timestamp}</div>

              {(prediction.patient_name || prediction.patient_id || prediction.patient_age || prediction.eye) && (
                <div className="patient-summary">
                  <div>
                    <strong>Patient:</strong> {prediction.patient_name ?? "—"} ({prediction.patient_id ?? "—"})
                  </div>
                  <div>
                    <strong>Age:</strong> {prediction.patient_age ?? "—"} · <strong>Eye:</strong> {prediction.eye ?? "—"}
                  </div>
                </div>
              )}

              <div className="gradcam-wrapper">
                <div className="result-actions">
                  <button className="btn-outline small" onClick={handleDownloadReport} disabled={!prediction.scan_id || !token}>
                    Download PDF report
                  </button>
                  <a href={`${API_BASE}${prediction.original_url}`} download={`opthadetect_${prediction.timestamp}_original.png`} className="btn-outline small">
                    Download original
                  </a>
                  <a href={`${API_BASE}${prediction.gradcam_url}`} download={`opthadetect_${prediction.timestamp}_gradcam.png`} className="btn-outline small">
                    Download Grad-CAM
                  </a>
                  {prediction.scan_id && (
                    <button
                      className="btn-outline small btn-delete-scan"
                      onClick={() => handleDeleteScan(prediction.scan_id!)}
                      disabled={deletingId === prediction.scan_id}
                      title="Delete this scan (GDPR right to erasure)"
                    >
                      {deletingId === prediction.scan_id ? "Deleting…" : "🗑️ Delete scan"}
                    </button>
                  )}
                </div>
                <img src={`${API_BASE}${prediction.gradcam_url}`} alt="Grad-CAM" />
              </div>
            </div>
          )}
        </section>

        {/* HISTORY CARD */}
        <section className="card history-card">
          <h2>Recent scans</h2>
          {history.length === 0 ? (
            <p className="muted">
              Once you start analysing images, a list of recent scans will appear here.
              Only your own scans are shown.
            </p>
          ) : (
            <div className="history-list">
              {(Array.isArray(history) ? history : []).map((scan) => (
                <div
                  key={scan.id}
                  className={"history-item" + (selectedScan?.id === scan.id ? " history-item--active" : "")}
                  onClick={() => handleSelectScan(scan)}
                >
                  <img src={`${API_BASE}${scan.original_url}`} alt="Retina" className="thumb" />
                  <div className="history-meta">
                    <div className="row">
                      <span className="label">{scan.label === "DR" ? "DR" : "No DR"}</span>
                      <span className="conf">{scan.confidence.toFixed(2)}</span>
                    </div>
                    <div className="time">{scan.timestamp}</div>
                    {scan.patient_name && <div className="time">{scan.patient_name}</div>}
                  </div>
                  <button
                    className="history-delete-btn"
                    onClick={(e) => { e.stopPropagation(); handleDeleteScan(scan.id); }}
                    disabled={deletingId === scan.id}
                    title="Delete scan"
                  >
                    {deletingId === scan.id ? "…" : "×"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        OpthaDetect · Prototype ophthalmic decision-support tool. Not approved for independent clinical use.
        · <a href="#" onClick={() => setPage("landing")}>Privacy Policy</a>
      </footer>
    </div>
  );
}

export default App;
