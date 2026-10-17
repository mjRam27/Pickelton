# Pickelton

Pickelton is a racket-sports platform for **pickleball and badminton**. This monorepo holds three client apps,
two backends and shared TypeScript packages.

| Product | Who uses it | Client | Backend |
|---|---|---|---|
| Pickelton (player) | Players, club owners, tournament hosts | `mobile/` (iOS + Android), `web/` | `backend/` (Java) |
| Pickelton Partner | Venue owners and their staff | `partner/` (web portal) | `partner-backend/` (Node) |

## Structure

```text
backend/          Java 21 + Spring Boot 3 player API: auth, users, clubs, tournaments, matches (port 8080)
partner-backend/  Node.js + Express partner API: venue profile, courts, bookings, customers, reports (port 8090)
mobile/           Expo SDK 54 + Expo Router player app for iOS and Android
web/              Next.js 16 public website (landing page)
partner/          Next.js 16 partner portal
packages/         Shared TypeScript workspaces:
                    @pickelton/constants  design tokens, sport rulesets
                    @pickelton/types      API request/response types (player + partner)
                    @pickelton/api        HTTP clients (createPickeltonApi, createPartnerApi)
                    @pickelton/utils      formatting and validation helpers
backend-js/       Retired Node rewrite of backend/. Not used; do not add code here
```

**Which backend owns what:** player features go in the Java `backend/`, partner features go in the Node
`partner-backend/`. The two backends have **separate databases**.

## Design system

All apps share one look, defined in `packages/constants/src/theme.ts`: a dark and a light palette (lime accent
`#C8F03C`, blue, orange), **Archivo** for body text and **Big Shoulders** for display headings. The web apps mirror
the same tokens as CSS variables (`web/theme/tokens.css`, `partner/app/globals.css`); change them together.

Every screen supports light and dark mode and has empty, loading and error states. The screen list and build order
are in [PLAN.md](PLAN.md); coding conventions are in [CLAUDE.md](CLAUDE.md).

## Requirements

- Node.js 22 LTS
- Java 21 and Maven
- PostgreSQL (one database per backend)
- Redis (player backend)

## Getting started

### 1. Install JavaScript dependencies

From the repository root:

```bash
npm install
```

### 2. Player backend (Java)

Create `backend/.env` from `backend/.env.example` and fill in the database, Redis and JWT values. If the JWT keys are
left empty, the backend generates a temporary key pair on startup, which is fine for local development only.

Set up the database:

- **New database:** run `backend/src/main/resources/schema.sql`.
- **Existing database:** run any files in `backend/src/main/resources/db/` you haven't applied yet, for example
  `002_discovery_and_follows.sql` (club coordinates and player follows).

The backend uses `ddl-auto: validate`, so it refuses to start until the schema matches the code. Every schema change
needs a new SQL file in `db/` **and** an update to `schema.sql`.

Run it (PowerShell):

```powershell
cd backend
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
mvn spring-boot:run
```

Host identity documents (KYC uploads) are stored in a private folder set by `KYC_UPLOAD_DIR`
(default `uploads/kyc`). Never serve that folder publicly.

More detail: [`backend/README.md`](backend/README.md).

### 3. Partner backend (Node)

```bash
cd partner-backend
cp .env.example .env      # set DATABASE_URL and a JWT_SECRET of 32+ characters
npm run migrate
npm run seed              # development data only; never run in production
npm run dev
```

More detail: [`partner-backend/README.md`](partner-backend/README.md).

### 4. Client apps

| App | Command | Configure |
|---|---|---|
| Mobile | `npm run mobile` (press `i` or `a`), or `npm run mobile:tunnel` for a physical device | `mobile/.env`: `EXPO_PUBLIC_API_URL`, the LAN address of the Java backend, e.g. `http://192.168.0.34:8080` |
| Website | `npm run web` (port 3000) | Optional: `NEXT_PUBLIC_APP_STORE_URL`, `NEXT_PUBLIC_PLAY_STORE_URL`, `NEXT_PUBLIC_PARTNER_URL` |
| Partner portal | `npm run partner -- --port 3001` | `partner/.env`: `NEXT_PUBLIC_PARTNER_API_URL=http://localhost:8090/api/v1` |

The partner portal opens at `http://localhost:3001/partner/login`. Run the two Next.js apps on different ports.

## Checks

```bash
npm run typecheck          # all TypeScript workspaces
npm test                   # mobile UI contract tests
npm run web:build
npm run partner:build
```

```powershell
cd backend
mvn test
```

## Known issues

- `MatchServiceTest` and `MatchControllerTest` in `backend/` no longer compile against the current match code, so
  `mvn test` and `mvn spring-boot:run` fail at test compilation. Until they're fixed, add `-Dmaven.test.skip=true`.
- `schema.sql` is missing the `match_team_players` table that the match code needs, so a brand-new database can't
  start the backend yet. Applying `db/supabase_production_refactor.sql` also fails at line 78 (`match_status` cast).
- The mobile contract test for the private Supabase KYC bucket fails because that bucket is no longer in
  `db/supabase_schema.sql`.
- Partner booking-rule and notification settings are saved but not yet enforced by `partner-backend`.
