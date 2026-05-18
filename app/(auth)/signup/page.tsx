"use client";

import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";
import { getApiMessage } from "@/services/api";
import { signup } from "@/services/auth";

type SignupForm = {
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
};

type SignupErrors = Partial<Record<keyof SignupForm, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const phonePattern = /^\+?[1-9][0-9]{7,14}$/;

function validateSignup(values: SignupForm): SignupErrors {
  const errors: SignupErrors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Name should be at least 2 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!phonePattern.test(values.phoneNumber)) {
    errors.phoneNumber = "Use a valid phone number, for example +919876543210.";
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required.";
  } else {
    const birthday = new Date(`${values.dateOfBirth}T00:00:00`);
    const minimum = new Date();
    minimum.setFullYear(minimum.getFullYear() - 13);
    minimum.setHours(0, 0, 0, 0);
    if (birthday >= minimum) {
      errors.dateOfBirth = "You must be at least 13 years old.";
    }
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords must match.";
  }

  return errors;
}

export default function SignupPage() {
  const [values, setValues] = useState<SignupForm>({
    name: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: ""
  });
  const [touched, setTouched] = useState<Partial<Record<keyof SignupForm, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const errors = useMemo(() => validateSignup(values), [values]);
  const showError = (field: keyof SignupForm) => (touched[field] || submitted ? errors[field] : undefined);

  function updateField(field: keyof SignupForm, value: string) {
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
      await signup({
        name: values.name.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        dateOfBirth: values.dateOfBirth,
        password: values.password
      });
      setStatus("Account form is ready to connect.");
    } catch (error) {
      setStatus(getApiMessage(error, "Account form is ready to connect."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Join the arena"
      title="Build your player profile."
      subtitle="Create the account that will later connect to clubs, tournament registrations, and match history."
      footer={
        <p className="text-center text-sm font-semibold text-on-surface-variant">
          Already have an account?{" "}
          <Link className="text-primary transition hover:text-secondary" href="/login">
            Log in
          </Link>
        </p>
      }
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-secondary">Signup</p>
          <h2 className="mt-2 font-headline text-3xl font-black text-on-surface">Create account</h2>
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
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Srajanya Shetty"
          value={values.name}
          error={showError("name")}
          onBlur={() => setTouched((current) => ({ ...current, name: true }))}
          onChange={(event) => updateField("name", event.target.value)}
        />

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

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Phone number"
            name="phoneNumber"
            autoComplete="tel"
            placeholder="+919876543210"
            value={values.phoneNumber}
            error={showError("phoneNumber")}
            onBlur={() => setTouched((current) => ({ ...current, phoneNumber: true }))}
            onChange={(event) => updateField("phoneNumber", event.target.value)}
          />
          <TextField
            label="Date of birth"
            name="dateOfBirth"
            type="date"
            value={values.dateOfBirth}
            error={showError("dateOfBirth")}
            onBlur={() => setTouched((current) => ({ ...current, dateOfBirth: true }))}
            onChange={(event) => updateField("dateOfBirth", event.target.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="8+ characters"
            helperText="Minimum 8 characters."
            value={values.password}
            error={showError("password")}
            onBlur={() => setTouched((current) => ({ ...current, password: true }))}
            onChange={(event) => updateField("password", event.target.value)}
          />
          <PasswordField
            label="Confirm"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={values.confirmPassword}
            error={showError("confirmPassword")}
            onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
          />
        </div>

        {status ? (
          <p className="rounded-lg bg-secondary/12 px-4 py-3 text-sm font-bold text-secondary" role="status">
            {status}
          </p>
        ) : null}

        <Button className="w-full" isLoading={isLoading} type="submit">
          Create profile <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>
    </AuthShell>
  );
}
