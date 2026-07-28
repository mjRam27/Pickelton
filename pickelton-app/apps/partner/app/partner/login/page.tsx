"use client";

import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, Zap } from "lucide-react";
import "./page.css";
export default function PartnerLoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Temporary until backend integration
    router.push("/partner/dashboard");
  };
  return (
    <main className="partner-login">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-top">
            <div className="brand">
  <span>PICKELTON</span>

  <p className="brand-tagline">
    PLAY. COMPETE. CONNECT.
  </p>
</div>

            <h1>
              Where Great
              <br />
              Clubs <span>Play.</span>
            </h1>

            <p className="hero-description">
              Manage courts, bookings, players and club operations from one
              powerful platform.
            </p>
          </div>

          <div className="hero-features">
            <div className="feature">
              <span>🏟️</span>
              <div>
                <h3>Court Management</h3>
                <p>Manage courts and availability.</p>
              </div>
            </div>

            <div className="feature">
              <span>📅</span>
              <div>
                <h3>Booking Management</h3>
                <p>Track reservations and players.</p>
              </div>
            </div>

            <div className="feature">
              <span>📊</span>
              <div>
                <h3>Revenue Analytics</h3>
                <p>Monitor business performance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="login-card">
        <div className="login-box">
          <span className="login-brand">PICKELTON</span>

          <header className="login-header">
            <h2>WELCOME BACK</h2>

            <p className="login-subtitle">
              Enter your credentials to manage your courts, bookings and
              revenue.
            </p>
          </header>

          <form className="login-form" onSubmit={handleLogin}>
            <label className="form-field" htmlFor="email">
              <span>EMAIL ADDRESS</span>

              <div className="input-control">
                <Mail size={17} aria-hidden="true" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="form-field" htmlFor="password">
              <span>PASSWORD</span>

              <div className="input-control">
                <LockKeyhole size={17} aria-hidden="true" />

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            <div className="login-options">
              <label>
                <input type="checkbox" />
                Remember me
              </label>

              <a href="#">Forgot Password?</a>
            </div>

            <button className="login-button" type="submit">
              <span>SIGN IN</span>
              <Zap size={17} aria-hidden="true" />
            </button>
          </form>

          <div className="login-divider">
            <span>OR CONNECT</span>
          </div>

          <button className="google-button" type="button">
            Continue with Google
          </button>

          <p className="login-footer">
            Need help? <a href="#">Contact Support</a>
          </p>
        </div>
      </section>
    </main>
  );
}