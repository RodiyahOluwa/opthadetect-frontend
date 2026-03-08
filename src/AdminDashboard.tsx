// src/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { API_BASE, adminFetchAllScans, adminFetchUsers, deleteScan } from "./api";
import type { ScanRecord } from "./api";

interface User { id: number; email: string; role: string; }

interface Props {
  token: string;
  onBack: () => void;
}

export default function AdminDashboard({ token, onBack }: Props) {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<"scans" | "users">("scans");
  const [loading, setLoading] = useState(true);
  const [filterEmail, setFilterEmail] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([adminFetchAllScans(token), adminFetchUsers(token)])
      .then(([s, u]) => { setScans(s); setUsers(u); })
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently delete this scan and all associated images?")) return;
    setDeleting(id);
    await deleteScan(id, token);
    setScans((prev) => prev.filter((s) => s.id !== id));
    setDeleting(null);
  };

  const filteredScans = filterEmail
    ? scans.filter((s) => s.uploaded_by?.toLowerCase().includes(filterEmail.toLowerCase()))
    : scans;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="logo-small">OD</div>
          <div>
            <div className="admin-title">OpthaDetect Admin</div>
            <div className="admin-sub">Developer dashboard</div>
          </div>
        </div>
        <button className="btn-outline" onClick={onBack}>← Back to App</button>
      </header>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-num">{scans.length}</div>
          <div className="admin-stat-label">Total Scans</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{users.length}</div>
          <div className="admin-stat-label">Registered Users</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">
            {scans.filter(s => s.label === "DR").length}
          </div>
          <div className="admin-stat-label">DR Detections</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">
            {scans.filter(s => s.label === "NoDR").length}
          </div>
          <div className="admin-stat-label">No DR</div>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={"admin-tab" + (tab === "scans" ? " active" : "")}
          onClick={() => setTab("scans")}
        >
          All Scans ({scans.length})
        </button>
        <button
          className={"admin-tab" + (tab === "users" ? " active" : "")}
          onClick={() => setTab("users")}
        >
          Users ({users.length})
        </button>
      </div>

      {loading && <div className="admin-loading">Loading…</div>}

      {!loading && tab === "scans" && (
        <div className="admin-panel">
          <div className="admin-filter">
            <input
              placeholder="Filter by uploader email…"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
            />
            <span className="admin-count">{filteredScans.length} scans</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Thumb</th>
                  <th>Patient</th>
                  <th>Result</th>
                  <th>Conf</th>
                  <th>Eye</th>
                  <th>Timestamp</th>
                  <th>Uploaded by</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.map((scan) => (
                  <tr key={scan.id}>
                    <td className="td-id">#{scan.id}</td>
                    <td>
                      <img
                        src={`${API_BASE}${scan.gradcam_url}`}
                        className="admin-thumb"
                        alt="gradcam"
                      />
                    </td>
                    <td>
                      <div className="td-patient">
                        <span>{scan.patient_name || "—"}</span>
                        <span className="td-pid">{scan.patient_id || ""}</span>
                      </div>
                    </td>
                    <td>
                      <span className={"admin-pill " + (scan.label === "DR" ? "pill-danger" : "pill-safe")}>
                        {scan.label}
                      </span>
                    </td>
                    <td>{scan.confidence.toFixed(2)}</td>
                    <td>{scan.eye || "—"}</td>
                    <td className="td-time">{scan.timestamp}</td>
                    <td className="td-email">
                      {scan.uploaded_by || "—"}
                      {scan.deleted_by_user && (
                        <span className="deleted-badge" title="Clinician deleted this — retained for training">🗑 removed by user</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(scan.id)}
                        disabled={deleting === scan.id}
                        title="Delete scan (GDPR erasure)"
                      >
                        {deleting === scan.id ? "…" : "🗑️"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tab === "users" && (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Scans</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="td-id">#{u.id}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={"admin-role-pill " + (u.role === "admin" ? "role-admin" : "role-user")}>
                        {u.role}
                      </span>
                    </td>
                    <td>{scans.filter((s) => s.uploaded_by === u.email).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
