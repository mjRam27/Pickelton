// partner/app/partner/login/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Notice, Logo } from "../../../components/ui";
import { errorMessage, partnerApi, saveSession } from "../../../lib/partner";
import "./login.css";

export default function PartnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await partnerApi.auth.login(email.trim(), password);
      saveSession(token, remember);
      router.replace("/partner/dashboard");
    } catch (cause) {
      setError(errorMessage(cause));
      setLoading(false);
    }
  }

  return (
    <div className="loginPage">
      <section className="loginHero">
        <svg aria-hidden="true" className="loginArt" preserveAspectRatio="xMidYMid slice" viewBox="0 0 720 900">
          <g fill="none" opacity="0.14" stroke="#C8F03C" strokeWidth="2">
            <rect height="700" width="520" x="100" y="100" />
            <path d="M100 450h520M360 100v700M100 300h520M100 600h520" />
          </g>
        </svg>
        <div className="brand loginBrand"><Logo size={36} />Pickelton<span className="partnerTag">PARTNER</span></div>
        <div className="loginPitch">
          <h1 className="display">Full courts.<br /><span>Zero spreadsheets.</span></h1>
          <p>Courts, bookings and regulars for pickleball and badminton venues, in one place.</p>
        </div>
        <div aria-hidden="true" className="loginTonight">
          <span className="loginEyebrow">Tonight</span>
          <div className="loginSlots">{["acc", "acc", "acc", "acc", "blu", "blu"].map((tone, index) => <span className={tone} key={index} />)}</div>
          <span>Every court, every booking, at a glance.</span>
        </div>
      </section>
      <section className="loginFormSide">
        <form className="loginForm" onSubmit={submit}>
          <div className="headStack">
            <h2 className="display" style={{ fontSize: 44 }}>Partner log in</h2>
            <p className="muted" style={{ margin: 0 }}>For court and venue owners and their staff.</p>
          </div>
          <div className="field">
            <label htmlFor="pl-email">Work email</label>
            <input autoComplete="email" className="input" id="pl-email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </div>
          <div className="field">
            <label htmlFor="pl-pass">Password</label>
            <input autoComplete="current-password" className="input" id="pl-pass" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </div>
          <label className="check"><input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" />Keep me signed in on this device</label>
          <Notice message={error} />
          <button className="btn primary block" disabled={loading} type="submit">{loading ? <span className="spinner" /> : null}Log in to portal</button>
        </form>
      </section>
    </div>
  );
}
