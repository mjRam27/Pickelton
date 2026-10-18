// web/components/CategoryBuilder.tsx
"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { CategoryRequest, TournamentType } from "@pickelton/types";

// Form state keeps numbers as text so the host can clear a field while typing.
export type CategoryDraft = { key: string; id?: string; name: string; format: TournamentType; maxPlayers: string; entryFee: string };

// Common categories; one click adds them with the event's default fee.
const PRESETS: Array<{ name: string; format: TournamentType }> = [
  { name: "Men's doubles", format: "DOUBLES" },
  { name: "Women's doubles", format: "DOUBLES" },
  { name: "Mixed doubles", format: "DOUBLES" },
  { name: "Men's singles", format: "SINGLES" },
  { name: "Women's singles", format: "SINGLES" },
  { name: "Under-18 singles", format: "SINGLES" },
];

const newKey = () => `c${Math.random().toString(36).slice(2, 8)}`;

// Lets a host split one event into categories, each with its own player limit and entry fee.
export function CategoryBuilder({ value, onChange, defaultFee }: {
  value: CategoryDraft[];
  onChange: (categories: CategoryDraft[]) => void;
  defaultFee: string;
}) {
  const update = (index: number, patch: Partial<CategoryDraft>) => onChange(value.map((category, i) => (i === index ? { ...category, ...patch } : category)));
  const move = (index: number, by: number) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item);
    onChange(next);
  };
  const add = (preset?: { name: string; format: TournamentType }) =>
    onChange([...value, { key: newKey(), name: preset?.name ?? "", format: preset?.format ?? "DOUBLES", maxPlayers: "16", entryFee: defaultFee || "0" }]);
  const unusedPresets = PRESETS.filter((preset) => !value.some((category) => category.name.trim().toLowerCase() === preset.name.toLowerCase()));

  return (
    <div className="vstack">
      {value.map((category, index) => (
        <div className="card" key={category.key} style={{ background: "var(--bg)", gap: 10, padding: 14 }}>
          <div className="row" style={{ alignItems: "flex-end" }}>
            <div className="field" style={{ flex: "2 1 200px" }}>
              <label htmlFor={`${category.key}-name`}>Category {index + 1}</label>
              <input className="input" id={`${category.key}-name`} maxLength={80} onChange={(event) => update(index, { name: event.target.value })} placeholder="e.g. Men's doubles" required value={category.name} />
            </div>
            <div className="field" style={{ flex: "1 1 130px" }}>
              <label htmlFor={`${category.key}-format`}>Format</label>
              <select className="input" id={`${category.key}-format`} onChange={(event) => update(index, { format: event.target.value as TournamentType })} value={category.format}>
                <option value="DOUBLES">Doubles</option>
                <option value="SINGLES">Singles</option>
              </select>
            </div>
          </div>
          <div className="row" style={{ alignItems: "flex-end" }}>
            <div className="field" style={{ flex: "1 1 120px" }}>
              <label htmlFor={`${category.key}-max`}>Player limit</label>
              <input className="input" id={`${category.key}-max`} inputMode="numeric" max={512} min={2} onChange={(event) => update(index, { maxPlayers: event.target.value })} required type="number" value={category.maxPlayers} />
            </div>
            <div className="field" style={{ flex: "1 1 120px" }}>
              <label htmlFor={`${category.key}-fee`}>Entry fee (₹)</label>
              <input className="input" id={`${category.key}-fee`} inputMode="decimal" min={0} onChange={(event) => update(index, { entryFee: event.target.value })} required type="number" value={category.entryFee} />
            </div>
            <div className="row" style={{ gap: 4, marginLeft: "auto" }}>
              <button aria-label="Move up" className="btn ghost small" disabled={index === 0} onClick={() => move(index, -1)} type="button"><ArrowUp size={16} /></button>
              <button aria-label="Move down" className="btn ghost small" disabled={index === value.length - 1} onClick={() => move(index, 1)} type="button"><ArrowDown size={16} /></button>
              <button aria-label={`Remove category ${index + 1}`} className="btn ghost small" onClick={() => onChange(value.filter((_, i) => i !== index))} style={{ color: "var(--hot-ink)" }} type="button"><Trash2 size={16} /></button>
            </div>
          </div>
          {category.format === "DOUBLES" ? <span className="hint">Player limit counts players, not pairs: 16 players is 8 teams.</span> : null}
        </div>
      ))}
      {value.length < 12 ? (
        <div className="row">
          <button className="btn" onClick={() => add()} type="button"><Plus aria-hidden="true" size={16} />Add category</button>
          {unusedPresets.map((preset) => <button className="chip" key={preset.name} onClick={() => add(preset)} type="button">+ {preset.name}</button>)}
        </div>
      ) : null}
    </div>
  );
}

// Checks the drafts and turns them into the API shape; returns an error message instead when something's off.
export function toCategoryRequests(drafts: CategoryDraft[]): CategoryRequest[] | string {
  const names = new Set<string>();
  const requests: CategoryRequest[] = [];
  for (const draft of drafts) {
    const name = draft.name.trim();
    if (!name) return "Give every category a name.";
    if (names.has(name.toLowerCase())) return `Two categories are called "${name}".`;
    names.add(name.toLowerCase());
    const maxPlayers = Number(draft.maxPlayers);
    const entryFee = Number(draft.entryFee || 0);
    if (!Number.isInteger(maxPlayers) || maxPlayers < 2 || maxPlayers > 512) return `${name}: player limit must be between 2 and 512.`;
    if (!Number.isFinite(entryFee) || entryFee < 0) return `${name}: entry fee must be zero or more.`;
    requests.push({ ...(draft.id ? { id: draft.id } : {}), name, format: draft.format, maxPlayers, entryFee });
  }
  return requests;
}
