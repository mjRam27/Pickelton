# Pickelton

Pickelton is a **scoring app with a social platform** for **pickleball and badminton**: live match scoring, ratings,
clubs, tournaments and a community feed (posts, follows, finding a partner).

**One backend, two frontends with the same features:**

```text
        mobile/ (iOS + Android, Expo)  ──┐
                                         ├──>  backend/ (Java, Spring Boot)  ──>  PostgreSQL + Redis
        web/    (website, Next.js)     ──┘
```

Both frontends call the same Java API. A feature added to one should be added to the other.

> **Court booking is parked.** The partner portal and partner backend that handled venues, courts and bookings
> are saved on the git branch `parked/partner-booking` and are not part of the current product.

## Structure

```text
backend/          Java 21 + Spring Boot 3 API: auth, users and follows, clubs, community posts, tournaments,
                  matches and live scoring (port 8080)
mobile/           Expo SDK 54 + Expo Router player app for iOS and Android
web/              Next.js 16 website: public landing page plus the full player app (sign-in, home, clubs,
                  events, community, match creation and live scoring, profile, host verification)
packages/         Shared TypeScript workspaces:
                    @pickelton/constants  design tokens, sport rulesets
                    @pickelton/types      API request/response types
                    @pickelton/api        HTTP client for the Java API (createPickeltonApi): auth + token refresh
                    @pickelton/utils      formatting and validation helpers
```

## Design system

All apps share one look, defined in `packages/constants/src/theme.ts`: a dark and a light palette (lime accent
`#C8F03C`, blue, orange), **Archivo** for body text and **Big Shoulders** for display headings. The web apps mirror
the same tokens as CSS variables in `web/theme/tokens.css`; change both together.

Every screen supports light and dark mode and has empty, loading and error states. The screen list and build order
are in [PLAN.md](PLAN.md); coding conventions are in [CLAUDE.md](CLAUDE.md).

## Requirements

- Node.js 22 LTS
- Java 21 and Maven
- PostgreSQL
- Redis

## Getting started

### 1. Install JavaScript dependencies

From the repository root:

```bash
npm install
```

### 2. Backend (Java)

Create `backend/.env` from `backend/.env.example` and fill in the database, Redis and JWT values. If the JWT keys are
left empty, the backend generates a temporary key pair on startup, which is fine for local development only.

Set up the database:

- **New database:** run `backend/src/main/resources/schema.sql`.
- **Existing database:** run any files in `backend/src/main/resources/db/` you haven't applied yet, for example
  `002_discovery_and_follows.sql` (club coordinates and player follows), `003_tournament_registrations.sql`
  (registration forms and UPI payments) and `004_tournament_categories.sql` (categories inside an event).

The backend uses `ddl-auto: validate`, so it refuses to start until the schema matches the code. Every schema change
needs a new SQL file in `db/` **and** an update to `schema.sql`.

Run it (PowerShell):

```powershell
cd backend
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
mvn spring-boot:run
```

**SMS codes (phone verification).** Players verify their phone before they register for or host a tournament. Codes
are sent with [Twilio Verify](https://www.twilio.com/docs/verify): set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` and
`TWILIO_VERIFY_SERVICE_SID`. Without them, codes are only written to the backend log, which is fine locally. In
production, set `SPRING_PROFILE=prod`.

Host identity documents (KYC uploads) are stored in a private folder set by `KYC_UPLOAD_DIR`
(default `uploads/kyc`). Never serve that folder publicly.

More detail: [`backend/README.md`](backend/README.md).

### 3. Client apps

| App | Command | Configure |
|---|---|---|
| Mobile | `npm run mobile` (press `i` or `a`), or `npm run mobile:tunnel` for a physical device | `mobile/.env`: `EXPO_PUBLIC_API_URL`, the LAN address of the Java backend, e.g. `http://192.168.0.34:8080` |
| Website | `npm run web` (port 3000) | `web/.env` (copy `web/.env.example`): `NEXT_PUBLIC_API_URL` pointing at the Java backend. Optional `NEXT_PUBLIC_APP_STORE_URL`, `NEXT_PUBLIC_PLAY_STORE_URL` |

The website's signed-in pages live under `web/app/(app)/` (`/home`, `/clubs`, `/tournaments`, `/community`,
`/matches/new`, `/matches/[id]`, `/profile`, `/host`, `/my-tournaments`); sign-in pages are under `web/app/(auth)/`.

### Tournament registration

Any player with a verified phone can host a tournament (`/tournaments/new`). The host sets the player limit, entry fee,
an optional closing time and their own registration questions, then shares the public link
(`/tournaments/{id}`, viewable without logging in). Players sign up, verify their phone, answer the questions and pay
the host **directly by UPI** (QR code or a `upi://` button), then enter their UTR. The host matches each UTR against
their bank app and confirms or rejects it on `/tournaments/{id}/manage`, which also exports a CSV. Pickelton never
holds the money. A payment gateway (e.g. Razorpay) can replace this later.

An event can have **categories** (Men's doubles, Mixed doubles, Under-18 singles...), each with its own player limit and
fee. Players tick the categories they enter and pay the total in one UPI payment. On `/tournaments/{id}/matches` the
host sets up matches between players registered in a category and scores them live or enters the final score. The
public `/tournaments/{id}/leaderboard` shows one table per category, ranked by wins, then fewest losses, then point
difference; doubles pairs are ranked as teams.

## Deployment

Deploy three things:

| Piece | What | Notes |
|---|---|---|
| Backend | `backend/` as a Spring Boot service | Set `DATABASE_*`, `REDIS_URL`, `JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY`, `KYC_UPLOAD_DIR` (private, persistent disk), `TWILIO_*`, `SPRING_PROFILE=prod` and `ALLOWED_ORIGINS` = the website's URL |
| Website | `web/` as a Next.js app (`npm run web:build`, then `next start`) | Set `NEXT_PUBLIC_API_URL` to the backend's public URL **at build time** |
| Mobile | `mobile/` built with EAS for the App Store and Play Store | Set `EXPO_PUBLIC_API_URL` to the backend's public URL |

## Checks

```bash
npm run typecheck          # all TypeScript workspaces
npm test                   # mobile UI contract tests
npm run web:build
```

```powershell
cd backend
mvn test
```

## Known issues

- `MatchServiceTest` and `MatchControllerTest` in `backend/` no longer compile against the current match code, so
  `mvn test` and `mvn spring-boot:run` fail at test compilation. Until they're fixed, add `-Dmaven.test.skip=true`.
- Applying `db/supabase_production_refactor.sql` fails at line 78 (`match_status` cast).
- Tournament registration, UPI payments, categories and the matches page are on the website only; the mobile app
  doesn't have them yet (its leaderboard still works and shows the overall table).
- The mobile contract test for the private Supabase KYC bucket fails because that bucket is no longer in
  `db/supabase_schema.sql`.
