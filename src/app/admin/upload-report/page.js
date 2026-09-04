"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, PrimaryButton } from "@/components/AdminPage";

const REQUIRED_COLUMNS = [
  "off_id", "off_name", "click_id", "aff_id", "event",
  "pay_to", "pay_id", "pay_amount", "pay_status", "trx_id", "order_id",
];

function parsePreviewCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    return headers.reduce((acc, h, i) => ({ ...acc, [h]: cells[i] ?? "" }), {});
  });
  return { headers, rows };
}

export default function UploadReportPage() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  function handleFile(selectedFile) {
    if (!selectedFile) return;
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(parsePreviewCsv(e.target.result));
    reader.readAsText(selectedFile);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function reset() {
    setFile(null);
    setFileName("");
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/api/admin/pay-records/import", form);
      setResult({ type: "success", ...res });
    } catch (err) {
      setResult({ type: "error", text: err.data?.message || err.message });
    } finally {
      setImporting(false);
    }
  }

  const missingColumns = preview ? REQUIRED_COLUMNS.filter((c) => !preview.headers.includes(c)) : [];

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <AdminPageHeader title="Upload Report" subtitle="Bulk-import payment records from a CSV file" />

      <AdminCard style={{ padding: 26, marginBottom: 24, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" }}>
        <div style={{ fontSize: 12.5, color: "var(--lg-ink-soft)", marginBottom: 16 }}>
          Required columns: <code style={{ fontSize: 11.5 }}>{REQUIRED_COLUMNS.join(", ")}</code>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? "var(--lg-violet)" : "var(--lg-line)"}`,
            borderRadius: "var(--lg-radius)",
            padding: "36px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "var(--lg-violet-soft)" : "var(--lg-paper-sunken)",
            transition: "border-color 160ms ease, background 160ms ease",
          }}
        >
          <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--lg-ink)" }}>
            {fileName || "Drag and drop a CSV file here, or click to select"}
          </div>
          {!fileName && <div style={{ fontSize: 12.5, color: "var(--lg-ink-faint)", marginTop: 6 }}>.csv files only, up to 2MB</div>}
        </div>

        {preview && missingColumns.length > 0 && (
          <div style={{ padding: 14, borderRadius: "var(--lg-radius-sm)", marginTop: 16, background: "var(--lg-error-soft)", color: "var(--lg-error)", fontSize: 13, fontWeight: 600 }}>
            Missing required column(s): {missingColumns.join(", ")}
          </div>
        )}

        {result && (
          <div style={{
            padding: 14, borderRadius: "var(--lg-radius-sm)", marginTop: 16,
            background: result.type === "success" ? "var(--lg-success-soft)" : "var(--lg-error-soft)",
            color: result.type === "success" ? "var(--lg-success)" : "var(--lg-error)",
            fontSize: 13, fontWeight: 600,
          }}>
            {result.type === "success" ? `Imported ${result.imported} of ${result.total} rows.` : result.text}
          </div>
        )}

        {preview && preview.rows.length > 0 && (
          <>
            <h3 style={{ fontSize: 14, fontWeight: 800, fontFamily: "var(--lg-font-display)", marginTop: 24, marginBottom: 12 }}>
              Preview ({preview.rows.length} row{preview.rows.length === 1 ? "" : "s"})
            </h3>
            <div style={{ marginBottom: 20 }}>
              <AdminTable columns={preview.headers}>
                {preview.rows.slice(0, 20).map((row, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--lg-line-soft)" }}>
                    {preview.headers.map((h) => (
                      <td key={h} style={{ padding: "10px 14px", fontSize: 12.5, whiteSpace: "nowrap" }}>{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </AdminTable>
            </div>
            {preview.rows.length > 20 && (
              <div style={{ fontSize: 12, color: "var(--lg-ink-faint)", marginBottom: 20 }}>…and {preview.rows.length - 20} more rows</div>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <PrimaryButton
                onClick={handleImport}
                disabled={importing || missingColumns.length > 0}
                style={{ borderRadius: "var(--lg-radius-pill)", background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))", boxShadow: "0 10px 20px -6px rgba(16,185,129,0.5)" }}
              >
                {importing ? "Importing…" : "Confirm Import"}
              </PrimaryButton>
              <button onClick={reset} style={{ padding: "10px 20px", borderRadius: "var(--lg-radius-pill)", border: "1.5px solid var(--lg-line)", background: "transparent", color: "var(--lg-ink-soft)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </>
        )}
      </AdminCard>
    </div>
  );
}
