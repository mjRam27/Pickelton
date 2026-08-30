import Link from "next/link";
import "../login/page.css";

export default function SupportPage() {
  return <main className="partner-login auth-single"><section className="login-card"><div className="login-box">
    <span className="login-brand">PICKELTON</span>
    <header className="login-header"><h2>Contact Support</h2><p className="login-subtitle">Partners can contact support for login, access, and account issues.</p></header>
    <p className="support-note">A support email or help desk has not been configured for this portal. You can prepare the details below, then share them with your Pickelton account administrator.</p>
    <form className="login-form" aria-label="Support request"><label className="form-field"><span>YOUR EMAIL</span><div className="input-control input-control-plain"><input type="email" placeholder="Email address" disabled/></div></label><label className="form-field"><span>HOW CAN WE HELP?</span><div className="input-control input-control-plain"><input type="text" placeholder="Describe your login or account issue" disabled/></div></label><button className="login-button" type="button" disabled>SUPPORT NOT CONFIGURED</button></form>
    <p className="auth-message error" role="status">Support delivery is currently unavailable; no message has been sent.</p>
    <Link className="auth-link" href="/partner/login">← Back to Login</Link>
  </div></section></main>;
}
