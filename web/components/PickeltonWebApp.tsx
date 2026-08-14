// pickelton-app/apps/web/components/PickeltonWebApp.tsx
"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  Dumbbell,
  Eye,
  Home,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Plus,
  Share2,
  ShieldCheck,
  Swords,
  Trophy,
  User,
  Users,
  Zap,
} from "lucide-react";

type Screen = "home" | "book" | "score" | "clubs" | "clubCreate" | "clubHome" | "feed" | "profile";

const images = {
  live: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1400&q=80",
  court: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80",
  club: "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=900&q=80",
  profile: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=500&q=80",
};

const courts = [
  { name: "AeroDome Center", detail: "6 indoor courts", location: "1.2 km", price: "Rs 480", image: images.court },
  { name: "The Pickle Plaza", detail: "8 outdoor courts", location: "2.4 km", price: "Rs 350", image: images.club },
  { name: "Zenith Sports Club", detail: "Premium club", location: "3.1 km", price: "Rs 620", image: images.court },
];

export function PickeltonWebApp() {
  const [signedIn, setSignedIn] = useState(false);
  const [signUp, setSignUp] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");

  if (!signedIn) {
    return <AuthPage signUp={signUp} onToggle={() => setSignUp(!signUp)} onContinue={() => setSignedIn(true)} />;
  }

  return (
    <div className="portal">
      <Header screen={screen} onBack={screen === "clubCreate" || screen === "clubHome" ? () => setScreen("clubs") : undefined} />
      <div className="workspace">
        <Nav current={screen} onChange={setScreen} />
        <main className="content">
          {screen === "home" && <HomePage onChange={setScreen} />}
          {screen === "book" && <BookingPage />}
          {screen === "score" && <ScorePage />}
          {screen === "clubs" && <ClubsPage onChange={setScreen} />}
          {screen === "clubCreate" && <CreateClubPage onComplete={() => setScreen("clubHome")} />}
          {screen === "clubHome" && <ClubHomePage />}
          {screen === "feed" && <FeedPage />}
          {screen === "profile" && <ProfilePage />}
        </main>
      </div>
      <MobileNav current={screen} onChange={setScreen} />
    </div>
  );
}

function Header({ screen, onBack }: { screen: Screen; onBack?: () => void }) {
  return (
    <header className="siteHeader">
      <div className="headerBrand">
        <button className="icon" type="button" onClick={onBack} aria-label={onBack ? "Back" : "Menu"}>
          {onBack ? <ChevronLeft /> : <Menu />}
        </button>
        <span className="brand">PICKELTON</span>
      </div>
      <div className="headerActions">
        <span className="currentSection">{screen.replace(/([A-Z])/g, " $1")}</span>
        <button className="icon alert" type="button" aria-label="Notifications"><Bell /></button>
      </div>
    </header>
  );
}

const navigation = [
  { key: "home" as const, label: "Home", Icon: Home },
  { key: "book" as const, label: "Book Courts", Icon: CalendarDays },
  { key: "score" as const, label: "Live Score", Icon: Swords },
  { key: "clubs" as const, label: "Clubs", Icon: Users },
  { key: "profile" as const, label: "Profile", Icon: User },
];

function Nav({ current, onChange }: { current: Screen; onChange: (screen: Screen) => void }) {
  return (
    <nav className="sideNav" aria-label="Main">
      {navigation.map(({ key, label, Icon }) => (
        <button className={current === key ? "navLink active" : "navLink"} type="button" onClick={() => onChange(key)} key={key}>
          <Icon />
          <span>{label}</span>
        </button>
      ))}
      <button className="navLaunch" type="button" onClick={() => onChange("clubCreate")}>
        <Plus /> New Club
      </button>
    </nav>
  );
}

function MobileNav({ current, onChange }: { current: Screen; onChange: (screen: Screen) => void }) {
  return (
    <nav className="mobileNav" aria-label="Mobile navigation">
      {navigation.map(({ key, label, Icon }) => (
        <button className={current === key ? "active" : ""} type="button" onClick={() => onChange(key)} key={key}>
          <Icon />
          <span>{label.split(" ")[0]}</span>
        </button>
      ))}
    </nav>
  );
}

function AuthPage({ signUp, onToggle, onContinue }: { signUp: boolean; onToggle: () => void; onContinue: () => void }) {
  return (
    <main className="authPage">
      <section className="authStory">
        <span className="brand">PICKELTON</span>
        <p className="eyebrow">PLAY. COMPETE. CONNECT.</p>
        <h1>Own your game.<br /><span>Find your arena.</span></h1>
        <p>Book courts, organize clubs and compete in verified tournaments across India.</p>
      </section>
      <section className="authPanel" aria-label={signUp ? "Create account" : "Sign in"}>
        <div className="authPanelHead">
          <span className="brand compact">PICKELTON</span>
          {signUp && <button type="button" className="textLink" onClick={onToggle}><ChevronLeft /> Back</button>}
        </div>
        <h2>{signUp ? "JOIN THE ARENA" : "WELCOME BACK"}</h2>
        <p>{signUp ? "Create your Pickelton player profile." : "Enter your credentials to resume the match."}</p>
        <form onSubmit={(event) => { event.preventDefault(); onContinue(); }}>
          {signUp && <Input label="FULL NAME" Icon={User} placeholder="Your full name" />}
          <Input label="EMAIL ADDRESS" Icon={Mail} placeholder="Email address" type="email" />
          {signUp && <Input label="PHONE NUMBER" Icon={User} placeholder="+91 phone number" type="tel" />}
          <Input label="PASSWORD" Icon={LockKeyhole} placeholder="Password" type="password" />
          <button type="submit" className="primaryButton">{signUp ? "SIGN UP" : "SIGN IN"} <Zap /></button>
        </form>
        <div className="divider"><span>OR CONNECT</span></div>
        <button className="googleButton" type="button" onClick={onContinue}>Continue with Google</button>
        <p className="switchPrompt">{signUp ? "Already have an account?" : "New to the league?"} <button type="button" onClick={onToggle}>{signUp ? "Log in" : "Create an account"}</button></p>
      </section>
    </main>
  );
}

function Input({ label, Icon, ...props }: { label: string; Icon: typeof Mail } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field">
      <span>{label}</span>
      <div><Icon /><input {...props} /></div>
    </label>
  );
}

function HomePage({ onChange }: { onChange: (screen: Screen) => void }) {
  return (
    <>
      <div className="titleRow">
        <div><p className="eyebrow">DASHBOARD</p><h1>Welcome back, Player One</h1></div>
        <button className="primaryButton short" type="button" onClick={() => onChange("book")}>BOOK A COURT</button>
      </div>
      <section className="homeGrid">
        <article className="liveFeature">
          <img src={images.live} alt="Players on a court" />
          <div className="overlay">
            <Badge>LIVE NOW</Badge>
            <h2>Summer Smash Invitational</h2>
            <p>Marcus V. vs Elena S. / Court 04</p>
            <button className="primaryButton short" type="button" onClick={() => onChange("score")}><Eye /> Watch match</button>
          </div>
        </article>
        <article className="velocity">
          <p className="eyebrow">YOUR WEEKLY VELOCITY</p>
          <strong>1,240 <span>XP</span></strong>
          <p>Top 5% of players in Bengaluru</p>
          <div className="bar"><i /></div>
        </article>
        <article className="discover">
          <h2>COURT<br />DISCOVERY</h2>
          <p>Find premium courts nearby.</p>
          <button type="button" onClick={() => onChange("book")}>Explore</button>
        </article>
      </section>
      <Section heading="Real-Time Volleys" action="View all" onAction={() => onChange("score")} />
      <div className="matches">
        <MatchCard playerOne="Marcus V." playerTwo="Elena S." score="11 - 08" />
        <MatchCard playerOne="Team Alpha" playerTwo="Westside Duo" score="21 - 19" />
      </div>
      <Section heading="Quick Book Nearby" action="See all" onAction={() => onChange("book")} />
      <CourtGrid />
    </>
  );
}

function BookingPage() {
  return (
    <>
      <div className="titleRow"><div><p className="eyebrow">COURTS</p><h1>Find Your <span>Arena</span></h1><p>Book professional-grade facilities near you.</p></div></div>
      <div className="filters">
        <button className="selected" type="button">Pickleball</button><button type="button">Badminton</button>
        <label>Date <input type="date" /></label>
      </div>
      <Section heading="Available Courts" action="Filter" />
      <CourtGrid />
    </>
  );
}

function CourtGrid() {
  return (
    <div className="courtGrid">
      {courts.map((court) => (
        <article className="courtCard" key={court.name}>
          <img src={court.image} alt={court.name} />
          <div>
            <h3>{court.name}</h3>
            <p>{court.detail} / {court.location}</p>
            <footer><strong>{court.price}<small>/hr</small></strong><button className="primaryButton short" type="button">Book</button></footer>
          </div>
        </article>
      ))}
    </div>
  );
}

function ScorePage() {
  return (
    <>
      <article className="scoreHero">
        <Badge>LIVE / SET 3</Badge>
        <p className="eyebrow">PICKELTON CITY ARENA</p>
        <div className="scorePeople">
          <Person name="Marcus V." />
          <strong><span>11</span><em>VS</em>08</strong>
          <Person name="Elena S." />
        </div>
        <button className="primaryButton short" type="button"><Eye /> Watch broadcast</button>
      </article>
      <div className="twoColumns">
        <article className="panel">
          <Section heading="Point History" />
          {["Ace down the line", "Volley winner", "Service fault", "Backhand smash"].map((point, i) => (
            <div className="history" key={point}><time>09:2{i}</time><span>{point}</span><strong>{i === 2 ? "08" : "11"}</strong></div>
          ))}
        </article>
        <article className="panel">
          <Section heading="Set Scores" />
          {[["Set 1", "11", "09"], ["Set 2", "07", "11"], ["Set 3 / Current", "11", "08"]].map((set, i) => (
            <div className={i === 2 ? "set active" : "set"} key={set[0]}><span>{set[0]}</span><strong>{set[1]} &nbsp; {set[2]}</strong></div>
          ))}
        </article>
      </div>
    </>
  );
}

function Person({ name }: { name: string }) {
  return <div className="person"><img src={images.profile} alt="" /><span>{name}</span></div>;
}

function ClubsPage({ onChange }: { onChange: (screen: Screen) => void }) {
  return (
    <>
      <div className="titleRow"><div><p className="eyebrow">COMMUNITY</p><h1>Elevate your game with <span>new rivals.</span></h1></div><button className="primaryButton short" type="button" onClick={() => onChange("clubCreate")}><Plus /> Create club</button></div>
      <Section heading="Pinned Club" />
      <article className="pinnedClub" onClick={() => onChange("clubHome")}>
        <img src={images.club} alt="Westside Smashers players" />
        <div><Badge>PREMIUM LEAGUE</Badge><h2>Westside Smashers</h2><p>Pickleball / 128 members / Bengaluru</p></div>
      </article>
      <Section heading="Discover Clubs" action="Open Feed" onAction={() => onChange("feed")} />
      <div className="clubRows">
        {["Net Masters Bengaluru", "Southbank Socials", "City Court Kings"].map((club) => (
          <article className="clubRow" key={club}><img src={images.court} alt="" /><div><h3>{club}</h3><p>Pickleball / 84 members</p></div><button className="primaryButton short">Join</button></article>
        ))}
      </div>
    </>
  );
}

function CreateClubPage({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  return (
    <section className="createClub">
      <p className="eyebrow">NEW CLUB / STEP {step} OF 3</p>
      <h1>{step === 1 ? "Club Details" : step === 2 ? "Review & Launch" : "Ready for Launch"}</h1>
      {step === 1 && <><Input label="CLUB NAME" Icon={Users} placeholder="Westside Smashers" /><Input label="LOCATION" Icon={MapPin} placeholder="Bengaluru" /></>}
      {step === 2 && <div className="optionList">{["Public club", "Private club", "Require host approval"].map((item, i) => <label className={i === 0 ? "chosen" : ""} key={item}><ShieldCheck />{item}<input type="radio" name="privacy" defaultChecked={i === 0} /></label>)}</div>}
      {step === 3 && <article className="launchSummary"><img src={images.club} alt="" /><h2>Westside Smashers</h2><p>Public club / Pickleball / Bengaluru</p></article>}
      <div className="formActions">{step > 1 && <button type="button" onClick={() => setStep(step - 1)}>Back</button>}<button className="primaryButton" type="button" onClick={() => step === 3 ? onComplete() : setStep(step + 1)}>{step === 3 ? "Launch Club" : "Continue"}</button></div>
    </section>
  );
}

function ClubHomePage() {
  return (
    <>
      <article className="clubBanner"><img src={images.club} alt="Club courts" /><div><Badge>OPEN TO JOIN</Badge><h1>The Smash Bunker</h1><p>Westside Smashers / Bengaluru</p></div></article>
      <div className="metrics"><Metric value="128" label="Members" /><Metric value="PRO" label="Tier" /><Metric value="04" label="Events" /></div>
      <button className="primaryButton" type="button"><Users /> Join club</button>
      <Section heading="Upcoming Events" action="Calendar" />
      {["Midnight Rally Series", "Court Kings Doubles"].map((event) => <article className="event" key={event}><CalendarDays /><div><h3>{event}</h3><p>Saturday / 7:30 PM</p></div><Badge>JOIN</Badge></article>)}
    </>
  );
}

function FeedPage() {
  return (
    <>
      <div className="titleRow"><h1>Player Feed</h1></div>
      {["Training session complete. Ready for the Sunday ladder.", "Victory secured. Finals next weekend."].map((post, i) => (
        <article className="post" key={post}><div className="author"><img src={images.profile} alt="" /><strong>{i ? "Westside Smashers" : "Marcus V."}</strong><small>2h ago</small></div><p>{post}</p><img className="postMedia" src={i ? images.club : images.live} alt="" /><footer><span>124 Likes</span><MessageCircle /><Share2 /></footer></article>
      ))}
    </>
  );
}

function ProfilePage() {
  return (
    <>
      <section className="profile"><img src={images.profile} alt="Player One" /><Badge>PRO TIER</Badge><h1>Player One</h1><p>Bengaluru, India / Member since 2026</p></section>
      <div className="metrics"><Metric value="142" label="Total Wins" /><Metric value="28" label="Losses" /><Metric value="83.5%" label="Win Rate" /><Metric value="#14" label="Global Rank" /></div>
      <Section heading="Sports Stats" />
      {["Pickleball", "Badminton"].map((sport) => <article className="event" key={sport}><Dumbbell /><div><h3>{sport}</h3><p>Advanced / 143 matches</p></div><strong className="lime">92%</strong></article>)}
      <Section heading="Achievements" action="View all" />
      <div className="achievements"><div><Trophy /><span>Tournament Winner</span></div><div><Zap /><span>Fast Serve</span></div></div>
    </>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>;
}

function Section({ heading, action, onAction }: { heading: string; action?: string; onAction?: () => void }) {
  return <header className="sectionHead"><h2>{heading}</h2>{action && <button type="button" onClick={onAction}>{action}</button>}</header>;
}

function MatchCard({ playerOne, playerTwo, score }: { playerOne: string; playerTwo: string; score: string }) {
  return <article className="match"><Badge>LIVE</Badge><div><strong>{playerOne}</strong><span>{playerTwo}</span></div><b>{score}</b></article>;
}

function Metric({ value, label }: { value: string; label: string }) {
  return <article className="metric"><strong>{value}</strong><span>{label}</span></article>;
}
