"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/lib/apiClient";
import Loader from "@/components/Loader";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function dayLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const fmt = (x) => x.toISOString().slice(0, 10);
  if (fmt(d) === fmt(today)) return "Today";
  if (fmt(d) === fmt(yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function groupWithSeparators(messages) {
  const out = [];
  let lastDate = null;
  for (const m of messages) {
    const label = dayLabel(m.date);
    if (label !== lastDate) {
      out.push({ type: "separator", label, key: `sep-${m.id}` });
      lastDate = label;
    }
    out.push({ type: "message", ...m });
  }
  return out;
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sending, setSending] = useState(false);

  const scrollRef = useRef(null);
  const lastIdRef = useRef(0);
  const loadingOldRef = useRef(false);
  const firstLoadRef = useRef(true);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  useEffect(() => {
    api
      .get("/api/chat?type=initial")
      .then((res) => {
        setMessages(res.messages);
        if (res.messages.length > 0) lastIdRef.current = res.messages[res.messages.length - 1].id;
        setLoaded(true);
        firstLoadRef.current = false;
        setTimeout(scrollToBottom, 50);
      })
      .catch(() => setLoaded(true));
  }, [scrollToBottom]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (firstLoadRef.current) return;
      const el = scrollRef.current;
      const isNearBottom = el ? el.scrollTop + el.clientHeight >= el.scrollHeight - 150 : true;
      if (!isNearBottom) return;
      try {
        const res = await api.get(`/api/chat?type=after&afterId=${lastIdRef.current}`);
        if (res.messages.length > 0) {
          setMessages((prev) => [...prev, ...res.messages]);
          lastIdRef.current = res.messages[res.messages.length - 1].id;
          setTimeout(scrollToBottom, 50);
        }
      } catch {
        // ignore
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [scrollToBottom]);

  async function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.scrollTop !== 0 || loadingOldRef.current || firstLoadRef.current || messages.length === 0) return;
    loadingOldRef.current = true;
    const firstId = messages[0].id;
    const prevHeight = el.scrollHeight;
    try {
      const res = await api.get(`/api/chat?type=before&beforeId=${firstId}`);
      if (res.messages.length > 0) {
        setMessages((prev) => [...res.messages, ...prev]);
        requestAnimationFrame(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight - prevHeight;
        });
      }
    } finally {
      loadingOldRef.current = false;
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed && !imageFile) return;
    setSending(true);
    try {
      if (imageFile) {
        const form = new FormData();
        form.append("image", imageFile);
        if (!trimmed) form.append("text", "");
        await api.post("/api/chat", form);
      }
      if (trimmed) {
        const form = new FormData();
        form.append("text", trimmed);
        await api.post("/api/chat", form);
      }
      setText("");
      setImageFile(null);
      setImagePreview(null);

      const res = await api.get(`/api/chat?type=after&afterId=${lastIdRef.current}`);
      if (res.messages.length > 0) {
        setMessages((prev) => [...prev, ...res.messages]);
        lastIdRef.current = res.messages[res.messages.length - 1].id;
      }
      setTimeout(scrollToBottom, 50);
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to send message. Please try again.',
        confirmButtonColor: 'var(--lg-violet)'
      });
    } finally {
      setSending(false);
    }
  }

  function handleKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending) handleSend();
    }
  }

  const grouped = groupWithSeparators(messages);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", height: "calc(100vh - 180px)", display: "flex", flexDirection: "column", paddingBottom: 24 }}>
      <div 
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "var(--lg-paper-raised)",
          borderRadius: "var(--lg-radius-lg)",
          border: "1px solid var(--lg-line)",
          boxShadow: "var(--lg-shadow-lg)",
          overflow: "hidden"
        }}
      >
        {/* Chat Top Header */}
        <div style={{ padding: "16px 24px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fff", color: "#4f46e5", fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>S</div>
              <span style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", background: "#10b981", border: "2px solid #fff" }} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, fontFamily: "var(--lg-font-display)" }}>LootHat Support Agent</h2>
              <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>Active • Typically replies in minutes</span>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: "var(--lg-radius-pill)" }}>Direct Help</span>
        </div>

        {/* Message Container */}
        <div ref={scrollRef} onScroll={handleScroll} style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {!loaded ? (
            <Loader style={{ margin: "auto", color: "var(--lg-violet)" }} />
          ) : grouped.length === 0 ? (
            <div style={{ margin: "auto", textAlign: "center", color: "var(--lg-ink-soft)", fontSize: 14, fontWeight: 600 }}>
              👋 Welcome to Support Chat!<br />Send a message below and an agent will assist you.
            </div>
          ) : (
            grouped.map((item) =>
              item.type === "separator" ? (
                <div key={item.key} style={{ textAlign: "center", margin: "10px 0" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "var(--lg-ink-soft)", background: "var(--lg-paper-sunken)", padding: "4px 14px", borderRadius: "var(--lg-radius-pill)" }}>{item.label}</span>
                </div>
              ) : (
                <div
                  key={item.id}
                  style={{
                    alignSelf: item.from === "user" ? "flex-end" : "flex-start",
                    maxWidth: "75%",
                    background: item.from === "user" ? "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))" : "var(--lg-paper-sunken)",
                    color: item.from === "user" ? "#ffffff" : "var(--lg-ink)",
                    borderRadius: item.from === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                    padding: "12px 18px",
                    boxShadow: item.from === "user" ? "0 4px 14px rgba(99, 102, 241, 0.3)" : "var(--lg-shadow-sm)",
                    border: item.from === "user" ? "none" : "1px solid var(--lg-line)",
                    fontSize: 14,
                    lineHeight: "1.45"
                  }}
                >
                  {item.text && item.text !== "[image]" && <div style={{ fontWeight: 500 }}>{item.text}</div>}
                  {item.imagePath && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${API_URL}${item.imagePath}`} alt="attachment" style={{ maxWidth: "100%", borderRadius: 10, marginTop: 8 }} />
                  )}
                  <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, marginTop: 4, textAlign: "right", opacity: 0.75 }}>{item.time}</span>
                </div>
              )
            )
          )}
        </div>

        {/* Image Preview Bar */}
        {imagePreview && (
          <div style={{ padding: "10px 24px", background: "var(--lg-paper-sunken)", borderTop: "1px solid var(--lg-line)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" style={{ height: 60, borderRadius: 8, objectFit: "cover" }} />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                style={{ position: "absolute", top: -6, right: -6, background: "var(--lg-error)", color: "#fff", border: "none", width: 20, height: 20, borderRadius: "50%", cursor: "pointer", fontSize: 10, fontWeight: 900 }}
              >
                ✕
              </button>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--lg-ink-soft)" }}>Image attached</span>
          </div>
        )}

        {/* Input Bar */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--lg-line)", background: "var(--lg-paper-raised)", display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", background: "var(--lg-paper-sunken)", color: "var(--lg-violet)", cursor: "pointer", border: "1px solid var(--lg-line)" }}>
            📎
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
          </label>

          <input
            type="text"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              flex: 1,
              padding: "12px 20px",
              borderRadius: "var(--lg-radius-pill)",
              border: "1px solid var(--lg-line)",
              background: "var(--lg-paper-sunken)",
              fontSize: 14,
              color: "var(--lg-ink)",
              outline: "none"
            }}
          />

          <button
            onClick={handleSend}
            disabled={sending || (!text.trim() && !imageFile)}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "none",
              background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))",
              color: "#fff",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
              opacity: sending || (!text.trim() && !imageFile) ? 0.5 : 1
            }}
          >
            ➔
          </button>
        </div>
      </div>
    </div>
  );
}
