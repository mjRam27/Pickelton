// web/app/(app)/layout.tsx
import { AppShell } from "../../components/AppShell";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
