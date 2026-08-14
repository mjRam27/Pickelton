import "./layout.css";

import Sidebar from "../../../components/partner/sidebar";
import Header from "../../../components/partner/header";

export default function PartnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="partner-layout">
      <Sidebar />

      <div className="partner-content">
        <Header />

        <main className="partner-main">{children}</main>
      </div>
    </div>
  );
}