// web/components/QuestionBuilder.tsx
"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { QuestionType, RegistrationQuestion } from "@pickelton/types";

const TYPES: Array<{ value: QuestionType; label: string }> = [
  { value: "TEXT", label: "Short answer" },
  { value: "NUMBER", label: "Number" },
  { value: "SELECT", label: "Dropdown" },
  { value: "CHECKBOX", label: "Checkbox (yes / tick to agree)" },
];

// Ready-made questions hosts commonly ask; one click adds them.
const PRESETS: Array<Omit<RegistrationQuestion, "id">> = [
  { label: "Partner's name", type: "TEXT", required: true, options: [] },
  { label: "Skill level", type: "SELECT", required: true, options: ["Beginner", "Intermediate", "Advanced"] },
  { label: "T-shirt size", type: "SELECT", required: false, options: ["S", "M", "L", "XL"] },
  { label: "Emergency contact number", type: "TEXT", required: false, options: [] },
];

const newId = () => `q${Math.random().toString(36).slice(2, 8)}`;

// Lets a host design their registration form: add, edit, reorder and remove questions.
export function QuestionBuilder({ value, onChange }: { value: RegistrationQuestion[]; onChange: (questions: RegistrationQuestion[]) => void }) {
  const update = (index: number, patch: Partial<RegistrationQuestion>) => onChange(value.map((question, i) => (i === index ? { ...question, ...patch } : question)));
  const move = (index: number, by: number) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item);
    onChange(next);
  };
  const add = (preset?: Omit<RegistrationQuestion, "id">) => onChange([...value, { id: newId(), ...(preset ?? { label: "", type: "TEXT", required: false, options: [] }) }]);
  const unusedPresets = PRESETS.filter((preset) => !value.some((question) => question.label === preset.label));

  return (
    <div className="vstack">
      {value.length ? value.map((question, index) => (
        <div className="card" key={question.id} style={{ background: "var(--bg)", gap: 10, padding: 14 }}>
          <div className="row" style={{ alignItems: "flex-end" }}>
            <div className="field" style={{ flex: "2 1 220px" }}>
              <label htmlFor={`${question.id}-label`}>Question {index + 1}</label>
              <input className="input" id={`${question.id}-label`} maxLength={160} onChange={(event) => update(index, { label: event.target.value })} placeholder="e.g. Partner's name" required value={question.label} />
            </div>
            <div className="field" style={{ flex: "1 1 160px" }}>
              <label htmlFor={`${question.id}-type`}>Answer type</label>
              <select className="input" id={`${question.id}-type`} onChange={(event) => update(index, { type: event.target.value as QuestionType })} value={question.type}>
                {TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </div>
          </div>
          {question.type === "SELECT" ? (
            <div className="field">
              <label htmlFor={`${question.id}-options`}>Options, separated by commas</label>
              <input className="input" id={`${question.id}-options`} onChange={(event) => update(index, { options: event.target.value.split(",").slice(0, 20) })} placeholder="Beginner, Intermediate, Advanced" value={question.options.join(",")} />
            </div>
          ) : null}
          <div className="row between">
            <label className="check"><input checked={question.required} onChange={(event) => update(index, { required: event.target.checked })} type="checkbox" />Required</label>
            <div className="row" style={{ gap: 4 }}>
              <button aria-label="Move up" className="btn ghost small" disabled={index === 0} onClick={() => move(index, -1)} type="button"><ArrowUp size={16} /></button>
              <button aria-label="Move down" className="btn ghost small" disabled={index === value.length - 1} onClick={() => move(index, 1)} type="button"><ArrowDown size={16} /></button>
              <button aria-label={`Remove question ${index + 1}`} className="btn ghost small" onClick={() => onChange(value.filter((_, i) => i !== index))} style={{ color: "var(--hot-ink)" }} type="button"><Trash2 size={16} /></button>
            </div>
          </div>
        </div>
      )) : <p className="muted" style={{ margin: 0 }}>Players only give their name, email and phone (from their account). Add questions if you need more, like a partner's name.</p>}
      {value.length < 15 ? (
        <div className="row">
          <button className="btn" onClick={() => add()} type="button"><Plus aria-hidden="true" size={16} />Add question</button>
          {unusedPresets.map((preset) => <button className="chip" key={preset.label} onClick={() => add(preset)} type="button">+ {preset.label}</button>)}
        </div>
      ) : null}
    </div>
  );
}

// Trims labels/options and drops empty ones before sending to the backend.
export function cleanQuestions(questions: RegistrationQuestion[]) {
  return questions
    .map((question) => ({ ...question, label: question.label.trim(), options: question.type === "SELECT" ? question.options.map((option) => option.trim()).filter(Boolean) : [] }))
    .filter((question) => question.label);
}
