"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";

function ReferralContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("o");
  const previewTheme = searchParams.get("preview_theme");
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [upi, setUpi] = useState("");
  const [bank, setBank] = useState({ mobile: "", accNo: "", ifsc: "", holderName: "" });
  const [telegram, setTelegram] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  useEffect(() => {
    if (!code) {
      setError("Invalid or missing code.");
      setLoading(false);
      return;
    }

    api.get(`/api/public/offer/${code}`)
      .then((res) => {
        if (res.success) {
          setOffer(res.data);
          setPaymentMethod(res.data.pay_method1 || "upi");
        } else {
          setError(res.message || "Offer not found");
        }
      })
      .catch(() => setError("Offer not found"))
      .finally(() => setLoading(false));
  }, [code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await api.post("/api/public/generate-link", {
        offerId: offer.off_id,
        parentCode: code,
        affId: offer.aff_id,
        paymentMethod,
        upi,
        mobile: bank.mobile,
        accNo: bank.accNo,
        ifsc: bank.ifsc,
        holderName: bank.holderName,
        telegram,
        payouts: {
          eve_1_user_po: offer.eve_1_user_po,
          eve_2_user_po: offer.eve_2_user_po,
          eve_3_user_po: offer.eve_3_user_po,
          eve_4_user_po: offer.eve_4_user_po,
          eve_5_user_po: offer.eve_5_user_po,
          eve_1_refer_po: offer.eve_1_refer_po,
          eve_2_refer_po: offer.eve_2_refer_po,
          eve_3_refer_po: offer.eve_3_refer_po,
          eve_4_refer_po: offer.eve_4_refer_po,
          eve_5_refer_po: offer.eve_5_refer_po,
        }
      });
      
      if (res.success) {
        setGeneratedLink(`${window.location.origin}/leads?o=${res.referCode}`);
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert("Failed to process request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-sans">Loading campaign...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold font-sans">{error}</div>;

  const activeTheme = previewTheme || offer.landing_theme || "classic";
  const totalReferPayout = [offer.eve_1_refer_po, offer.eve_2_refer_po, offer.eve_3_refer_po, offer.eve_4_refer_po, offer.eve_5_refer_po]
    .reduce((sum, val) => sum + (Number(val) || 0), 0);
  const title = (offer.offer_title || offer.offer_name || "").replace("{amount}", totalReferPayout);
  
  const renderSuccess = () => (
    <div className="text-center p-8 bg-green-50 rounded-2xl border-2 border-dashed border-green-500 w-full">
      <h3 className="text-green-600 mb-3 text-xl font-bold">Link Generated Successfully!</h3>
      <p className="mb-4 font-medium text-gray-700">Share this link with your friends to start earning:</p>
      <input type="text" value={generatedLink} readOnly className="w-full p-3.5 rounded-xl border border-gray-300 mb-4 bg-white text-center font-bold text-indigo-600 text-sm outline-none shadow-sm" />
      <button onClick={() => { navigator.clipboard.writeText(generatedLink); alert("Copied!"); }} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-md">
        Copy Link
      </button>
    </div>
  );

  const renderForm = (inputClass, labelClass, buttonClass) => (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      {paymentMethod === "upi" ? (
        <div>
          <label className={labelClass}>UPI ID to receive referral bonus</label>
          <input type="text" value={upi} onChange={(e) => setUpi(e.target.value)} required className={inputClass} placeholder="e.g. name@okhdfcbank" />
        </div>
      ) : (
        <>
          <div>
            <label className={labelClass}>Mobile Number</label>
            <input type="text" value={bank.mobile} onChange={(e) => setBank({ ...bank, mobile: e.target.value })} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Account Number</label>
            <input type="text" value={bank.accNo} onChange={(e) => setBank({ ...bank, accNo: e.target.value })} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>IFSC Code</label>
            <input type="text" value={bank.ifsc} onChange={(e) => setBank({ ...bank, ifsc: e.target.value })} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Account Holder Name</label>
            <input type="text" value={bank.holderName} onChange={(e) => setBank({ ...bank, holderName: e.target.value })} required className={inputClass} />
          </div>
        </>
      )}
      
      <div>
        <label className={labelClass}>Telegram User ID (Optional)</label>
        <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} className={inputClass} placeholder="@username" />
      </div>
      
      <button disabled={submitting} type="submit" className={buttonClass}>
        {submitting ? "Generating..." : "Generate Referral Link"}
      </button>
    </form>
  );

  if (activeTheme === "minimal") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5 font-sans text-gray-900">
        <div className="bg-white w-full max-w-[450px] p-8 md:p-10 rounded-[24px] shadow-xl border border-gray-100 flex flex-col items-center">
          <div className="text-center mb-8">
            {offer.logo && <img src={offer.logo} alt={title} className="w-20 h-20 object-cover rounded-full mb-4 shadow-md mx-auto" />}
            <h1 className="text-2xl font-extrabold text-gray-900 m-0">Refer & Earn: {title}</h1>
            <p className="text-gray-500 text-sm mt-2">Invite friends and get rewarded.</p>
          </div>
          {generatedLink ? renderSuccess() : renderForm(
            "w-full px-4 py-3 rounded-xl border border-gray-300 text-[15px] bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow",
            "block mb-1.5 font-semibold text-[13px] text-gray-700",
            "w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold mt-2 text-[15px] transition-transform active:scale-95"
          )}
        </div>
      </div>
    );
  }

  if (activeTheme === "bold") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 md:p-12 font-sans">
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-10 lg:gap-16 items-center">
          <div className="flex-1 text-center md:text-left">
            {offer.logo && <img src={offer.logo} alt={title} className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-[24px] border-2 border-gray-800 mb-6 mx-auto md:mx-0 shadow-2xl" />}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white m-0 leading-[1.1] tracking-tight">Refer & Earn: {title}</h1>
            <p className="text-gray-400 text-lg md:text-xl mt-4 leading-relaxed">Invite your friends and earn cash for every successful sign-up.</p>
          </div>
          <div className="flex-1 w-full max-w-[450px] bg-[#171717] p-8 md:p-10 rounded-[24px] border border-gray-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
            <h2 className="text-white text-xl mb-6 font-bold">Generate Your Link</h2>
            {generatedLink ? renderSuccess() : renderForm(
              "w-full px-4 py-3.5 rounded-lg border border-gray-700 text-[15px] bg-black text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors",
              "block mb-2 font-semibold text-[12px] text-gray-500 uppercase tracking-wider",
              "w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-extrabold mt-3 text-[16px] uppercase tracking-wide transition-colors"
            )}
          </div>
        </div>
      </div>
    );
  }

  // Classic Theme (Default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-purple-950 p-5 md:p-10 font-sans flex items-center justify-center">
      <div className="w-full max-w-[450px] bg-white/95 backdrop-blur-md rounded-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 p-8 md:p-10 text-center text-white">
          {offer.logo ? (
            <img src={offer.logo} alt={title} className="w-20 h-20 object-cover rounded-full bg-white p-1 mb-4 shadow-xl mx-auto" />
          ) : (
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full" />
          )}
          <h1 className="text-2xl font-extrabold m-0 leading-tight">Refer & Earn: {title}</h1>
          <div className="inline-block bg-black/20 px-4 py-1.5 rounded-full text-[13px] font-bold mt-4 tracking-wide uppercase">{offer.category}</div>
        </div>
        
        <div className="p-8 md:p-10">
          {generatedLink ? renderSuccess() : (
            <>
              <h2 className="text-lg text-gray-800 mb-6 font-bold text-center">Enter details to generate your tracking link</h2>
              {renderForm(
                "w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 text-[15px] focus:outline-none focus:border-purple-500 transition-colors bg-white text-gray-900",
                "block mb-2 font-semibold text-[13px] text-slate-500",
                "w-full py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white rounded-xl font-bold mt-4 text-[16px] shadow-[0_4px_14px_rgba(168,85,247,0.4)] transition-all active:scale-[0.98]"
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReferralPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>Loading...</div>}>
      <ReferralContent />
    </Suspense>
  );
}
