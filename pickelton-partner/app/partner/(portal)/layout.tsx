import "./layout.css";
import "./design-system.css";

import Sidebar from "../../../components/partner/sidebar";
import Header from "../../../components/partner/header";
import PartnerSessionGuard from "../../../components/partner/session-guard";

export default function PartnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PartnerSessionGuard><div className="partner-layout">
      <Sidebar />

      <div className="partner-content">
        <Header />

        <main className="partner-main">{children}</main>
      </div>
    </div></PartnerSessionGuard>
  );
}
