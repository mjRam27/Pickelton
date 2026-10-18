# CLAUDE.md

Guidance for Claude (and other coding agents) working in this repository.
The whole UI is being redesigned. The screen list, navigation and design order live in [PLAN.md](PLAN.md).
Read it before touching any UI.

## What Pickelton is

A **scoring app with a social platform** for **pickleball and badminton**: live scoring, matches, ratings, clubs,
tournaments and a community feed.

| Product | Users | Clients in this repo |
|---|---|---|
| Pickelton (player) | Players, club owners/admins, tournament hosts | `mobile/` (iOS + Android), `web/` (player website) |
| Pickelton Admin | Internal ops team | Not started (planned Next.js app `admin/`) |

> **Court booking is parked.** Don't build booking, venue, court-listing or partner features. The old partner portal
> and partner backend live on branch `parked/partner-booking` and come back only when the user says so.

## Repository layout

```text
backend/          Java 21 + Spring Boot 3: the only backend (auth, users, follows, clubs, community, tournaments, matches; port 8080)
mobile/           Expo SDK 54 + Expo Router app: the one canonical player app for iOS and Android
web/              Next.js 16 player website: landing page + the full player app (same features as mobile)
packages/         Shared TS workspaces: @pickelton/types, api, constants, utils
pickelton-app/    Leftover from an old restructure; untracked. Do not add code here
```

> **Backend (decided Oct 2026):** all server features go in the Java `backend/`. The Node rewrite (`backend-js/`) has
> been deleted.

## Commands

From the repo root (npm workspaces):

```bash
npm install
npm run mobile            # Expo dev server (press i / a for iOS / Android)
npm run mobile:tunnel     # Expo over tunnel for physical devices
npm run web               # player website (Next.js)
npm run typecheck         # all TS workspaces
npm test                  # mobile UI contract tests
npm run web:build
```

Java backend (PowerShell):

```powershell
cd backend
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; $env:PATH="$env:JAVA_HOME\bin;$env:PATH"
mvn spring-boot:run       # port 8080
mvn test
```

Java schema changes: add a SQL file under `backend/src/main/resources/db/` AND update `schema.sql` (no Flyway yet).

## Conventions

- **TypeScript everywhere on the client.** API request/response types belong in `packages/types`, and the
  HTTP client goes in `packages/api`. Don't redefine DTOs inside an app.
- **Mobile** uses Expo Router file-based routes in `mobile/app/`. Reusable UI lives in `mobile/components/`.
  Colours come from `useTheme()` (`mobile/theme/colors.ts`), so don't hard-code hex values. Support light and dark.
- **Two frontends, one feature set.** `mobile/` and `web/` must offer the same player features against the same Java
  API. When you add or change a feature in one, do the same in the other (or say clearly that you didn't).
- **Web** uses the Next.js App Router. Signed-in pages live in `web/app/(app)/`, auth pages in `web/app/(auth)/`. It
  calls the backend only through `@pickelton/api` (`web/lib/session.ts`). Design tokens are CSS variables
  (`web/theme/tokens.css`).
- `packages/types` mirrors the Java DTOs exactly. If a Java DTO changes, update the matching type in the same change.
  The mobile app still has its own client in `mobile/services/api.ts`; move it to `@pickelton/api` when touching it.
- **Java backend**: feature packages (`auth`, `club`, `match`, ...), each with `controller/dto/entity/repository/service`.
  Controllers return DTOs, never entities. `ddl-auto: validate`, so schema changes need a SQL migration.
- **Sport-agnostic core.** Never hard-code pickleball scoring. Points-to-win, win-by, point cap, rally vs side-out
  and serve rotation come from a per-sport ruleset (pickleball: 11 / win by 2 / side-out or rally;
  badminton: 21 / win by 2 / cap 30 / rally).
- Keep new code small and readable. Match the style of the surrounding file.

## Business rules the code must enforce (UI and backend)

- A user can own **at most 4 active clubs**. The creator becomes the owner and can promote admins.
- Any user with a **verified phone** can host a tournament. Linking a club is optional, and only that club's
  owners/admins can do it.
- Entry fees are paid **directly to the host by UPI**. The player submits the UTR and the host confirms or rejects it;
  Pickelton never holds the money. A paid tournament must have a UPI ID.
- Players need a verified phone to register. Registration stops at the player limit or the closing time.
- An event may have **categories** (each with its own format, player limit and fee). Players must pick at least one;
  one registration and one payment cover all of them. Tournament matches in such an event belong to a category, and
  only players registered in that category can play in it. A category with players can't be removed or shrunk below
  its player count.
- Each tournament has its own **feed**: public to read; only the host and registered players post. The host can pin
  one post and delete any; others delete only their own. Completed tournament matches post their result automatically.
  Feed posts never appear in the main community feed.
- A **TeamUp** has exactly **two accepted members**. Invitations need acceptance, and a user can be in many TeamUps.
- Match types are **Friendly, TeamUp, Club, Tournament** (there is no "practice" type). They share one scoring engine.
- Results count toward **ratings only after both sides confirm** (or an admin resolves the dispute).
- **Verified host:** 3 qualifying completed tournaments make a host eligible to apply. An admin approves it; it's never automatic.

## Safety rails

- Never commit secrets. `*.pem` and `.env*` are git-ignored; keep it that way. Use the `.env.example` files.
- Seed scripts are development-only and must never run in production.
- Don't delete `backend/` unless the user explicitly decides to.

## UI redesign workflow

- Build screens in the batch order in PLAN.md. Design system (tokens + components) comes first.
- When a redesigned screen replaces an old one, delete the old screen and any components nothing uses anymore.
- Every screen needs dark + light mode, plus empty/loading/error states, and must use real API data (no new mock data).
- Tick the screen off in PLAN.md when it is built.
- `hs_err_pid*.log` / `replay_pid*.log` at the root are JVM crash dumps. They're safe to delete and must not be committed.
