"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { getAccessToken } from "@/services/session";

const publicRoutes = ["/", "/signup", "/login", "/auth/google", "/scoring"];

function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const publicPage = isPublicRoute(pathname);

    if (!token && !publicPage) {
      router.replace("/signup");
      return;
    }

    if (token && (pathname === "/signup" || pathname === "/login")) {
      router.replace("/");
      return;
    }

    setIsReady(true);
  }, [pathname, router]);

  if (!isReady && !isPublicRoute(pathname)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5">
        <div className="rounded-xl bg-surface-low p-6 text-center shadow-ambient outline outline-1 outline-white/10">
          <p className="font-headline text-2xl font-black text-on-surface">Pickelton</p>
          <p className="mt-2 text-sm font-bold text-on-surface-variant">Preparing your court entry...</p>
        </div>
      </main>
    );
  }

  return children;
}
