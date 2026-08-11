"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import Loader from "@/components/Loader";

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
        padding: "1rem 1.5rem",
        borderRadius: "var(--lg-radius)",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "var(--lg-shadow-md)",
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
      if (!/^[0-9]{9,18}$/.test(accountNo)) return pushToast("error", "Invalid account number (9–18 digits)");
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
      <div className="fixed inset-0 z-40" style={{ background: "rgba(20,22,43,0.55)", backdropFilter: "blur(5px)" }} onClick={onClose} />
      <div className="lh-wlt-modal overflow-auto fixed z-50 left-1/2 top-1/2 w-full max-w-md" style={{ transform: "translate(-50%, -50%)", maxHeight: "88vh" }}>
        <div className="lh-wlt-modal-head flex items-center justify-between">
          <h2 className="text-[1.2rem] font-bold" style={{ color: "var(--lg-ink)", letterSpacing: "-0.01em" }}>Request Withdrawal</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0" style={{ background: "var(--lg-paper-sunken)" }}>
            <svg className="h-4 w-4" style={{ color: "var(--lg-ink-soft)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="lh-wlt-modal-body">
            <p className="text-[13px] font-semibold mb-3" style={{ color: "var(--lg-ink-soft)" }}>Select Payment Method</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div
                className={`lh-wlt-method-card relative rounded-xl p-4 cursor-pointer border-2 transition-colors ${type === "upi" ? "lh-wlt-method-active" : ""}`}
                onClick={() => setType("upi")}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2" style={{ borderColor: type === "upi" ? "var(--lg-violet)" : "var(--lg-line)" }}>
                    {type === "upi" && <span className="h-2 w-2 rounded-full block" style={{ background: "var(--lg-violet)" }} />}
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0" style={{ background: "linear-gradient(135deg,var(--lg-violet),var(--lg-pink))" }}>
                    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: "var(--lg-ink)" }}>UPI Payment</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--lg-ink-soft)" }}>Fast &amp; Instant Transfer</p>
                  </div>
                </div>
              </div>

              <div
                className={`lh-wlt-method-card relative rounded-xl p-4 cursor-pointer border-2 transition-colors ${type === "bank" ? "lh-wlt-method-active" : ""}`}
                onClick={() => setType("bank")}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2" style={{ borderColor: type === "bank" ? "var(--lg-violet)" : "var(--lg-line)" }}>
                    {type === "bank" && <span className="h-2 w-2 rounded-full block" style={{ background: "var(--lg-violet)" }} />}
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0" style={{ background: "linear-gradient(135deg,var(--lg-violet),var(--lg-pink))" }}>
                    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: "var(--lg-ink)" }}>Bank Transfer</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--lg-ink-soft)" }}>Direct Bank Account</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {type === "upi" ? (
                <div>
                  <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--lg-ink-soft)" }}>UPI ID</label>
                  <div className="lh-input-wrap lh-wlt-input lh-icon-bank">
                    <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="Enter UPI ID (e.g., name@okaxis)" className="text-[13px]" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--lg-ink-soft)" }}>Account Number</label>
                    <div className="lh-input-wrap lh-wlt-input lh-icon-bank">
                      <input type="text" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} placeholder="Enter Account Number" className="text-[13px]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--lg-ink-soft)" }}>IFSC Code</label>
                    <div className="lh-input-wrap lh-wlt-input lh-icon-tag">
                      <input type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} placeholder="Enter IFSC Code" className="text-[13px]" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--lg-ink-soft)" }}>Amount (₹)</label>
                <div className="lh-input-wrap lh-wlt-input lh-icon-amount">
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" min="1" max="50000" required className="text-[13px]" />
                </div>
                <p className="text-[11px] mt-1.5" style={{ color: "var(--lg-ink-soft)" }}>
                  Available balance: <span className="font-semibold" style={{ color: "var(--lg-violet)" }}>₹{balance.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="lh-wlt-modal-foot">
            <button
              type="submit"
              disabled={!amount || submitting}
              className="lh-wlt-submit-btn w-full rounded-xl py-3.5 text-[14px] font-semibold text-white"
              style={{ opacity: !amount || submitting ? 0.6 : 1 }}
            >
              {submitting ? "Submitting…" : "Request Withdrawal"}
            </button>
          </div>
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
    <div className="lh-card" style={{ padding: 20 }}>
      <p className="text-[13px] font-bold mb-2" style={{ color: "var(--lg-violet)" }}>Have a redeem code?</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <div className="lh-input-wrap lh-icon-tag" style={{ flex: 1 }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            style={{ fontSize: 13, textTransform: "uppercase" }}
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !code.trim()}
          style={{ background: "linear-gradient(135deg,var(--lg-violet),var(--lg-violet-deep))", color: "#fff", border: "none", borderRadius: "var(--lg-radius-pill)", padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: submitting || !code.trim() ? 0.6 : 1 }}
        >
          {submitting ? "Redeeming…" : "Redeem"}
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

  if (!summary) {
    return <Loader />;
  }

  const balanceInt = Math.floor(summary.balance);
  const balanceCents = Math.round((summary.balance - balanceInt) * 100);

  return (
    <main className="flex-1 px-8 py-6 max-w-5xl mx-auto w-full space-y-5">
      <div>
        <h1 className="text-[1.35rem] font-extrabold" style={{ color: "var(--lg-ink)", letterSpacing: "-0.02em" }}>Wallet</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--lg-ink-soft)" }}>Manage your balance and withdrawals</p>
      </div>

      <div className="lh-wlt-balance-card relative overflow-hidden">
        <div className="lh-wlt-blob lh-wlt-blob-1" />
        <div className="lh-wlt-blob lh-wlt-blob-2" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="h-4 w-4 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
              <span className="text-[13px] font-semibold text-white/80">Available Balance</span>
            </div>
            <p className="text-[2.8rem] font-extrabold text-white leading-none mb-5" style={{ letterSpacing: "-0.03em", textShadow: "0 2px 12px rgba(20,22,43,0.25)" }}>
              ₹{balanceInt.toLocaleString("en-IN")}.{String(balanceCents).padStart(2, "0")}
            </p>
            <button onClick={() => setModalOpen(true)} className="lh-wlt-withdraw-btn flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
              Withdraw Funds
            </button>
          </div>
          <div className="flex flex-col gap-3 text-right">
            <div>
              <p className="text-[11px] font-semibold text-white/55 uppercase tracking-wider mb-0.5">Total Earned</p>
              <p className="text-[1.15rem] font-extrabold text-white" style={{ letterSpacing: "-0.02em" }}>₹{summary.totalEarned.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/55 uppercase tracking-wider mb-0.5">Total Withdrawn</p>
              <p className="text-[1.15rem] font-extrabold text-white" style={{ letterSpacing: "-0.02em" }}>₹{summary.totalWithdrawn.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
      </div>

      <RedeemCodeCard
        pushToast={pushToast}
        onRedeemed={(newBalance) => {
          setSummary((s) => ({ ...s, balance: newBalance }));
          refreshTransactions();
        }}
      />

      <div className="lh-card overflow-hidden p-0">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px dashed var(--lg-line-soft)" }}>
          <span className="text-[15px] font-bold" style={{ color: "var(--lg-violet)" }}>Transaction History</span>
          <span className="text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ background: "var(--lg-violet-soft)", color: "var(--lg-violet)" }}>
            {txData?.totalRecords ?? 0} transactions
          </span>
        </div>

        <div className="lh-table-scroll">
          <div className="lh-wlt-thead grid px-6 py-3.5" style={{ gridTemplateColumns: "70px 1fr 120px 130px 130px", background: "linear-gradient(120deg,var(--lg-hero-1) 0%,#20C997 45%,var(--lg-hero-2) 100%)" }}>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-white pl-2">Sr No.</span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-white">Type</span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-white">Status</span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-white">Amount</span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-white text-right">Date &amp; Time</span>
          </div>

          {!txData ? (
            <Loader />
          ) : txData.transactions.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">No transactions yet.</div>
          ) : (
            txData.transactions.map((tx, i) => {
              const style = STATUS_STYLE[tx.status?.toLowerCase()] || STATUS_STYLE.pending;
              return (
                <div key={tx.id} className="lh-wlt-tx-row lh-wlt-tx-grid grid px-6 py-3.5 items-center" style={{ gridTemplateColumns: "70px 1fr 120px 130px 130px", borderBottom: "1px dashed var(--lg-line-soft)" }}>
                  <span className="text-[13px] pl-2" style={{ color: "var(--lg-ink-faint)" }}>{(page - 1) * 10 + i + 1}</span>
                  <span className="text-[13px] font-medium capitalize" style={{ color: "var(--lg-ink)" }}>{tx.type} — {tx.comment}</span>
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full w-fit capitalize" style={{ background: style.bg, color: style.text }}>{tx.status}</span>
                  <span className="text-[13px] font-semibold" style={{ color: tx.type === "debit" ? "var(--lg-error)" : "var(--lg-success)" }}>{tx.type === "debit" ? "-" : "+"}₹{tx.amount.toFixed(2)}</span>
                  <span className="text-[12px] text-right" style={{ color: "var(--lg-ink-soft)" }}>{tx.date} {tx.time}</span>
                </div>
              );
            })
          )}
        </div>

        {txData && txData.totalPages > 1 && (
          <div className="flex items-center justify-center border-t px-5 py-3 gap-1" style={{ borderColor: "var(--lg-line-soft)", background: "var(--lg-paper-sunken)" }}>
            {Array.from({ length: txData.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="text-[12px] font-semibold h-7 w-7 rounded-lg"
                style={p === page ? { background: "linear-gradient(135deg,var(--lg-violet),var(--lg-violet-deep))", color: "#fff" } : { background: "var(--lg-paper-raised)", color: "var(--lg-ink-soft)" }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
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

      <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 99999, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDone={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </main>
  );
}
