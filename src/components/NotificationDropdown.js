"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/apiClient";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    fetchNotes();
    const interval = setInterval(fetchNotes, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotes() {
    try {
      const res = await api.get("/api/notifications");
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      // Ignore
    }
  }

  async function markAsRead(id = null) {
    try {
      await api.post("/api/notifications/read", { id });
      fetchNotes();
    } catch (e) {
      // Ignore
    }
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "var(--lg-paper-sunken)",
          border: "1px solid var(--lg-line)",
          borderRadius: "var(--lg-radius-sm)",
          width: 38,
          height: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--lg-ink)",
          cursor: "pointer",
          position: "relative",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--lg-violet)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--lg-line)"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: -4,
            right: -4,
            background: "var(--lg-error)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            borderRadius: "50%",
            width: 18,
            height: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--lg-glow-error)"
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: 8,
          width: 320,
          background: "var(--lg-paper-raised)",
          border: "1px solid var(--lg-line)",
          borderRadius: "var(--lg-radius)",
          boxShadow: "var(--lg-shadow-lg)",
          zIndex: 100,
          overflow: "hidden"
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--lg-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAsRead()} style={{ background: "none", border: "none", color: "var(--lg-violet)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Mark all read</button>
            )}
          </div>
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--lg-ink-faint)", fontSize: 13 }}>No notifications</div>
            ) : (
              notifications.map(n => {
                let color = "var(--lg-violet)";
                if (n.type === "success") color = "var(--lg-success)";
                if (n.type === "error") color = "var(--lg-error)";
                if (n.type === "warning") color = "var(--lg-warning)";
                
                return (
                  <div 
                    key={n.id} 
                    style={{ 
                      padding: "12px 16px", 
                      borderBottom: "1px solid var(--lg-line-soft)",
                      background: n.is_read ? "transparent" : "var(--lg-paper-sunken)",
                      cursor: "pointer",
                      transition: "background 0.2s ease"
                    }}
                    onClick={() => { if (!n.is_read) markAsRead(n.id); }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--lg-paper-sunken)"}
                    onMouseLeave={e => e.currentTarget.style.background = n.is_read ? "transparent" : "var(--lg-paper-sunken)"}
                  >
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, marginTop: 4, flexShrink: 0, opacity: n.is_read ? 0.3 : 1, boxShadow: n.is_read ? "none" : `0 0 8px ${color}` }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--lg-ink)", marginBottom: 2 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: "var(--lg-ink-soft)", lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: 10, color: "var(--lg-ink-faint)", marginTop: 6 }}>{new Date(n.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
