// web/app/(app)/profile/page.tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut, ShieldCheck } from "lucide-react";
import { Avatar, Notice, PageHeader, Segmented, Spinner } from "../../../components/ui";
import { getThemeMode, setThemeMode, type ThemeMode } from "../../../lib/theme";
import { api, errorMessage, signOut, updateSession, useResource, useSession } from "../../../lib/session";

export default function ProfilePage() {
  const router = useRouter();
  const session = useSession();
  const userId = session?.userId;
  const { data, error } = useResource(async () => {
    const [user, stats] = await Promise.all([api.users.me(), userId ? api.users.stats(userId) : Promise.resolve(null)]);
    return { user, stats };
  }, [userId]);
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => { setTheme(getThemeMode()); }, []);
  useEffect(() => { if (data?.user) setCity(data.user.city ?? ""); }, [data]);

  async function saveCity(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setSaveError("");
    try {
      const user = await api.users.updateMe({ city: city.trim() || null });
      updateSession({ city: user.city });
      setMessage("Profile saved.");
    } catch (cause) {
      setSaveError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await signOut();
    router.replace("/login");
  }

  const user = data?.user;
  const stats = data?.stats;
  const winRate = stats && stats.totalMatches ? `${Math.round((stats.wins / stats.totalMatches) * 100)}%` : "–";
  const since = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : null;

  return (
    <>
      <div className="row" style={{ gap: 20 }}>
        <Avatar name={session?.name} size={96} tone="blu" />
        <PageHeader sub={[user?.city, since ? `since ${since}` : null].filter(Boolean).join(" · ") || session?.email} title={session?.name || "Player"} />
      </div>
      <Notice message={error} />

      <div className="statGrid">
        <div className="stat" style={{ background: "var(--text)", color: "var(--bg)" }}><span className="value">{stats ? stats.totalMatches : "–"}</span><span className="label" style={{ color: "var(--bg)", opacity: 0.75 }}>Matches</span></div>
        <div className="stat" style={{ background: "var(--text)", color: "var(--bg)" }}><span className="value">{winRate}</span><span className="label" style={{ color: "var(--bg)", opacity: 0.75 }}>Win rate</span></div>
        <div className="stat" style={{ background: "var(--text)", color: "var(--bg)" }}><span className="value">{stats ? stats.wins : "–"}</span><span className="label" style={{ color: "var(--bg)", opacity: 0.75 }}>Wins</span></div>
      </div>

      <div className="columns">
        <section className="wide">
          <div className="card">
            <h2>Account</h2>
            {[
              ["Email", user?.email ?? session?.email, user?.emailVerified],
              ["Phone", user?.phoneNumber ?? session?.phoneNumber, user?.phoneVerified],
              ["Date of birth", user?.dateOfBirth ?? session?.dateOfBirth, undefined],
            ].map(([label, value, verified]) => (
              <div className="row between" key={String(label)} style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                <span className="headStack"><span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{label}</span><strong style={{ fontSize: 14 }}>{value || "Not set"}</strong></span>
                {typeof verified === "boolean" ? <span className={verified ? "badge acc" : "badge outline"}>{verified ? "Verified" : "Pending"}</span> : null}
              </div>
            ))}
            <form className="row" onSubmit={saveCity} style={{ alignItems: "flex-end", borderTop: "1px solid var(--line)", paddingTop: 12 }}>
              <div className="field" style={{ flex: 1 }}><label htmlFor="pf-city">Home city</label><input className="input" id="pf-city" maxLength={100} onChange={(event) => setCity(event.target.value)} placeholder="Bengaluru" value={city} /></div>
              <button className="btn" disabled={saving} type="submit">{saving ? <Spinner /> : null}Save</button>
            </form>
            <Notice message={message} tone="success" />
            <Notice message={saveError} />
          </div>
        </section>
        <section className="narrow">
          <div className="card">
            <h2>Appearance</h2>
            <Segmented full label="Theme" onChange={(mode) => { setTheme(mode); setThemeMode(mode); }} options={[{ label: "System", value: "system" }, { label: "Light", value: "light" }, { label: "Dark", value: "dark" }]} value={theme} />
          </div>
          <Link className="listRow" href="/host">
            <ShieldCheck aria-hidden="true" color="var(--blu-ink)" size={24} />
            <span className="grow"><strong>Become a verified host</strong><small>Run paid tournaments with the blue badge</small></span>
            <ChevronRight aria-hidden="true" className="muted" size={20} />
          </Link>
          <button className="btn" onClick={logout} type="button"><LogOut aria-hidden="true" size={18} />Log out</button>
        </section>
      </div>
    </>
  );
}
