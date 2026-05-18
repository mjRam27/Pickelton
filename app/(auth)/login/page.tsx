"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Trophy } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";
import { getApiMessage } from "@/services/api";
import { login } from "@/services/auth";

type LoginForm = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginForm, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin(values: LoginForm): LoginErrors {
  const errors: LoginErrors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export default function LoginPage() {
  const router = useRouter();
  const [values, setValues] = useState<LoginForm>({ email: "", password: "" });
  const [touched, setTouched] = useState<Partial<Record<keyof LoginForm, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const errors = useMemo(() => validateLogin(values), [values]);
  const showError = (field: keyof LoginForm) => (touched[field] || submitted ? errors[field] : undefined);

  function updateField(field: keyof LoginForm, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setStatus("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setStatus("");

    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      const response = await login(values);
      const user = response.data;
      if (!user.phoneVerified) {
        router.push("/verify-phone");
        return;
      }
      router.push("/profile");
    } catch (error) {
      setStatus(getApiMessage(error, "Validation passed. Backend connection can be added next."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Secure entry"
      title="Back in the match."
      subtitle="Sign in to manage clubs, tournaments, and the live scoring flow that keeps every rally visible."
      footer={
        <p className="text-center text-sm font-semibold text-on-surface-variant">
          New to Pickelton?{" "}
          <Link className="text-primary transition hover:text-secondary" href="/signup">
            Create your account
          </Link>
          <span className="mx-2 text-on-surface-variant/60">/</span>
          <Link className="text-primary transition hover:text-secondary" href="/auth/google">
            Google login
          </Link>
        </p>
      }
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-secondary">Login</p>
          <h2 className="mt-2 font-headline text-3xl font-black text-on-surface">Welcome back</h2>
        </div>
        <Link
          href="/host/register"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/12 text-primary transition hover:bg-primary/20"
          aria-label="Go to tournament host form"
        >
          <Trophy className="h-5 w-5" />
        </Link>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          error={showError("email")}
          onBlur={() => setTouched((current) => ({ ...current, email: true }))}
          onChange={(event) => updateField("email", event.target.value)}
        />

        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={values.password}
          error={showError("password")}
          onBlur={() => setTouched((current) => ({ ...current, password: true }))}
          onChange={(event) => updateField("password", event.target.value)}
        />

        {status ? (
          <p className="rounded-lg bg-secondary/12 px-4 py-3 text-sm font-bold text-secondary" role="status">
            {status}
          </p>
        ) : null}

        <Button className="w-full" isLoading={isLoading} type="submit">
          Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>
    </AuthShell>
  );
}
