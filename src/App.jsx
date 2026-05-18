import { useState } from "react";

const GOFILE_TOKEN = ""; // User apna token daalega

const formatSize = (bytes) => {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + " GB";
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + " MB";
  return (bytes / 1e3).toFixed(2) + " KB";
};

const getQuality = (name) => {
  if (name.includes("2160p") || name.includes("4K")) return "4K";
  if (name.includes("1080p")) return "1080p";
  if (name.includes("720p")) return "720p";
  if (name.includes("480p")) return "480p";
  if (name.includes("360p")) return "360p";
  return "Unknown";
};

const qualityColor = {
  "4K": "#f59e0b",
  "1080p": "#10b981",
  "720p": "#3b82f6",
  "480p": "#8b5cf6",
  "360p": "#ef4444",
  "Unknown": "#6b7280",
};

export default function GoFileScraper() {
  const [folderCode, setFolderCode] = useState("Ciwemx");
  const [token, setToken] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [folderName, setFolderName] = useState("");
  const [copied, setCopied] = useState({});

  const extractCode = (input) => {
    // gofile.io/d/XXXX se code nikalo
    const match = input.match(/gofile\.io\/d\/([a-zA-Z0-9]+)/);
    if (match) return match[1];
    return input.trim();
  };

  const scrape = async () => {
    setLoading(true);
    setError("");
    setFiles([]);
    setFolderName("");

    const code = extractCode(folderCode);
    // Website ka public token use karo — bina login ke kaam karta hai
    const authToken = token.trim() || "16d15cd8934ae7faf1688b21c7262cceea2cdd8f5a5fc0aa533038502b49d941";

    try {
      const res = await fetch(
        `https://api.gofile.io/contents/${code}?contentFilter=&page=1&pageSize=1000&sortField=name&sortDirection=1`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Origin: "https://gofile.io",
          },
        }
      );

      const data = await res.json();

      if (data.status !== "ok") {
        setError("❌ API ne error diya: " + (data.message || JSON.stringify(data)));
        setLoading(false);
        return;
      }

      setFolderName(data.data.name);

      const children = data.data.children || {};
      const fileList = Object.values(children).filter((f) => f.type === "file");
      setFiles(fileList);

      if (fileList.length === 0) {
        setError("⚠️ Folder mein koi file nahi mili.");
      }
    } catch (e) {
      setError("❌ Fetch failed: " + e.message + "\n\nNote: CORS error aa sakti hai browser se directly. Agar aisa ho toh neeche links manually copy karo.");
    }

    setLoading(false);
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopied((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [id]: false })), 2000);
  };

  const copyAll = () => {
    const allLinks = files.map((f) => f.link).join("\n");
    navigator.clipboard.writeText(allLinks);
  };

  const openIDM = (link) => {
    // IDM protocol
    window.open("idm:" + link, "_blank");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Courier New', monospace",
      color: "#e2e8f0",
      padding: "24px 16px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          display: "inline-block",
          background: "linear-gradient(90deg, #00d2ff, #3a7bd5)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: 28,
          fontWeight: "bold",
          letterSpacing: 2,
          marginBottom: 4,
        }}>
          ⚡ GoFile Scraper
        </div>
        <div style={{ color: "#94a3b8", fontSize: 13 }}>
          GoFile folder ke saare files ke direct download links nikalo
        </div>
      </div>

      {/* Input Box */}
      <div style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        border: "1px solid rgba(255,255,255,0.1)",
        maxWidth: 640,
        margin: "0 auto 20px",
      }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>
            🔗 GoFile URL ya Folder Code
          </label>
          <input
            value={folderCode}
            onChange={(e) => setFolderCode(e.target.value)}
            placeholder="https://gofile.io/d/Ciwemx  ya  Ciwemx"
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#e2e8f0",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>
            🔑 Account Token (optional — public folders ke liye zaroori nahin)
          </label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Bearer token (agar private folder ho)"
            type="password"
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#e2e8f0",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={scrape}
          disabled={loading}
          style={{
            width: "100%",
            background: loading
              ? "rgba(99,102,241,0.3)"
              : "linear-gradient(90deg, #6366f1, #3b82f6)",
            border: "none",
            borderRadius: 10,
            padding: "12px 0",
            color: "#fff",
            fontSize: 15,
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: 1,
            transition: "all 0.2s",
          }}
        >
          {loading ? "⏳ Scraping..." : "🚀 Links Nikalo"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.4)",
          borderRadius: 10,
          padding: "12px 16px",
          color: "#fca5a5",
          fontSize: 13,
          maxWidth: 640,
          margin: "0 auto 16px",
          whiteSpace: "pre-wrap",
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {files.length > 0 && (
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Folder Info + Copy All */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}>
            <div style={{ color: "#94a3b8", fontSize: 13 }}>
              📁 <span style={{ color: "#e2e8f0" }}>{folderName}</span> — {files.length} files
            </div>
            <button
              onClick={copyAll}
              style={{
                background: "rgba(16,185,129,0.2)",
                border: "1px solid rgba(16,185,129,0.4)",
                borderRadius: 8,
                padding: "6px 14px",
                color: "#6ee7b7",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              📋 Saare Links Copy
            </button>
          </div>

          {/* File Cards */}
          {files.map((file, i) => {
            const quality = getQuality(file.name);
            return (
              <div
                key={file.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 12,
                  transition: "all 0.2s",
                }}
              >
                {/* File Name */}
                <div style={{
                  fontSize: 12,
                  color: "#cbd5e1",
                  marginBottom: 8,
                  wordBreak: "break-all",
                  lineHeight: 1.5,
                }}>
                  <span style={{
                    background: qualityColor[quality],
                    color: "#000",
                    borderRadius: 4,
                    padding: "1px 6px",
                    fontSize: 10,
                    fontWeight: "bold",
                    marginRight: 6,
                  }}>
                    {quality}
                  </span>
                  {file.name}
                </div>

                {/* Stats */}
                <div style={{
                  display: "flex",
                  gap: 16,
                  marginBottom: 10,
                  fontSize: 11,
                  color: "#64748b",
                }}>
                  <span>📦 {formatSize(file.size)}</span>
                  <span>⬇️ {file.downloadCount} downloads</span>
                  <span>🖥️ {file.serverSelected}</span>
                </div>

                {/* Download Link */}
                <div style={{
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 10,
                  color: "#3b82f6",
                  wordBreak: "break-all",
                  marginBottom: 10,
                  fontFamily: "monospace",
                }}>
                  {file.link}
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => copyLink(file.link, file.id)}
                    style={{
                      background: copied[file.id]
                        ? "rgba(16,185,129,0.3)"
                        : "rgba(59,130,246,0.2)",
                      border: `1px solid ${copied[file.id] ? "rgba(16,185,129,0.5)" : "rgba(59,130,246,0.4)"}`,
                      borderRadius: 6,
                      padding: "6px 12px",
                      color: copied[file.id] ? "#6ee7b7" : "#93c5fd",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {copied[file.id] ? "✅ Copied!" : "📋 Link Copy"}
                  </button>

                  <a
                    href={file.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "rgba(99,102,241,0.2)",
                      border: "1px solid rgba(99,102,241,0.4)",
                      borderRadius: 6,
                      padding: "6px 12px",
                      color: "#a5b4fc",
                      fontSize: 12,
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    🌐 Browser Open
                  </a>

                  {/* IDM Link */}
                  <a
                    href={`intent:${file.link}#Intent;action=android.intent.action.VIEW;end`}
                    style={{
                      background: "rgba(245,158,11,0.2)",
                      border: "1px solid rgba(245,158,11,0.4)",
                      borderRadius: 6,
                      padding: "6px 12px",
                      color: "#fcd34d",
                      fontSize: 12,
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    ⚡ ADM/IDM
                  </a>
                </div>
              </div>
            );
          })}

          {/* All Links Text Box */}
          <div style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: 16,
            marginTop: 8,
          }}>
            <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>
              📜 Saare Links (IDM/ADM mein paste karo):
            </div>
            <textarea
              readOnly
              value={files.map((f) => f.link).join("\n")}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: "#64748b",
                fontSize: 10,
                fontFamily: "monospace",
                resize: "vertical",
                outline: "none",
                minHeight: 80,
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Note */}
          <div style={{
            background: "rgba(234,179,8,0.1)",
            border: "1px solid rgba(234,179,8,0.3)",
            borderRadius: 10,
            padding: "10px 14px",
            marginTop: 12,
            fontSize: 12,
            color: "#fde68a",
            lineHeight: 1.6,
          }}>
            ⚠️ <strong>Important:</strong> Direct browser mein link open karne se redirect hoga.<br/>
            ✅ <strong>Sahi tarika:</strong> Link copy karke <strong>IDM / ADM / 1DM</strong> mein paste karo.<br/>
            🔑 <strong>Header zaroori:</strong> Referer: https://gofile.io/ + Cookie: accountToken
          </div>
        </div>
      )}
    </div>
  );
}
