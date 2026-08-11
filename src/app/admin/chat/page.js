"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/apiClient";
import Loader from "@/components/Loader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AdminChatPage() {
  const [conversations, setConversations] = useState(null);
  const [activeUserId, setActiveUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get("/api/admin/support/conversations").then((res) => setConversations(res.conversations)).catch(() => setConversations([]));
  }, []);

  useEffect(() => {
    if (!activeUserId) return;
    api.get(`/api/admin/support/chat/${activeUserId}?type=initial`).then((res) => {
      setMessages(res.messages);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 50);
    });
  }, [activeUserId]);

  async function handleSend() {
    if (!text.trim() || !activeUserId) return;
    const form = new FormData();
    form.append("text", text.trim());
    await fetch(`${API_URL}/api/admin/support/chat/${activeUserId}`, { method: "POST", credentials: "include", body: form });
    setText("");
    const res = await api.get(`/api/admin/support/chat/${activeUserId}?type=initial`);
    setMessages(res.messages);
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 50);
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
      <div style={{ width: 300, borderRight: "1px solid var(--lg-line)", overflowY: "auto", background: "var(--lg-paper-raised)" }}>
        <div style={{ padding: 16, fontWeight: 800, fontSize: 14, fontFamily: "var(--lg-font-display)", borderBottom: "1px solid var(--lg-line-soft)" }}>Conversations</div>
        {!conversations ? (
          <Loader style={{ padding: 16, fontSize: 13, color: "var(--lg-ink-faint)" }} />
        ) : conversations.length === 0 ? (
          <div style={{ padding: 16, fontSize: 13, color: "var(--lg-ink-faint)" }}>No conversations yet.</div>
        ) : (
          conversations.map((c) => (
            <div
              key={c.userId}
              onClick={() => setActiveUserId(c.userId)}
              style={{
                padding: "12px 16px", margin: "4px 8px", cursor: "pointer", borderRadius: "var(--lg-radius-sm)",
                background: activeUserId === c.userId ? "var(--lg-violet-soft)" : "transparent",
                borderLeft: activeUserId === c.userId ? "3px solid var(--lg-violet)" : "3px solid transparent",
                transition: "background-color 150ms ease, border-color 150ms ease",
              }}
              onMouseEnter={(e) => { if (activeUserId !== c.userId) e.currentTarget.style.background = "var(--lg-paper-sunken)"; }}
              onMouseLeave={(e) => { if (activeUserId !== c.userId) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "var(--lg-ink)" }}>{c.name}</span>
                {c.unread && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg, var(--lg-violet), var(--lg-pink))" }} />}
              </div>
              <p style={{ fontSize: 12, color: "var(--lg-ink-faint)", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.lastMessage}</p>
            </div>
          ))
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--lg-paper)" }}>
        {!activeUserId ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lg-ink-faint)", fontSize: 14 }}>
            Select a conversation
          </div>
        ) : (
          <>
            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    maxWidth: "70%", padding: "10px 14px", borderRadius: "var(--lg-radius)", fontSize: 13,
                    alignSelf: m.from === "user" ? "flex-start" : "flex-end",
                    background: m.from === "user" ? "var(--lg-paper-raised)" : "linear-gradient(135deg, var(--lg-violet), var(--lg-pink))",
                    color: m.from === "user" ? "var(--lg-ink)" : "#fff",
                    boxShadow: "var(--lg-shadow-sm)",
                  }}
                >
                  {m.text}
                  {m.imagePath && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${API_URL}${m.imagePath}`} alt="" style={{ maxWidth: 200, display: "block", marginTop: 6, borderRadius: "var(--lg-radius-sm)" }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, padding: 16, borderTop: "1px solid var(--lg-line)", background: "var(--lg-paper-raised)" }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a reply…"
                style={{
                  flex: 1, padding: "12px 18px", borderRadius: "var(--lg-radius-pill)", border: "1.5px solid var(--lg-line)",
                  background: "var(--lg-paper-sunken)", fontSize: 13, color: "var(--lg-ink)", fontFamily: "var(--lg-font-body)",
                  outline: "none", transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--lg-violet)"; e.target.style.background = "var(--lg-paper-raised)"; e.target.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--lg-line)"; e.target.style.background = "var(--lg-paper-sunken)"; e.target.style.boxShadow = "none"; }}
              />
              <button
                onClick={handleSend}
                style={{
                  background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))", color: "#fff", border: "none",
                  borderRadius: "var(--lg-radius-pill)", padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 8px 16px -6px rgba(16,185,129,0.5)", transition: "transform 160ms ease, box-shadow 160ms ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
