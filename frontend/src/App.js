import { useState, useEffect } from "react";

import { Home, Upload, Layers, BarChart3, Image as ImageIcon } from "lucide-react";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function App() {
  const [page, setPage] = useState("single");
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [modality, setModality] = useState("xray");
  const [result, setResult] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
  if (page === "dashboard") {
    setLoading(true);
    fetch("https://distance-uninvited-quake.ngrok-free.dev/history", {
      headers: { "ngrok-skip-browser-warning": "true" }
    })
      .then(res => res.json())
      .then(data => {
        if (data.history) {
          setHistory(data.history);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("History fetch error:", err);
        setLoading(false);
      });
  }
}, [page]);

const getConfidenceScore = (analysis) => {
  if (!analysis) return null;
  const lower = analysis.toLowerCase();
  if (lower.includes("confidence: high")) return { label: "High", score: 87, color: "#1e7e34", bg: "#e6f4ea" };
  if (lower.includes("confidence: moderate")) return { label: "Moderate", score: 62, color: "#8A6000", bg: "#FFF8E6" };
  if (lower.includes("confidence: low")) return { label: "Low", score: 28, color: "#c62828", bg: "#fce8e6" };
  return null;
};

const exportToCSV = () => {
  const headers = ["#", "Timestamp", "Filename", "Modality", "Finding"];
  const rows = history.map((h, i) => [
    i + 1,
    h.timestamp,
    h.filename,
    h.modality,
    h.finding
  ]);
  const csvContent = [headers, ...rows]
    .map(row => row.map(val => `"${val}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clinical_diagnostics_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

  const handleSingleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("modality", modality);

    try {
      const response = await fetch("https://distance-uninvited-quake.ngrok-free.dev/analyze-image", {
  method: "POST",
  body: formData,
});
      const data = await response.json();
      setResult(data);

// Extract a short finding from the full analysis for the dashboard
let shortFinding = "See full report";
if (data.analysis) {
  const lines = data.analysis.split("\n");
  for (let line of lines) {
    const clean = line.replace(/[*#]/g, "").trim();
    if (clean.length > 15 && !clean.toLowerCase().startsWith("okay")) {
      shortFinding = clean.slice(0, 70);
      break;
    }
  }
}

setHistory(prev => [...prev, {
  filename: data.filename,
  modality: data.modality,
  finding: shortFinding,
  timestamp: new Date().toLocaleString()
}]);
    } catch (err) {
      setError("Could not connect to the backend. Make sure FastAPI is running.");
    }
    setLoading(false);
  };

  const handleBatchUpload = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    setBatchResults(null);

    const formData = new FormData();
    for (let f of files) {
      formData.append("files", f);
    }
    formData.append("modality", modality);

    try {
      const response = await fetch("https://distance-uninvited-quake.ngrok-free.dev/batch-analyze", {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true"
        },
        body: formData,
      });
      const data = await response.json();
      setBatchResults(data);
      data.results.forEach(r => {
        setHistory(prev => [...prev, {
          ...r,
          timestamp: new Date().toLocaleString()
        }]);
      });
    } catch (err) {
      setError("Could not connect to the backend. Make sure FastAPI is running.");
    }
    setLoading(false);
  };

  const ModalitySelector = () => (
    <div style={styles.modalityRow}>
      <button
        onClick={() => setModality("xray")}
        style={{
          ...styles.modalityBtn,
          ...(modality === "xray" ? styles.modalityBtnActive : {}),
        }}
      >
        🫁 X-Ray
      </button>
      <button
        onClick={() => setModality("mri")}
        style={{
          ...styles.modalityBtn,
          ...(modality === "mri" ? styles.modalityBtnActive : {}),
        }}
      >
        🧠 MRI
      </button>
      <button
        onClick={() => setModality("ct")}
        style={{
          ...styles.modalityBtn,
          ...(modality === "ct" ? styles.modalityBtnActive : {}),
        }}
      >
        🔬 CT Scan
      </button>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logoArea}>
  <img 
    src="/Jade Global - Logo With TM-Reverse.png" 
    alt="Jade Global" 
    style={{width: "180px", marginBottom: "6px"}}
  />
  <div style={styles.logoSub}>Clinical Diagnostics AI</div>
</div>
        <nav style={styles.nav}>
          <div
            onClick={() => setPage("home")}
            style={{
              ...styles.navItem,
              ...(page === "home" ? styles.navItemActive : {}),
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Home size={18} /> Home
          </div>
          <div
            onClick={() => setPage("single")}
            style={{
              ...styles.navItem,
              ...(page === "single" ? styles.navItemActive : {}),
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Upload size={18} /> Single Upload
          </div>
          <div
            onClick={() => setPage("batch")}
            style={{
              ...styles.navItem,
              ...(page === "batch" ? styles.navItemActive : {}),
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Layers size={18} /> Batch Processing
          </div>
          <div
            onClick={() => setPage("dashboard")}
            style={{
              ...styles.navItem,
              ...(page === "dashboard" ? styles.navItemActive : {}),
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <BarChart3 size={18} /> Dashboard
          </div>
        </nav>
        <div style={styles.trademark}>
          <div style={{color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: "500", marginBottom: "4px", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "12px"}}>Clinical Diagnostics AI™</div>
          <div style={{color: "rgba(255,255,255,0.4)", fontSize: "10px", marginBottom: "2px"}}>© 2026 Jade Global, Inc.</div>
          <div style={{color: "rgba(255,255,255,0.4)", fontSize: "10px"}}>All rights reserved.</div>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.main}>

        {/* HOME PAGE */}
        {page === "home" && (
          <>
            <div style={styles.header}>
              <h1 style={styles.title}>Clinical Diagnostics AI</h1>
              <p style={styles.subtitle}>
                AI-powered medical image analysis for X-ray, CT, and MRI scans
              </p>
            </div>
            <div style={styles.homeGrid}>
              <div style={styles.homeCard} onClick={() => setPage("single")}>
                <div style={styles.homeIcon}><ImageIcon size={28} color="#FFB700" /></div>
                <h3 style={styles.homeCardTitle}>Single Upload</h3>
                <p style={styles.homeCardDesc}>
                  Upload one image and receive AI analysis with differential
                  diagnosis suggestions.
                </p>
              </div>
              <div style={styles.homeCard} onClick={() => setPage("batch")}>
                <div style={styles.homeIcon}><Layers size={28} color="#FFB700" /></div>
                <h3 style={styles.homeCardTitle}>Batch Processing</h3>
                <p style={styles.homeCardDesc}>
                  Upload multiple images at once and view all results in a
                  formatted table.
                </p>
              </div>
            </div>
            <div style={styles.disclaimer}>
              ⚠️ For educational purposes only. Not a medical diagnosis. All
              results must be reviewed by a licensed medical professional.
            </div>
          </>
        )}

        {/* SINGLE UPLOAD PAGE */}
        {page === "single" && (
          <>
            <div style={styles.header}>
              <h1 style={styles.title}>Single Image Upload</h1>
              <p style={styles.subtitle}>
                Upload a medical image to receive AI-powered analysis
              </p>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Upload Image</h2>
              <p style={styles.cardDesc}>
                Powered by Google MedGemma — AI radiologist analysis across X-Ray, CT, and MRI
              </p>
              <ModalitySelector />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                style={styles.fileInput}
              />
              {file && <p style={styles.fileName}>Selected: {file.name}</p>}
              <button
                onClick={handleSingleUpload}
                style={{
                  ...styles.button,
                  opacity: !file || loading ? 0.6 : 1,
                  cursor: !file || loading ? "not-allowed" : "pointer",
                }}
                disabled={!file || loading}
              >
                {loading ? "Analyzing..." : "Analyze Image"}
              </button>
            </div>

            {error && <div style={styles.errorCard}>❌ {error}</div>}

            {result && (
              <>
                <div style={styles.diagnosisCard}>
                  <h2 style={styles.cardTitle}>
                    🩺 AI Radiologist Report (MedGemma)
                  </h2>
                  <p style={styles.cardDesc}>
                    Powered by Google MedGemma — analysis across X-ray, CT, and MRI
                  </p>
                  {(() => {
                    const conf = getConfidenceScore(result.analysis);
                    console.log("Conf:", conf);
                    return conf ? (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        background: conf.bg,
                        borderRadius: "8px",
                        marginBottom: "12px",
                        border: `1px solid ${conf.color}`
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "12px", color: conf.color, fontWeight: "600", marginBottom: "4px" }}>
                            AI CONFIDENCE SCORE
                          </div>
                          <div style={{ height: "8px", background: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${conf.score}%`, height: "100%", background: conf.color, borderRadius: "4px", transition: "width 0.5s ease" }} />
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "24px", fontWeight: "bold", color: conf.color }}>{conf.score}%</div>
                          <div style={{ fontSize: "12px", color: conf.color }}>{conf.label}</div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                  <div style={{ marginTop: "12px" }}>
  {result.analysis && result.analysis.split("\n").filter(line => line.trim()).map((line, i) => {
    const isKeyFinding = line.toLowerCase().includes("key finding");
    const isConfidence = line.toLowerCase().includes("confidence");
    const isDiagnosis = /^\d+\./.test(line.trim());
    const isDiagnosesHeader = line.toLowerCase().includes("diagnoses");

    if (isKeyFinding) return (
      <div key={i} style={{ background: "#EBF4FF", borderLeft: "4px solid #1B5287", padding: "10px 14px", borderRadius: "6px", marginBottom: "10px", fontSize: "14px", color: "#1B5287", fontWeight: "500" }}>
        🔍 {line}
      </div>
    );
    if (isConfidence) return null;
    if (isDiagnosesHeader) return (
      <div key={i} style={{ fontSize: "13px", fontWeight: "600", color: "#1B5287", marginBottom: "6px", marginTop: "4px" }}>
        {line}
      </div>
    );
    if (isDiagnosis) return (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "#f9f9f9", borderRadius: "6px", marginBottom: "6px", fontSize: "13px", color: "#333" }}>
        <span style={{ color: "#FFB700", fontWeight: "bold", fontSize: "16px" }}>→</span>
        {line}
      </div>
    );
    return (
      <div key={i} style={{ fontSize: "13px", color: "#555", marginBottom: "6px", paddingLeft: "4px" }}>
        {line}
      </div>
    );
  })}
                  </div>
                </div>

                <div style={styles.disclaimer}>
                  ⚠️ For educational purposes only. Not a medical diagnosis. All results must be reviewed by a licensed medical professional.
                </div>
              </>
            )}

            {!result && (
              <div style={styles.disclaimer}>
                ⚠️ For educational purposes only. Not a medical diagnosis. All
                results must be reviewed by a licensed medical professional.
              </div>
            )}
          </>
        )}

        {/* BATCH PROCESSING PAGE */}
        {page === "batch" && (
          <>
            <div style={styles.header}>
              <h1 style={styles.title}>Batch Processing</h1>
              <p style={styles.subtitle}>
                Upload multiple images at once and view all results in a table
              </p>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Upload Multiple Images</h2>
              <p style={styles.cardDesc}>
                Select multiple images at once using Ctrl+Click or Shift+Click
              </p>
              <ModalitySelector />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
                style={styles.fileInput}
              />
              {files.length > 0 && (
                <p style={styles.fileName}>
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                </p>
              )}
              <button
                onClick={handleBatchUpload}
                style={{
                  ...styles.button,
                  opacity: files.length === 0 || loading ? 0.6 : 1,
                  cursor: files.length === 0 || loading ? "not-allowed" : "pointer",
                }}
                disabled={files.length === 0 || loading}
              >
                {loading ? `Analyzing ${files.length} images...` : "Run Batch Analysis"}
              </button>
            </div>

            {error && <div style={styles.errorCard}>❌ {error}</div>}

            {batchResults && (
              <div style={styles.resultCard}>
                <h2 style={styles.cardTitle}>
                  Batch Results — {batchResults.total} images processed
                </h2>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>Filename</th>
                        <th style={styles.th}>Modality</th>
                        <th style={styles.th}>Finding</th>
                        <th style={styles.th}>Confidence</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(batchResults.results || []).map((r, i) => (
                        <tr
                          key={i}
                          style={{
                            ...styles.tableRow,
                            backgroundColor: i % 2 === 0 ? "#f9f9f9" : "white",
                          }}
                        >
                          <td style={styles.td}>{i + 1}</td>
                          <td style={styles.td}>{r.filename}</td>
                          <td style={styles.td}>{r.modality}</td>
                          <td style={styles.td}>
                            <div>{r.finding}</div>
                            {r.analysis && (
                              <div style={{ fontSize: "11px", color: "#888", marginTop: "4px", fontStyle: "italic" }}>
                                {r.analysis.split("\n").filter(l => l.trim()).slice(0, 3).join(" · ")}
                              </div>
                            )}
                          </td>
                          <td style={styles.td}>
                            {r.confidence && (
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "500",
                                backgroundColor: r.confidence === "High" ? "#e6f4ea" : r.confidence === "Low" ? "#fce8e6" : "#FFF8E6",
                                color: r.confidence === "High" ? "#1e7e34" : r.confidence === "Low" ? "#c62828" : "#8A6000"
                              }}>
                                {r.confidence}
                              </span>
                            )}
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: r.status === "Success" ? "#e6f4ea" : "#fce8e6",
                              color: r.status === "Success" ? "#1e7e34" : "#c62828",
                            }}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ ...styles.disclaimer, marginTop: "16px" }}>
                  {batchResults.disclaimer}
                </div>
              </div>
            )}

            {!batchResults && (
              <div style={styles.disclaimer}>
                ⚠️ For educational purposes only. Not a medical diagnosis. All
                results must be reviewed by a licensed medical professional.
              </div>
            )}
          </>
        )}

        {/* DASHBOARD PAGE */}
        {page === "dashboard" && (
          <>
            <div style={styles.header}>
              <h1 style={styles.title}>Dashboard</h1>
              <p style={styles.subtitle}>
                {loading ? "Loading from Snowflake..." : `${history.length} image${history.length !== 1 ? "s" : ""} analyzed — powered by Snowflake`}
              </p>
            </div>

            {/* Metric cards */}
            <div style={styles.metricsRow}>
              <div style={styles.metricCard}>
                <div style={styles.metricNumber}>{history.length}</div>
                <div style={styles.metricLabel}>Total Analyzed</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricNumber}>
                  {history.filter(h => h.modality === "XRAY").length}
                </div>
                
                <div style={styles.metricLabel}>X-Rays</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricNumber}>
                  {history.filter(h => h.modality === "MRI").length}
                </div>
                <div style={styles.metricLabel}>MRIs</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricNumber}>
                  {history.filter(h => h.modality === "CT").length}
                </div>
                <div style={styles.metricLabel}>CT Scans</div>
              </div>
            </div>
            {history.length > 0 && (
              <div style={styles.resultCard}>
                <h2 style={styles.cardTitle}>Analysis by Modality</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      { modality: "X-Ray", count: history.filter(h => h.modality === "XRAY").length },
                      { modality: "MRI", count: history.filter(h => h.modality === "MRI").length },
                      { modality: "CT Scan", count: history.filter(h => h.modality === "CT").length },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="modality" tick={{ fontSize: 13, fill: "#1B5287", fontWeight: 500 }} />
                    <YAxis tick={{ fontSize: 12, fill: "#888" }} allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [value, "Analyses"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }}
                    />
                    <Bar dataKey="count" fill="#1B5287" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* History table */}
            {history.length > 0 ? (
              <div style={styles.resultCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
  <h2 style={styles.cardTitle}>Analysis History</h2>
  <button
    onClick={exportToCSV}
    style={{
      padding: "8px 16px",
      backgroundColor: "#FFB700",
      color: "#1B5287",
      border: "none",
      borderRadius: "8px",
      fontWeight: "bold",
      fontSize: "13px",
      cursor: "pointer",
    }}
  >
    ⬇ Export CSV
  </button>
</div>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>Timestamp</th>
                        <th style={styles.th}>Filename</th>
                        <th style={styles.th}>Modality</th>
                        <th style={styles.th}>Finding</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => (
                        <tr
                          key={i}
                          style={{
                            ...styles.tableRow,
                            backgroundColor: i % 2 === 0 ? "#f9f9f9" : "white",
                          }}
                        >
                          <td style={styles.td}>{i + 1}</td>
                          <td style={styles.td}>{h.timestamp}</td>
                          <td style={styles.td}>{h.filename}</td>
                          <td style={styles.td}>{h.modality}</td>
                          <td style={styles.td}>{h.finding}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>📊 No data yet</h2>
                <p style={styles.cardDesc}>
                  Analyze images using Single Upload or Batch Processing and
                  results will appear here automatically.
                </p>
              </div>
            )}

            <div style={styles.disclaimer}>
              ⚠️ Analysis history powered by Snowflake. For educational purposes only — not a medical diagnosis.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f6f9",
  },
  sidebar: {
    width: "260px",
    backgroundColor: "#1B5287",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    position: "fixed",
    height: "100vh",
  },
  logoArea: {
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    paddingBottom: "20px",
    marginBottom: "24px",
  },
  logoText: {
    color: "#FFB700",
    fontSize: "20px",
    fontWeight: "bold",
  },
  logoSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "12px",
    marginTop: "4px",
  },
  nav: { flex: 1 },
  navItem: {
    color: "white",
    padding: "10px 12px",
    borderRadius: "6px",
    marginBottom: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  navItemActive: {
    backgroundColor: "#FFB700",
    color: "#1B5287",
    fontWeight: "500",
  },
navIcon: {
    marginRight: "8px",
    fontSize: "14px",
  },
  trademark: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "11px",
    textAlign: "center",
    paddingBottom: "8px",
  },
  main: {
    marginLeft: "260px",
    padding: "40px",
    flex: 1,
  },
  header: { marginBottom: "32px" },
  title: {
    fontSize: "28px",
    color: "#1B5287",
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#666",
    fontSize: "15px",
    margin: 0,
  },
  homeGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "24px",
  },
  homeCard: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "28px",
    borderTop: "4px solid #FFB700",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    cursor: "pointer",
  },
  homeIcon: { fontSize: "32px", marginBottom: "12px" },
  homeCardTitle: {
    fontSize: "18px",
    color: "#1B5287",
    margin: "0 0 8px 0",
  },
  homeCardDesc: {
    color: "#666",
    fontSize: "13px",
    lineHeight: "1.5",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "28px",
    marginBottom: "24px",
    borderTop: "4px solid #FFB700",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    fontSize: "18px",
    color: "#1B5287",
    margin: "0 0 8px 0",
  },
  cardDesc: {
    color: "#888",
    fontSize: "13px",
    marginBottom: "20px",
  },
  modalityRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  modalityBtn: {
    padding: "8px 18px",
    borderRadius: "6px",
    border: "2px solid #1B5287",
    backgroundColor: "white",
    color: "#1B5287",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  modalityBtnActive: {
    backgroundColor: "#1B5287",
    color: "white",
  },
  fileInput: { display: "block", marginBottom: "12px" },
  fileName: {
    fontSize: "13px",
    color: "#555",
    marginBottom: "16px",
  },
  button: {
    backgroundColor: "#FFB700",
    color: "#1B5287",
    border: "none",
    padding: "12px 28px",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  errorCard: {
    backgroundColor: "#fff0f0",
    border: "1px solid #ff4444",
    borderRadius: "8px",
    padding: "14px 18px",
    fontSize: "13px",
    color: "#cc0000",
    marginBottom: "24px",
  },
  resultCard: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "28px",
    marginBottom: "24px",
    borderTop: "4px solid #1B5287",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  resultRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  resultLabel: { color: "#888", fontSize: "14px" },
  resultValue: {
    color: "#1B5287",
    fontWeight: "bold",
    fontSize: "14px",
  },
  diagnosisCard: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "28px",
    marginBottom: "24px",
    borderTop: "4px solid #FFB700",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  diagnosisList: { listStyle: "none", padding: 0, margin: 0 },
  diagnosisItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "14px",
    color: "#333",
  },
  diagnosisBullet: {
    color: "#FFB700",
    fontWeight: "bold",
    fontSize: "16px",
  },
  tableWrapper: { overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  tableHeader: {
    backgroundColor: "#1B5287",
    color: "white",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "500",
  },
  tableRow: { borderBottom: "1px solid #f0f0f0" },
  td: {
    padding: "12px 16px",
    color: "#333",
  },
  statusBadge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  disclaimer: {
    backgroundColor: "#FFF8E6",
    border: "1px solid #FFB700",
    borderRadius: "8px",
    padding: "14px 18px",
    fontSize: "13px",
    color: "#8A6000",
    marginBottom: "24px",
  },
  metricsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: "16px",
    marginBottom: "24px",
  },
  metricCard: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "24px",
    textAlign: "center",
    borderTop: "4px solid #FFB700",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  metricNumber: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#1B5287",
    marginBottom: "8px",
  },
  metricLabel: {
    fontSize: "13px",
    color: "#888",
  },
};

export default App;