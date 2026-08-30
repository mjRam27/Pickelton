"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PartnerSessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      if (!localStorage.getItem("partner_token")) {
        setAuthenticated(false);
        router.replace("/partner/login");
        return;
      }
      setAuthenticated(true);
    };
    checkSession();
    window.addEventListener("pageshow", checkSession);
    window.addEventListener("storage", checkSession);
    return () => {
      window.removeEventListener("pageshow", checkSession);
      window.removeEventListener("storage", checkSession);
    };
  }, [router]);

  return authenticated ? children : null;
}
