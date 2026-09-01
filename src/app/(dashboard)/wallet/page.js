"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import Loader from "@/components/Loader";
import { Pagination } from "@/components/AdminPage";

const STATUS_STYLE = {
  success: { bg: "var(--lg-success-soft)", text: "var(--lg-success)" },
  processing: { bg: "var(--lg-info-soft)", text: "var(--lg-info)" },
  pending: { bg: "var(--lg-warning-soft)", text: "var(--lg-warning)" },
  failed: { bg: "var(--lg-error-soft)", text: "var(--lg-error)" },
};

function Toast({ toast, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      style={{
        padding: "12px 20px",
        borderRadius: "var(--lg-radius-sm)",
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        boxShadow: "var(--lg-shadow-lg)",
        background: toast.type === "error" ? "var(--lg-error)" : "var(--lg-success)",
      }}
    >
      {toast.message}
    </div>
  );
}

function WithdrawModal({ balance, onClose, onSuccess, pushToast }) {
  const [type, setType] = useState("bank");
  const [upiId, setUpiId] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const amt = Number(amount);

    if (!amount || amt < 1 || amt > 50000) return pushToast("error", "Amount must be between ₹1 and ₹50,000");
    if (type === "upi") {
      if (!upiId) return pushToast("error", "UPI ID is required");
      if (!upiId.includes("@") || upiId.length < 5) return pushToast("error", "Invalid UPI ID format");
    } else {
      if (!accountNo || !ifscCode) return pushToast("error", "Account number and IFSC are required");
      if (!/^[0-9]{9,18}$/.test(accountNo)) return pushToast("error", "Invalid account number");
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) return pushToast("error", "Invalid IFSC code");
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/wallet/withdraw", {
        type,
        amount: amt,
        upiId: type === "upi" ? upiId : undefined,
        accountNo: type === "bank" ? accountNo : undefined,
        ifscCode: type === "bank" ? ifscCode.toUpperCase() : undefined,
      });
      pushToast("success", res.status === "Processing" ? "Withdrawal is processing." : "Withdrawal request submitted.");
      onSuccess(res.balance);
    } catch (err) {
      pushToast("error", err.data?.message || err.message || "Withdrawal failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div 
        style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(9, 13, 22, 0.65)", backdropFilter: "blur(6px)" }} 
        onClick={onClose} 
      />
      <div 
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          width: "90%",
          maxWidth: 440,
          background: "var(--lg-paper-raised)",
          borderRadius: "var(--lg-radius)",
          border: "1px solid var(--lg-line)",
          boxShadow: "var(--lg-shadow-lg)",
          padding: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Request Withdrawal</h2>
          <button onClick={onClose} style={{ background: "var(--lg-paper-sunken)", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", color: "var(--lg-ink-soft)" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => setType("bank")}
              style={{
                padding: 12,
                borderRadius: "var(--lg-radius-sm)",
                border: `2px solid ${type === "bank" ? "var(--lg-violet)" : "var(--lg-line)"}`,
                background: type === "bank" ? "var(--lg-violet-soft)" : "var(--lg-paper-sunken)",
                color: type === "bank" ? "var(--lg-violet)" : "var(--lg-ink-soft)",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer"
              }}
            >
              🏦 Bank Transfer
            </button>
            <button
              type="button"
              onClick={() => setType("upi")}
              style={{
                padding: 12,
                borderRadius: "var(--lg-radius-sm)",
                border: `2px solid ${type === "upi" ? "var(--lg-violet)" : "var(--lg-line)"}`,
                background: type === "upi" ? "var(--lg-violet-soft)" : "var(--lg-paper-sunken)",
                color: type === "upi" ? "var(--lg-violet)" : "var(--lg-ink-soft)",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer"
              }}
            >
              ⚡ UPI Payment
            </button>
          </div>

          {type === "upi" ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--lg-ink-soft)", marginBottom: 6 }}>UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="name@okaxis"
                required
                pattern=".*@.*"
                title="Enter a valid UPI ID (must contain @)"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--lg-radius-sm)", border: "1px solid var(--lg-line)", background: "var(--lg-paper-sunken)", fontSize: 13.5, color: "var(--lg-ink)", outline: "none" }}
              />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--lg-ink-soft)", marginBottom: 6 }}>Account Number</label>
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  placeholder="Enter Account Number"
                  required
                  pattern="[0-9]{9,18}"
                  title="Enter a valid account number (9-18 digits)"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--lg-radius-sm)", border: "1px solid var(--lg-line)", background: "var(--lg-paper-sunken)", fontSize: 13.5, color: "var(--lg-ink)", outline: "none" }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--lg-ink-soft)", marginBottom: 6 }}>IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="Enter IFSC Code"
                  required
                  pattern="[A-Z]{4}0[A-Z0-9]{6}"
                  maxLength={11}
                  title="Enter a valid IFSC code (e.g. HDFC0001234)"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--lg-radius-sm)", border: "1px solid var(--lg-line)", background: "var(--lg-paper-sunken)", fontSize: 13.5, color: "var(--lg-ink)", outline: "none" }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--lg-ink-soft)", marginBottom: 6 }}>Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max="50000"
              required
              style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--lg-radius-sm)", border: "1px solid var(--lg-line)", background: "var(--lg-paper-sunken)", fontSize: 13.5, color: "var(--lg-ink)", outline: "none" }}
            />
            <span style={{ fontSize: 12, color: "var(--lg-ink-soft)", marginTop: 6, display: "block" }}>Available: <strong>₹{balance.toFixed(2)}</strong></span>
          </div>

          <button
            type="submit"
            disabled={!amount || submitting}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "var(--lg-radius-pill)",
              border: "none",
              background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))",
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(99, 102, 241, 0.4)",
              opacity: !amount || submitting ? 0.6 : 1
            }}
          >
            {submitting ? "Processing..." : "Submit Withdrawal"}
          </button>
        </form>
      </div>
    </>
  );
}

function RedeemCodeCard({ onRedeemed, pushToast }) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/api/redeem", { code: code.trim().toUpperCase() });
      pushToast("success", `₹${res.value} credited to your wallet!`);
      setCode("");
      onRedeemed(res.newBalance);
    } catch (err) {
      pushToast("error", err.data?.message || err.message || "Failed to redeem code");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: "var(--lg-paper-raised)", borderRadius: "var(--lg-radius)", border: "1px solid var(--lg-line)", padding: 24, boxShadow: "var(--lg-shadow-md)" }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 12px 0", color: "var(--lg-ink)", fontFamily: "var(--lg-font-display)" }}>🎁 Redeem Promo Code</h3>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12 }}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ENTER GIFT CODE"
          style={{ flex: 1, padding: "12px 18px", borderRadius: "var(--lg-radius-pill)", border: "1px solid var(--lg-line)", background: "var(--lg-paper-sunken)", fontSize: 13.5, fontWeight: 700, textTransform: "uppercase", color: "var(--lg-ink)", outline: "none" }}
        />
        <button
          type="submit"
          disabled={submitting || !code.trim()}
          style={{ background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))", color: "#fff", border: "none", borderRadius: "var(--lg-radius-pill)", padding: "12px 24px", fontSize: 13.5, fontWeight: 800, cursor: "pointer", opacity: submitting || !code.trim() ? 0.6 : 1, boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)" }}
        >
          {submitting ? "Redeeming..." : "Redeem"}
        </button>
      </form>
    </div>
  );
}

export default function WalletPage() {
  const [summary, setSummary] = useState(null);
  const [txData, setTxData] = useState(null);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  function pushToast(type, message) {
    setToasts((t) => [...t, { id: Date.now() + Math.random(), type, message }]);
  }

  useEffect(() => {
    api.get("/api/wallet").then(setSummary).catch(() => setSummary(null));
  }, []);

  useEffect(() => {
    api.get(`/api/wallet/transactions?page=${page}`).then(setTxData).catch(() => setTxData(null));
  }, [page]);

  function refreshTransactions() {
    api.get(`/api/wallet/transactions?page=${page}`).then(setTxData).catch(() => {});
  }

  if (!summary) return <Loader style={{ padding: 40, color: "var(--lg-violet)" }} />;

  const balanceInt = Math.floor(summary.balance);
  const balanceCents = Math.round((summary.balance - balanceInt) * 100);

  return (
    <div className="wallet-page-root">
      <div style={{ marginBottom: 28 }}>
        <h1 className="dashboard-welcome-title">Wallet & Payouts</h1>
        <p style={{ color: "var(--lg-ink-soft)", fontSize: 14, marginTop: 4 }}>Manage available earnings and withdraw directly to your account</p>
      </div>

      {/* Main Balance Hero Card */}
      <div 
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)",
          borderRadius: "var(--lg-radius-lg)",
          padding: "28px 24px",
          color: "#ffffff",
          boxShadow: "0 20px 40px -10px rgba(99, 102, 241, 0.4)",
          position: "relative",
          overflow: "hidden",
          marginBottom: 28
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255, 255, 255, 0.8)" }}>Available Balance</span>
            <p className="wallet-balance-amount">
              ₹{balanceInt.toLocaleString("en-IN")}.<span style={{ fontSize: "0.65em", opacity: 0.85 }}>{String(balanceCents).padStart(2, "0")}</span>
            </p>

            <button
              onClick={() => setModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#ffffff",
                color: "#4f46e5",
                padding: "12px 24px",
                borderRadius: "var(--lg-radius-pill)",
                border: "none",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)"
              }}
            >
              ⚡ Withdraw Funds
            </button>
          </div>

          <div className="wallet-stats-col">
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255, 255, 255, 0.7)" }}>Total Earned</span>
              <p style={{ fontSize: 20, fontWeight: 800, margin: "2px 0 0 0", fontFamily: "var(--lg-font-display)" }}>₹{summary.totalEarned.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255, 255, 255, 0.7)" }}>Total Withdrawn</span>
              <p style={{ fontSize: 20, fontWeight: 800, margin: "2px 0 0 0", fontFamily: "var(--lg-font-display)" }}>₹{summary.totalWithdrawn.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <RedeemCodeCard
          pushToast={pushToast}
          onRedeemed={(newBalance) => {
            setSummary((s) => ({ ...s, balance: newBalance }));
            refreshTransactions();
          }}
        />
      </div>

      {/* Transaction History */}
      <div style={{ background: "var(--lg-paper-raised)", borderRadius: "var(--lg-radius)", border: "1px solid var(--lg-line)", boxShadow: "var(--lg-shadow-md)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--lg-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Transaction History</h3>
          <span style={{ fontSize: 12, fontWeight: 700, background: "var(--lg-violet-soft)", color: "var(--lg-violet)", padding: "4px 12px", borderRadius: "var(--lg-radius-pill)" }}>{txData?.totalRecords ?? 0} Records</span>
        </div>

        <div className="lg-table-scroll" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ background: "var(--lg-paper-sunken)", borderBottom: "1px solid var(--lg-line)", textAlign: "left" }}>
                <th style={{ padding: "14px 24px", fontSize: 11, fontWeight: 800, color: "var(--lg-ink-soft)", textTransform: "uppercase" }}>#</th>
                <th style={{ padding: "14px 24px", fontSize: 11, fontWeight: 800, color: "var(--lg-ink-soft)", textTransform: "uppercase" }}>Type & Description</th>
                <th style={{ padding: "14px 24px", fontSize: 11, fontWeight: 800, color: "var(--lg-ink-soft)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "14px 24px", fontSize: 11, fontWeight: 800, color: "var(--lg-ink-soft)", textTransform: "uppercase" }}>Amount</th>
                <th style={{ padding: "14px 24px", fontSize: 11, fontWeight: 800, color: "var(--lg-ink-soft)", textTransform: "uppercase", textAlign: "right" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {!txData ? (
                <tr><td colSpan="5" style={{ padding: 32, textAlign: "center" }}><Loader /></td></tr>
              ) : txData.transactions.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: 40, textAlign: "center", color: "var(--lg-ink-soft)", fontSize: 13 }}>No transactions found.</td></tr>
              ) : (
                txData.transactions.map((tx, i) => {
                  const style = STATUS_STYLE[tx.status?.toLowerCase()] || STATUS_STYLE.pending;
                  return (
                    <tr key={tx.id} style={{ borderBottom: "1px solid var(--lg-line)" }}>
                      <td style={{ padding: "14px 24px", fontSize: 13, color: "var(--lg-ink-faint)", fontWeight: 600 }}>{(page - 1) * 10 + i + 1}</td>
                      <td style={{ padding: "14px 24px", fontSize: 13.5, fontWeight: 700, color: "var(--lg-ink)", textTransform: "capitalize" }}>{tx.type} — {tx.comment}</td>
                      <td style={{ padding: "14px 24px" }}>
                        <span style={{ display: "inline-flex", padding: "4px 12px", borderRadius: "var(--lg-radius-pill)", background: style.bg, color: style.text, fontSize: 11, fontWeight: 800, textTransform: "capitalize" }}>{tx.status}</span>
                      </td>
                      <td style={{ padding: "14px 24px", fontSize: 14, fontWeight: 800, color: tx.type === "debit" ? "var(--lg-error)" : "var(--lg-success)", fontFamily: "var(--lg-font-display)" }}>
                        {tx.type === "debit" ? "-" : "+"}₹{tx.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: "14px 24px", fontSize: 12.5, color: "var(--lg-ink-soft)", textAlign: "right" }}>{tx.date} {tx.time}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {txData && <Pagination page={page} totalPages={txData.totalPages} onChange={setPage} />}
      </div>

      {modalOpen && (
        <WithdrawModal
          balance={summary.balance}
          pushToast={pushToast}
          onClose={() => setModalOpen(false)}
          onSuccess={(newBalance) => {
            setModalOpen(false);
            setSummary((s) => ({ ...s, balance: newBalance }));
            refreshTransactions();
          }}
        />
      )}

      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDone={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </div>
  );
}
