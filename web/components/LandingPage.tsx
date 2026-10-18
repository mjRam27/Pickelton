// web/components/LandingPage.tsx
import Link from "next/link";
import { HeaderActions } from "./HeaderActions";
import { Logo } from "./Logo";

const appStoreUrl = process.env.NEXT_PUBLIC_APP_STORE_URL;
const playStoreUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL;

const features = [
  { title: "Join clubs", copy: "Find clubs by sport and distance, see who plays there and join in one tap." },
  { title: "Enter tournaments", copy: "Browse events, register and track the field without leaving the app." },
  { title: "Score it live", copy: "Tap to score on court. Friends and standings update the second a rally ends." },
  { title: "Climb the ranks", copy: "Confirmed results feed your record, so match-ups stay fair and fun." },
];

export function LandingPage() {
  const hasStores = Boolean(appStoreUrl || playStoreUrl);
  return (
    <div className="page">
      <header className="siteHeader">
        <div className="wrap headerRow">
          <a className="brand" href="#top">
            <Logo size={34} />
            <span>Pickelton</span>
          </a>
          <nav aria-label="Main" className="mainNav">
            <a href="#features">Clubs</a>
            <a href="#features">Tournaments</a>
            <a href="#features">Live scoring</a>
            <a href="#community">Community</a>
          </nav>
          <HeaderActions />
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <svg aria-hidden="true" className="heroArt" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 720">
            <g fill="none" opacity="0.12" stroke="var(--acc)" strokeWidth="2">
              <rect height="560" width="1100" x="170" y="80" />
              <path d="M170 360h1100M720 80v560M445 80v560M995 80v560" />
            </g>
          </svg>
          <div className="wrap heroGrid">
            <div className="heroCopy">
              <span className="pill">Pickleball · Badminton</span>
              <h1 className="display heroTitle">Every rally <span className="accent">counts.</span></h1>
              <p className="lead">Join a club, enter tournaments, keep live scores on court and climb the leaderboard, all from one app built for paddles and rackets.</p>
              <div className="actions" id="get-the-app">
                {appStoreUrl ? <a className="button primary" href={appStoreUrl}>Download for iOS</a> : null}
                {playStoreUrl ? <a className="button outline" href={playStoreUrl}>Get it on Android</a> : null}
                <Link className="button primary" href="/signup">Play on the web</Link>
                {!hasStores ? <span className="pill soon">iOS and Android apps coming soon</span> : null}
              </div>
            </div>
            <div aria-hidden="true" className="heroCards">
              <div className="scoreCard">
                <div className="scoreTop"><span className="live"><span className="dot" />Live · Semi-final</span><span>Game 3</span></div>
                <div className="scoreGrid">
                  <span className="team">Team A</span><span className="display score">10</span>
                  <span className="team faded">Team B</span><span className="display score faded">8</span>
                </div>
                <span className="scoreFlag">Match point</span>
              </div>
              <div className="rankCard">
                <span className="display rank">#3</span>
                <span><strong>Up 2 places</strong><small>Tournament leaderboard</small></span>
              </div>
            </div>
          </div>
        </section>

        <section className="band" id="features">
          <div className="wrap stack">
            <div className="sectionHead">
              <h2 className="display sectionTitle">Built for the whole game</h2>
              <p>From finding your first club to lifting your first trophy.</p>
            </div>
            <div className="featureGrid">
              {features.map((feature, index) => (
                <article className="feature" key={feature.title}>
                  <span className="display featureNumber">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="wrap communitySection" id="community">
          <div className="community">
            <div className="stack tight">
              <span className="eyebrow">Community</span>
              <h2 className="display sectionTitle">Your club, your feed.</h2>
              <p>Share results, find a doubles partner, follow the players you meet on court and keep up with your club, all next to your scores.</p>
            </div>
            <div className="actions end">
              <Link className="button navy" href="/signup">Join the community</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="siteFooter">
        <div className="wrap footerRow">
          <span className="display footerBrand">Pickelton</span>
          <span>Pickleball and badminton, one app.</span>
          <span>© {new Date().getFullYear()} Pickelton</span>
        </div>
      </footer>
    </div>
  );
}
