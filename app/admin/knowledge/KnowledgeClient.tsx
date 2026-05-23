"use client";

import { useState, useEffect, useRef } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Plus, Trash2, ToggleLeft, ToggleRight, BookOpen, Pencil, Check, X } from "lucide-react";

interface Source { id: string; title: string; content: string; active: boolean; createdAt: string; }

function SourceCard({ src, onToggle, onDelete, onSave }: {
  src: Source;
  onToggle: () => void;
  onDelete: () => void;
  onSave: (title: string, content: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(src.title);
  const [content, setContent] = useState(src.content);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startEdit = () => {
    setTitle(src.title);
    setContent(src.content);
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const cancel = () => {
    setTitle(src.title);
    setContent(src.content);
    setEditing(false);
  };

  const save = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    await onSave(title.trim(), content.trim());
    setSaving(false);
    setEditing(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid #C9A84C", borderRadius: "8px",
    padding: "10px 14px", fontSize: "14px",
    fontFamily: "'IBM Plex Arabic', sans-serif",
    outline: "none", direction: "rtl", background: "#FFFDF5",
  };

  return (
    <div style={{
      background: "white", borderRadius: "14px", padding: "20px 24px",
      boxShadow: "0 4px 24px rgba(26,39,68,0.06)",
      border: editing ? "1.5px solid #C9A84C" : `1px solid ${src.active ? "#E5E5E0" : "#F3F4F6"}`,
      opacity: src.active || editing ? 1 : 0.65,
      transition: "border 0.2s",
    }}>
      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#C9A84C", display: "block", marginBottom: "4px" }}>العنوان</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#C9A84C", display: "block", marginBottom: "4px" }}>المحتوى</label>
            <textarea ref={textareaRef} value={content} onChange={e => setContent(e.target.value)} rows={10}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }} />
            <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "3px" }}>{content.length} / 20000 حرف</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={save} disabled={saving || !title.trim() || !content.trim()}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "#C9A84C", color: "#1A2744", border: "none", borderRadius: "8px", padding: "9px 20px", cursor: "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "'IBM Plex Arabic', sans-serif" }}>
              <Check size={14} /> {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
            </button>
            <button onClick={cancel}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "#F3F4F6", color: "#6B6B6B", border: "none", borderRadius: "8px", padding: "9px 16px", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "'IBM Plex Arabic', sans-serif" }}>
              <X size={14} /> إلغاء
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "16px", fontWeight: 700, color: "#1A2744" }}>{src.title}</span>
              <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "999px", background: src.active ? "#D1FAE5" : "#F3F4F6", color: src.active ? "#059669" : "#9CA3AF", fontWeight: 600, flexShrink: 0 }}>
                {src.active ? "مفعّل" : "معطّل"}
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "#6B6B6B", lineHeight: "1.6", whiteSpace: "pre-wrap", margin: 0 }}>
              {src.content.length > 220 ? src.content.slice(0, 220) + "..." : src.content}
            </p>
            <p style={{ fontSize: "11px", color: "#C4C4C0", marginTop: "8px" }}>{src.content.length} حرف</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
            <button onClick={startEdit} style={{ background: "#F0F4FF", border: "none", borderRadius: "8px", padding: "7px 12px", cursor: "pointer", color: "#2563EB", fontSize: "12px", fontWeight: 600, fontFamily: "'IBM Plex Arabic', sans-serif", display: "flex", alignItems: "center", gap: "4px" }}>
              <Pencil size={13} /> تعديل
            </button>
            <button onClick={onToggle} style={{ background: "transparent", border: "1px solid #E5E5E0", borderRadius: "8px", padding: "7px 12px", cursor: "pointer", color: src.active ? "#D97706" : "#059669", fontSize: "12px", fontWeight: 600, fontFamily: "'IBM Plex Arabic', sans-serif", display: "flex", alignItems: "center", gap: "4px" }}>
              {src.active ? <><ToggleLeft size={13} /> تعطيل</> : <><ToggleRight size={13} /> تفعيل</>}
            </button>
            <button onClick={onDelete} style={{ background: "#FEF2F2", border: "none", borderRadius: "8px", padding: "7px 12px", cursor: "pointer", color: "#DC2626", fontSize: "12px", fontWeight: 600, fontFamily: "'IBM Plex Arabic', sans-serif", display: "flex", alignItems: "center", gap: "4px" }}>
              <Trash2 size={13} /> حذف
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KnowledgeClient() {
  const [sources, setSources] = useState<Source[]>([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const load = () =>
    fetch("/api/knowledge").then(r => r.json()).then(setSources).finally(() => setFetching(false));

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setLoading(true);
    await fetch("/api/knowledge", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, active: true }),
    });
    setForm({ title: "", content: "" });
    await load();
    setLoading(false);
  };

  const remove = async (id: string) => {
    await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
    setSources(s => s.filter(x => x.id !== id));
  };

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/knowledge/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setSources(s => s.map(x => x.id === id ? { ...x, active: !active } : x));
  };

  const save = async (id: string, title: string, content: string) => {
    await fetch(`/api/knowledge/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setSources(s => s.map(x => x.id === id ? { ...x, title, content } : x));
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1px solid #E5E5E0", borderRadius: "10px",
    padding: "12px 16px", fontSize: "15px",
    fontFamily: "'IBM Plex Arabic', sans-serif",
    outline: "none", direction: "rtl",
  };

  return (
    <AdminShell>
      <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "26px", fontWeight: 900, color: "#1A2744" }}>مصادر سالم</h1>
          <p style={{ color: "#6B6B6B", marginTop: "4px", fontSize: "14px" }}>المعلومات التي يجاوب منها سالم — أضف أو عدّل أو عطّل في أي وقت</p>
        </div>

        <form onSubmit={add} style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 4px 24px rgba(26,39,68,0.06)", marginBottom: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 style={{ fontFamily: "'Noto Kufi Arabic', serif", fontSize: "17px", fontWeight: 700, color: "#1A2744" }}>
            <Plus size={16} style={{ display: "inline", marginLeft: "6px" }} /> إضافة مصدر جديد
          </h2>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1A2744", marginBottom: "6px" }}>عنوان المصدر</label>
            <input type="text" value={form.title} required onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: قائمة الخدمات، الأسئلة الشائعة..." style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1A2744", marginBottom: "6px" }}>المحتوى</label>
            <textarea required rows={8} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="اكتب أو الصق المعلومات التي تريد سالم يجاوب منها..."
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }} />
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>{form.content.length} / 20000 حرف</p>
          </div>
          <button type="submit" disabled={loading} style={{ alignSelf: "flex-start", background: "#C9A84C", color: "#1A2744", fontWeight: 700, padding: "12px 28px", borderRadius: "10px", border: "none", fontSize: "14px", cursor: "pointer", fontFamily: "'IBM Plex Arabic', sans-serif" }}>
            {loading ? "جارٍ الحفظ..." : "حفظ المصدر"}
          </button>
        </form>

        {fetching ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6B6B6B" }}>جارٍ التحميل...</div>
        ) : sources.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#6B6B6B" }}>
            <BookOpen size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p>لا توجد مصادر بعد — أضف أول مصدر لسالم</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "4px" }}>{sources.length} مصدر — اضغط "تعديل" لتحرير أي مصدر مباشرة</p>
            {sources.map(src => (
              <SourceCard key={src.id} src={src}
                onToggle={() => toggle(src.id, src.active)}
                onDelete={() => remove(src.id)}
                onSave={(title, content) => save(src.id, title, content)} />
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
