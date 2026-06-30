import { useState } from "react";

function App() {
  const [page, setPage] = useState("single");
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [modality, setModality] = useState("xray");
  const [result, setResult] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSingleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("modality", modality);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze-image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
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
      const response = await fetch("http://127.0.0.1:8000/batch-analyze", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setBatchResults(data);
    } catch (err) {
      setError("Could not connect to the backend. Make sure FastAPI is running.");
    }
    setLoading(false);
  };

  const ModalitySelector = () => (
    <div style={styles.modalityRow}>
      {["xray", "ct", "mri"].map((m) => (
        <button
          key={m}
          onClick={() => setModality(m)}
          style={{
            ...styles.modalityBtn,
            ...(modality === m ? styles.modalityBtnActive : {}),
          }}
        >
          {m === "xray" ? "🫁 X-Ray" : m === "ct" ? "🔬 CT Scan" : "🧠 MRI"}
        </button>
      ))}
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logoArea}>
          <div style={styles.logoText}>Jade Global</div>
          <div style={styles.logoSub}>Clinical Diagnostics AI</div>
        </div>
        <nav style={styles.nav}>
          <div
            onClick={() => setPage("home")}
            style={{
              ...styles.navItem,
              ...(page === "home" ? styles.navItemActive : {}),
            }}
          >
            🏠 Home
          </div>
          <div
            onClick={() => setPage("single")}
            style={{
              ...styles.navItem,
              ...(page === "single" ? styles.navItemActive : {}),
            }}
          >
            🖼️ Single Upload
          </div>
          <div
            onClick={() => setPage("batch")}
            style={{
              ...styles.navItem,
              ...(page === "batch" ? styles.navItemActive : {}),
            }}
          >
            📁 Batch Processing
          </div>
          <div
            onClick={() => setPage("dashboard")}
            style={{
              ...styles.navItem,
              ...(page === "dashboard" ? styles.navItemActive : {}),
            }}
          >
            📊 Dashboard
          </div>
        </nav>
        <div style={styles.trademark}>© 2026 Jade Global Inc.</div>
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
                <div style={styles.homeIcon}>🖼️</div>
                <h3 style={styles.homeCardTitle}>Single Upload</h3>
                <p style={styles.homeCardDesc}>
                  Upload one image and receive AI analysis with differential
                  diagnosis suggestions.
                </p>
              </div>
              <div style={styles.homeCard} onClick={() => setPage("batch")}>
                <div style={styles.homeIcon}>📁</div>
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
                Supported formats: X-ray, CT, MRI (PNG, JPG)
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
                <div style={styles.resultCard}>
                  <h2 style={styles.cardTitle}>Analysis Results</h2>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Filename</span>
                    <span style={styles.resultValue}>{result.filename}</span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Modality</span>
                    <span style={styles.resultValue}>{result.modality}</span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Finding</span>
                    <span style={styles.resultValue}>{result.finding}</span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Confidence</span>
                    <span style={styles.resultValue}>{result.confidence}%</span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Status</span>
                    <span style={styles.resultValue}>{result.message}</span>
                  </div>
                </div>

                <div style={styles.diagnosisCard}>
                  <h2 style={styles.cardTitle}>
                    🩺 Differential Diagnosis Suggestions
                  </h2>
                  <p style={styles.cardDesc}>
                    Based on the detected finding, the following conditions
                    should be considered by the medical team:
                  </p>
                  <ul style={styles.diagnosisList}>
                    {result.differentials.map((d, i) => (
                      <li key={i} style={styles.diagnosisItem}>
                        <span style={styles.diagnosisBullet}>→</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={styles.disclaimer}>{result.disclaimer}</div>
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
                      {batchResults.results.map((r, i) => (
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
                          <td style={styles.td}>{r.finding}</td>
                          <td style={styles.td}>{r.confidence}%</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                backgroundColor:
                                  r.status === "Success" ? "#e6f4ea" : "#fce8e6",
                                color:
                                  r.status === "Success" ? "#1e7e34" : "#c62828",
                              }}
                            >
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
              <p style={styles.subtitle}>Coming soon — upload history and analytics</p>
            </div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📊 Analytics Dashboard</h2>
              <p style={styles.cardDesc}>
                This section will display upload history, findings distribution,
                and batch results once database integration is complete.
              </p>
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
    width: "240px",
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
    backgroundColor: "rgba(255,183,0,0.2)",
    borderLeft: "3px solid #FFB700",
  },
  trademark: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "11px",
    textAlign: "center",
  },
  main: {
    marginLeft: "240px",
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
};

export default App;