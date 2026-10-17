# CLAUDE.md

Guidance for Claude (and other coding agents) working in this repository.
The whole UI is being redesigned. The screen list, navigation and design order live in [PLAN.md](PLAN.md).
Read it before touching any UI.

## What Pickelton is

A racket-sports platform for **pickleball and badminton** with three products:

| Product | Users | Clients in this repo |
|---|---|---|
| Pickelton (player) | Players, club owners/admins, tournament hosts | `mobile/` (iOS + Android), `web/` (player website) |
| Pickelton Partner | Venue owners, academies, staff | `partner/` (web portal); partner mobile is planned |
| Pickelton Admin | Internal ops team | Not started (planned Next.js app `admin/`) |

## Repository layout

```text
backend/          Java 21 + Spring Boot 3: THE player backend (auth, users, clubs, tournaments, matches; port 8080)
backend-js/       Retired Node rewrite of backend/. Do not add code here
partner-backend/  Node/Express: THE partner backend (venues, courts, bookings; port 8090, its OWN database)
mobile/           Expo SDK 54 + Expo Router app: the one canonical player app for iOS and Android
web/              Next.js 16 player website (mostly a single component on mock data right now)
partner/          Next.js 16 partner portal (UI complete, much of it on mock data)
packages/         Shared TS workspaces: @pickelton/types, api, constants, utils
pickelton-app/    Leftover from an old restructure; untracked. Do not add code here
```

> **Backend ownership (decided Oct 2026):** player features go in the Java `backend/`; partner features go in the
> Node `partner-backend/`. `backend-js/` is retired. `partner-backend` still has its own database, so anything that
> crosses the two (e.g. showing approved partner venues in player discovery) needs a deliberate integration; ask
> before building one.

## Commands

From the repo root (npm workspaces):

```bash
npm install
npm run mobile            # Expo dev server (press i / a for iOS / Android)
npm run mobile:tunnel     # Expo over tunnel for physical devices
npm run web               # player website (Next.js)
npm run partner -- --port 3001
npm run typecheck         # all TS workspaces
npm test                  # mobile UI contract tests
npm run web:build && npm run partner:build
```

Java backend (PowerShell):

```powershell
cd backend
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; $env:PATH="$env:JAVA_HOME\bin;$env:PATH"
mvn spring-boot:run       # port 8080
mvn test
```

Partner backend: `cd partner-backend`, then `npm run migrate && npm run seed && npm run dev`.
Java schema changes: add a SQL file under `backend/src/main/resources/db/` AND update `schema.sql` (no Flyway yet).

## Conventions

- **TypeScript everywhere on the client.** API request/response types belong in `packages/types`, and the
  HTTP client goes in `packages/api`. Don't redefine DTOs inside an app.
- **Mobile** uses Expo Router file-based routes in `mobile/app/`. Reusable UI lives in `mobile/components/`.
  Colours come from `useTheme()` (`mobile/theme/colors.ts`), so don't hard-code hex values. Support light and dark.
- **Web/partner** use the Next.js App Router. Design tokens are CSS variables (`web/theme/tokens.css`).
- **Java backend**: feature packages (`auth`, `club`, `match`, ...), each with `controller/dto/entity/repository/service`.
  Controllers return DTOs, never entities. `ddl-auto: validate`, so schema changes need a SQL migration.
- **Sport-agnostic core.** Never hard-code pickleball scoring. Points-to-win, win-by, point cap, rally vs side-out
  and serve rotation come from a per-sport ruleset (pickleball: 11 / win by 2 / side-out or rally;
  badminton: 21 / win by 2 / cap 30 / rally).
- Keep new code small and readable. Match the style of the surrounding file.

## Business rules the code must enforce (UI and backend)

- A user can own **at most 4 active clubs**. The creator becomes the owner and can promote admins.
- Only club **owners/admins** can create tournaments. Every tournament belongs to exactly one club.
- A **TeamUp** has exactly **two accepted members**. Invitations need acceptance, and a user can be in many TeamUps.
- Match types are **Friendly, TeamUp, Club, Tournament** (there is no "practice" type). They share one scoring engine.
- Results count toward **ratings only after both sides confirm** (or an admin resolves the dispute).
- **Verified host:** 3 qualifying completed tournaments make a host eligible to apply. An admin approves it; it's never automatic.
- Court bookings for the same court can **never overlap**. Enforce this with a DB exclusion constraint, not only in app code.
- Only **approved** partner venues/courts/offers appear in player discovery.

## Safety rails

- Never commit secrets. `*.pem` and `.env*` are git-ignored; keep it that way. Use the `.env.example` files.
- Seed scripts are development-only and must never run in production.
- Don't delete `backend/` or `backend-js/` unless the user explicitly decides to.

## UI redesign workflow

- Build screens in the batch order in PLAN.md. Design system (tokens + components) comes first.
- When a redesigned screen replaces an old one, delete the old screen and any components nothing uses anymore.
- Every screen needs dark + light mode, plus empty/loading/error states, and must use real API data (no new mock data).
- Tick the screen off in PLAN.md when it is built.
- `hs_err_pid*.log` / `replay_pid*.log` at the root are JVM crash dumps. They're safe to delete and must not be committed.
