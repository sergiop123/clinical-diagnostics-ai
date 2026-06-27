import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://127.0.0.1:8000/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logoArea}>
          <div style={styles.logoText}>Jade Global</div>
          <div style={styles.logoSub}>Clinical Diagnostics AI</div>
        </div>
        <nav style={styles.nav}>
          <div style={styles.navItem}>🏠 Home</div>
          <div style={styles.navItem}>🖼️ Single Upload</div>
          <div style={styles.navItem}>📁 Batch Processing</div>
          <div style={styles.navItem}>📊 Dashboard</div>
        </nav>
        <div style={styles.trademark}>© 2026 Jade Global Inc.</div>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Clinical Diagnostics AI</h1>
          <p style={styles.subtitle}>
            Upload a medical image to receive AI-powered analysis
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Upload Image</h2>
          <p style={styles.cardDesc}>
            Supported formats: X-ray, CT, MRI (PNG, JPG, DICOM)
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={styles.fileInput}
          />

          {file && (
            <p style={styles.fileName}>Selected: {file.name}</p>
          )}

          <button
            onClick={handleUpload}
            style={styles.button}
            disabled={!file || loading}
          >
            {loading ? "Analyzing..." : "Analyze Image"}
          </button>
        </div>

        {result && (
          <div style={styles.resultCard}>
            <h2 style={styles.cardTitle}>Results</h2>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Filename</span>
              <span style={styles.resultValue}>{result.filename}</span>
            </div>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>File Size</span>
              <span style={styles.resultValue}>{result.size_bytes} bytes</span>
            </div>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Type</span>
              <span style={styles.resultValue}>{result.content_type}</span>
            </div>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Status</span>
              <span style={styles.resultValue}>{result.message}</span>
            </div>
          </div>
        )}

        <div style={styles.disclaimer}>
          ⚠️ For educational purposes only. Not a medical diagnosis. All results
          must be reviewed by a licensed medical professional.
        </div>
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
  nav: {
    flex: 1,
  },
  navItem: {
    color: "white",
    padding: "10px 12px",
    borderRadius: "6px",
    marginBottom: "4px",
    cursor: "pointer",
    fontSize: "14px",
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
  header: {
    marginBottom: "32px",
  },
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
  fileInput: {
    display: "block",
    marginBottom: "12px",
  },
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
  resultLabel: {
    color: "#888",
    fontSize: "14px",
  },
  resultValue: {
    color: "#1B5287",
    fontWeight: "bold",
    fontSize: "14px",
  },
  disclaimer: {
    backgroundColor: "#FFF8E6",
    border: "1px solid #FFB700",
    borderRadius: "8px",
    padding: "14px 18px",
    fontSize: "13px",
    color: "#8A6000",
  },
};

export default App;