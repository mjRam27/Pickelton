// web/app/(auth)/login/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthLayout, nextPath, useNextQuery } from "../../../components/AuthLayout";
import { Notice, Spinner } from "../../../components/ui";
import { api, errorMessage, signIn } from "../../../lib/session";

export default function LoginPage() {
  const router = useRouter();
  const nextQuery = useNextQuery();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(await api.auth.login({ email: email.trim(), password }));
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
          <h1 className="display">Welcome<br />back</h1>
          <p className="muted" style={{ margin: 0 }}>Log in to see tonight's matches at your club.</p>
        </div>
        <div className="field">
          <label htmlFor="li-email">Email</label>
          <input autoComplete="email" className="input" id="li-email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </div>
        <div className="field">
          <label htmlFor="li-pass">Password</label>
          <input autoComplete="current-password" className="input" id="li-pass" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
        </div>
        <Notice message={error} />
        <button className="btn primary block" disabled={loading} type="submit">{loading ? <Spinner /> : null}Log in <ArrowRight aria-hidden="true" size={18} /></button>
        <p className="muted" style={{ margin: 0, textAlign: "center" }}>New to Pickelton? <Link href={`/signup${nextQuery}`} style={{ fontWeight: 700 }}>Create an account</Link></p>
      </form>
    </AuthLayout>
  );
}
