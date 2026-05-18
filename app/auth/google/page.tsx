"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { getApiMessage } from "@/services/api";
import { googleLogin } from "@/services/auth";

const phonePattern = /^\+?[1-9][0-9]{7,14}$/;

export default function GoogleLoginPage() {
  const router = useRouter();
  const [idToken, setIdToken] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (!idToken.trim()) {
      setStatus("Google ID token is required.");
      return;
    }
    if (phoneNumber && !phonePattern.test(phoneNumber)) {
      setStatus("Use a valid international phone number.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await googleLogin({
        idToken: idToken.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined
      });
      if (!response.data?.phoneVerified) {
        router.push("/verify-phone");
        return;
      }
      router.push("/profile");
    } catch (error) {
      setStatus(getApiMessage(error, "Google login form is ready to connect to Google ID token handling."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Google SSO"
      title="Link Google identity."
      subtitle="Existing linked users only need an ID token. First-time Google users also provide phone and date of birth."
      footer={
        <p className="text-center text-sm font-semibold text-on-surface-variant">
          Prefer email login?{" "}
          <Link className="text-primary transition hover:text-secondary" href="/login">
            Back to login
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Google ID token"
          name="idToken"
          placeholder="GOOGLE_ID_TOKEN"
          value={idToken}
          onChange={(event) => setIdToken(event.target.value)}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Phone number"
            name="phoneNumber"
            placeholder="+919876543210"
            helperText="Required for first-time Google users."
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
          <TextField
            label="Date of birth"
            name="dateOfBirth"
            type="date"
            helperText="Required for first-time Google users."
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
          />
        </div>
        {status ? <p className="rounded-lg bg-secondary/12 px-4 py-3 text-sm font-bold text-secondary">{status}</p> : null}
        <Button className="w-full" isLoading={isLoading} type="submit">
          Continue with Google
        </Button>
      </form>
    </AuthShell>
  );
}
