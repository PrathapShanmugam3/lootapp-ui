"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, StatusBadge } from "@/components/AdminPage";
import Loader from "@/components/Loader";

function OfferDetailContent() {
  const offId = useSearchParams().get("o");
  const [offer, setOffer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!offId) return;
    api.get(`/api/emp/offers/${offId}`)
      .then((res) => (res.success ? setOffer(res.offer) : setError(res.message || "Offer not found.")))
      .catch((err) => setError(err.data?.message || err.message || "Failed to load offer."));
  }, [offId]);

  const effectiveError = !offId ? "No offer ID provided." : error;
  if (effectiveError) {
    return (
      <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ padding: 14, borderRadius: "var(--lg-radius-sm)", background: "var(--lg-error-soft)", color: "var(--lg-error)", fontSize: 13, fontWeight: 600 }}>
          {effectiveError}
        </div>
      </div>
    );
  }
  if (!offer) return <Loader style={{ padding: 32 }} />;

  const totalPayout = [1, 2, 3, 4, 5].reduce((s, n) => s + Number(offer[`eve_${n}_user_po`] || 0) + Number(offer[`eve_${n}_refer_po`] || 0), 0);

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <AdminPageHeader
        title={offer.offer_name}
        subtitle={`ID: ${offer.off_id} · Category: ${offer.category || "—"} · Total payout ₹${totalPayout} (read-only)`}
        action={<StatusBadge status={offer.offer_status} />}
      />

      <AdminCard style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Events &amp; Payouts</h3>
        {[1, 2, 3, 4, 5].filter((n) => offer[`eve_${n}_name`]).map((n) => (
          <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--lg-line)", fontSize: 13 }}>
            <span style={{ color: "var(--lg-ink)", fontWeight: 600 }}>{offer[`eve_${n}_name`]}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--lg-ink-soft)" }}>User ₹{offer[`eve_${n}_user_po`]} · Refer ₹{offer[`eve_${n}_refer_po`]}</span>
          </div>
        ))}
        {[1, 2, 3, 4, 5].every((n) => !offer[`eve_${n}_name`]) && (
          <p style={{ fontSize: 13, color: "var(--lg-ink-faint)" }}>No events configured.</p>
        )}
      </AdminCard>

      <AdminCard style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Steps</h3>
        <p style={{ fontSize: 13, whiteSpace: "pre-line", color: "var(--lg-ink-soft)" }}>{offer.steps || "—"}</p>
      </AdminCard>

      <AdminCard style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Benefits</h3>
        <p style={{ fontSize: 13, whiteSpace: "pre-line", color: "var(--lg-ink-soft)" }}>{offer.offer_benefits || "—"}</p>
      </AdminCard>

      <AdminCard style={{ padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Terms</h3>
        <p style={{ fontSize: 13, whiteSpace: "pre-line", color: "var(--lg-ink-soft)" }}>{offer.terms || "—"}</p>
      </AdminCard>
    </div>
  );
}

export default function OfferDetailPage() {
  return (
    <Suspense fallback={<Loader style={{ padding: 32 }} />}>
      <OfferDetailContent />
    </Suspense>
  );
}
