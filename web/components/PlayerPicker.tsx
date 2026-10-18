// web/components/PlayerPicker.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import type { UserSearchResult } from "@pickelton/types";
import { toneFor } from "../lib/format";
import { api, errorMessage } from "../lib/session";
import { Avatar, Spinner } from "./ui";

// Picks one player by searching name, email or phone. excludeUserIds hides people already chosen elsewhere.
export function PlayerPicker({ label, value, onSelect, excludeUserIds = [] }: {
  label: string;
  value: UserSearchResult | null;
  onSelect: (user: UserSearchResult | null) => void;
  excludeUserIds?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const text = query.trim();
    if (text.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      api.users.search(text)
        .then((found) => { if (!cancelled) { setResults(found); setError(""); } })
        .catch((cause) => { if (!cancelled) { setResults([]); setError(errorMessage(cause)); } })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  if (value) {
    return (
      <button aria-label={`${label}: ${value.name}. Remove`} className="listRow" onClick={() => onSelect(null)} style={{ cursor: "pointer", padding: "8px 12px", textAlign: "left" }} type="button">
        <Avatar name={value.name} size={28} tone={toneFor(value.userId)} />
        <span className="grow"><strong style={{ fontSize: 14 }}>{value.name}</strong></span>
        <X aria-hidden="true" size={16} />
      </button>
    );
  }

  if (!open) {
    return (
      <button className="btn" onClick={() => setOpen(true)} style={{ borderStyle: "dashed", color: "var(--muted)", width: "100%" }} type="button">
        <Plus aria-hidden="true" size={16} />{label}
      </button>
    );
  }

  const visible = results.filter((user) => !excludeUserIds.includes(user.userId));
  return (
    <div className="card" style={{ borderColor: "var(--acc)", gap: 6, padding: 8 }}>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <input aria-label={`Search for ${label}`} autoFocus className="input" onChange={(event) => setQuery(event.target.value)} placeholder="Name, email or phone" style={{ height: 40 }} value={query} />
        <button aria-label="Cancel search" className="btn ghost small" onClick={() => { setOpen(false); setQuery(""); }} type="button"><X size={16} /></button>
      </div>
      {error ? <span className="hint" style={{ color: "var(--hot-ink)" }}>{error}</span> : null}
      {query.trim().length < 2 ? <span className="hint">Type at least 2 characters.</span>
        : loading ? <span className="hint"><Spinner /></span>
        : visible.length ? visible.map((user) => (
          <button className="listRow" key={user.userId} onClick={() => { onSelect(user); setOpen(false); setQuery(""); }} style={{ border: 0, cursor: "pointer", padding: 8, textAlign: "left" }} type="button">
            <Avatar name={user.name} size={32} tone={toneFor(user.userId)} />
            <span className="grow"><strong style={{ fontSize: 14 }}>{user.name}</strong><small>{user.email}</small></span>
          </button>
        )) : <span className="hint">No players found.</span>}
    </div>
  );
}
