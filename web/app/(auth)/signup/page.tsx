// web/app/(auth)/signup/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout, nextPath, useNextQuery } from "../../../components/AuthLayout";
import { Notice, Spinner } from "../../../components/ui";
import { api, errorMessage, signIn, updateSession } from "../../../lib/session";

// 0-4: length, mixed case, digit, symbol. Same rule as the phone app.
function passwordStrength(value: string) {
  if (!value) return 0;
  return [value.length >= 8, /[a-z]/.test(value) && /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;
}

export default function SignupPage() {
  const router = useRouter();
  const nextQuery = useNextQuery();
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", dateOfBirth: "", password: "", city: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (name: keyof typeof form) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [name]: event.target.value }));
  const strength = passwordStrength(form.password);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!agreed) return setError("Please accept the Terms of Use and Privacy Policy.");
    setLoading(true);
    try {
      const { city, ...account } = form;
      await signIn(await api.auth.register({ ...account, email: form.email.trim(), phoneNumber: form.phoneNumber.replace(/\s/g, "") }));
      // City is optional profile data; signing up must not fail because of it.
      if (city.trim()) {
        const profile = await api.users.updateMe({ city: city.trim() }).catch(() => null);
        if (profile) updateSession({ city: profile.city });
      }
      router.replace(nextPath());
    } catch (cause) {
      setError(errorMessage(cause));
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={submit}>
        <div className="headStack" style={{ gap: 8 }}>
          <h1 className="display">Join the rally</h1>
          <p className="muted" style={{ margin: 0 }}>Create your player profile in under a minute.</p>
        </div>
        <div className="field"><label htmlFor="su-name">Full name</label><input autoComplete="name" className="input" id="su-name" onChange={set("name")} required value={form.name} /></div>
        <div className="field"><label htmlFor="su-email">Email</label><input autoComplete="email" className="input" id="su-email" onChange={set("email")} required type="email" value={form.email} /></div>
        <div className="formGrid">
          <div className="field"><label htmlFor="su-phone">Phone number</label><input autoComplete="tel" className="input" id="su-phone" onChange={set("phoneNumber")} placeholder="+91 98765 43210" required type="tel" value={form.phoneNumber} /></div>
          <div className="field"><label htmlFor="su-dob">Date of birth</label><input className="input" id="su-dob" max={new Date().toISOString().slice(0, 10)} onChange={set("dateOfBirth")} required type="date" value={form.dateOfBirth} /></div>
        </div>
        <div className="field">
          <label htmlFor="su-pass">Password</label>
          <input autoComplete="new-password" className="input" id="su-pass" minLength={8} onChange={set("password")} required type="password" value={form.password} />
          <div aria-label={`Password strength ${strength} of 4`} className="meter" role="img">
            {[0, 1, 2, 3].map((index) => <span className={index < strength ? (strength >= 3 ? "on" : "weak") : ""} key={index} />)}
          </div>
          {form.password ? <span className="hint">{strength >= 3 ? "Strong password" : "Add length, a number or a symbol"}</span> : null}
        </div>
        <div className="field"><label htmlFor="su-city">Home city (optional)</label><input autoComplete="address-level2" className="input" id="su-city" onChange={set("city")} placeholder="Bengaluru" value={form.city} /></div>
        <label className="check"><input checked={agreed} onChange={(event) => setAgreed(event.target.checked)} type="checkbox" />I agree to the Terms of Use and Privacy Policy.</label>
        <Notice message={error} />
        <button className="btn primary block" disabled={loading} type="submit">{loading ? <Spinner /> : null}Create account</button>
        <p className="muted" style={{ margin: 0, textAlign: "center" }}>Already playing? <Link href={`/login${nextQuery}`} style={{ fontWeight: 700 }}>Log in</Link></p>
      </form>
    </AuthLayout>
  );
}
