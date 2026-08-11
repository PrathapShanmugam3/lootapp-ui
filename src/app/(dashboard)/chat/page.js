"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/lib/apiClient";
import Loader from "@/components/Loader";

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
        // ignore transient poll failures
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
        await fetch(`${API_URL}/api/chat`, { method: "POST", credentials: "include", body: form });
      }
      if (trimmed) {
        const form = new FormData();
        form.append("text", trimmed);
        await fetch(`${API_URL}/api/chat`, { method: "POST", credentials: "include", body: form });
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
      alert("Failed to send message. Please try again.");
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
    <main className="flex-1 flex flex-col overflow-hidden px-4 sm:px-8 py-6 max-w-4xl mx-auto w-full" style={{ position: "relative", zIndex: 1 }}>
      <div className="flex flex-col flex-1 overflow-hidden lh-chat-card">
        <div className="lh-chat-header flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-white text-[15px] font-bold" style={{ background: "linear-gradient(135deg,var(--lg-orange),var(--lg-yellow))" }}>S</div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white" style={{ background: "var(--lg-success)" }} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-white leading-tight">Support Team</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--lg-success)" }} />
                <span className="text-[11px] text-white/70">Online</span>
              </div>
            </div>
          </div>
        </div>

        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col">
          {!loaded ? (
            <Loader />
          ) : grouped.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">No messages yet. Say hello!</div>
          ) : (
            grouped.map((item) =>
              item.type === "separator" ? (
                <div key={item.key} className="text-center my-4 relative">
                  <span className="px-3 py-1 text-[11px] font-semibold rounded-xl relative z-10" style={{ background: "var(--lg-paper-sunken)", color: "var(--lg-ink-faint)" }}>{item.label}</span>
                </div>
              ) : (
                <div
                  key={item.id}
                  className={`lh-chat-bubble ${item.from === "user" ? "lh-chat-bubble-me" : "lh-chat-bubble-support"}`}
                  style={
                    item.from === "user"
                      ? { alignSelf: "flex-end", textAlign: "right" }
                      : { alignSelf: "flex-start", textAlign: "left" }
                  }
                >
                  {item.text && item.text !== "[image]" && <div>{item.text}</div>}
                  {item.imagePath && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${API_URL}${item.imagePath}`} alt="attachment" />
                  )}
                  <span className="msg-time" style={item.from === "user" ? { color: "rgba(255,255,255,0.7)" } : {}}>{item.time}</span>
                </div>
              )
            )
          )}
        </div>

        {imagePreview && (
          <div className="px-5 pt-3 pb-1 relative" style={{ borderTop: "1px solid var(--lg-line-soft)", background: "var(--lg-paper-sunken)" }}>
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded-lg object-cover" style={{ border: "1px solid var(--lg-line)", boxShadow: "var(--lg-shadow-sm)" }} />
              <button
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="absolute -top-2 -right-2 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold"
                style={{ background: "var(--lg-error)", boxShadow: "var(--lg-shadow-sm)" }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="lh-chat-input-bar flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3">
          <label className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full cursor-pointer transition-colors" style={{ background: "var(--lg-violet-soft)" }}>
            <svg className="h-4 w-4" style={{ color: "var(--lg-violet)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>

          <div className="lh-input-wrap is-pill lh-chat-input lh-icon-message flex-1 min-w-0">
            <input
              type="text"
              placeholder="Type a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-[13px]"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending || (!text.trim() && !imageFile)}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,var(--lg-violet),var(--lg-violet-deep))", boxShadow: "0 4px 14px -4px color-mix(in srgb, var(--lg-violet) 45%, transparent)" }}
          >
            <svg className="h-4 w-4 text-white ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
          </button>
        </div>
      </div>
    </main>
  );
}
