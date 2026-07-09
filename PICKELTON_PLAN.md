# Pickelton — Plan to a Fully Working App (No AI)

Goal: every feature works end-to-end against the real backend with real data. No mock
data anywhere. No AI in this phase. Web frontend deferred (waiting on design) — focus is
**backend completeness + real data + mobile**.

---

## Current state (verified)

| Layer | State | Summary |
|---|---|---|
| Backend (Spring Boot, Supabase Postgres) | ~85% | Auth, clubs, tournaments, matches, role-based scoring, live-state engine, host KYC, leaderboard all real. Gaps below. |
| Mobile (Expo / React Native) | ~70% | Wired to real APIs already. Token doesn't persist; some hardcoded stats; will 404 on community. |
| Web (Next.js) | ~20% | 100% mock data, no API calls. **DEFERRED** until design is ready. |
| Real data / seed | 0% | No seed users, clubs, matches. |

### Confirmed gaps that break things today
1. **Community API missing.** `community` package has only `Post` entity + `PostRepository` — no controller/service. Mobile calls `/api/community/posts` → **404**.
2. **No seed data.** No `data.sql` / `CommandLineRunner`. Profiles, leaderboards, feeds are empty against a fresh DB.
3. **Mobile auth not persisted.** Token is in-memory in `pickelton-mobile/services/api.ts` → logout on every restart.
4. **Live scoring not "live" on clients.** Backend broadcasts on WebSocket `/topic/match/{id}`; neither client subscribes. Mobile only fetches on demand.
5. **Scorecard TODO stubs.** `MatchService.java` (~L213, L254–272): point/undo/correction/complete are placeholder adapters; scorekeeper search not tournament-aware.
6. **Hardcoded stats** in mobile home/club/scoring screens.

---

## Phase 0 — Get it running locally end-to-end (foundation)

Nothing else can be verified until the stack boots against the real DB.

- [ ] Confirm Supabase Postgres connection + that `schema.sql` / `supabase_schema.sql` is applied (Hibernate is `ddl-auto: validate`, so schema must exist).
- [ ] Confirm Redis is reachable (live-state cache, blacklist, OTP all depend on it).
- [ ] Set required env vars: `DATABASE_URL/USERNAME/PASSWORD`, `REDIS_URL`, `JWT_*` (or let dev keys generate), `ALLOWED_ORIGINS`, `ADMIN_API_KEY`, `GOOGLE_CLIENT_ID`.
- [ ] Backend boots; `/swagger-ui.html` loads; `/api/v1/auth/register` + `/login` work via Swagger.
- [ ] Point mobile `EXPO_PUBLIC_API_URL` at the machine's LAN IP; app logs in against real backend.

**Done when:** register → login → fetch `/me` works from the mobile app against the real backend.

---

## Phase 1 — Real data (seed script)

You want real users/profiles, no mock. Seed them in the DB so every screen has content.

- [ ] Add a `seed` Spring profile + `DataSeeder implements CommandLineRunner` (runs **only** when `spring.profiles.active=seed`; never in prod).
- [ ] Idempotent (check-by-email before insert) so re-running is safe.
- [ ] Seed contents:
  - 20–25 players: real-looking name, email, phone, city, sport, DOB, bio, avatar URL. Passwords BCrypt-hashed so they can actually log in.
  - 3–4 clubs with members + roles (ADMIN/MEMBER).
  - 2 tournaments (1 UPCOMING, 1 FINISHED) with registrations.
  - ~10 completed matches with participants, `score_events`, winners — so **leaderboards and player win/loss stats are non-empty**.
  - A few community posts (after Phase 2 builds the table usage).
  - 1 approved host + 1 pending host application.
- [ ] Document the seed accounts (email/password) in `README` for testing.

**Done when:** logging in as a seeded user shows a populated profile with real stats, clubs, and a leaderboard with standings.

---

## Phase 2 — Build the missing Community backend

Mobile already has the full UI + API calls; backend just needs the endpoints.

- [ ] `CommunityService` + `CommunityController` under `com.pickelton.backend.community`.
- [ ] Endpoints to match what mobile calls:
  - `GET /api/community/posts?page=&size=` — paginated feed (author name, content, tag, createdAt).
  - `POST /api/community/posts` — create (auth required, author = current user).
  - `DELETE /api/community/posts/{id}` — delete own post (403 otherwise).
  - `POST /api/community/posts/{id}/like` + unlike — mobile has a like UI. Needs a `post_likes` table (decide: build now or hide the button for v1).
- [ ] DTOs + MapStruct mapper; reuse `Post` entity.
- [ ] Remove the mobile `fallback`/`showcase` mock arrays once endpoints return real data.

**Done when:** create/list/delete posts works from mobile with no fallback data; feed is real.

**Decision needed:** include likes in v1, or ship posts-only and add likes later?

---

## Phase 3 — Finish match scoring (remove TODO stubs)

This is the core differentiator; make it solid.

- [ ] Implement real scorecard logic in `MatchService` (replace the 4 adapter TODOs): point, undo, correction, complete — writing `score_events` (event-sourced), updating `match_state`, and applying real pickleball/badminton scoring rules (set/game/match win conditions from the `rules` JSONB).
- [ ] Tournament-aware scorekeeper search (L213 TODO).
- [ ] Enforce role permissions: only assigned SCORER/REFEREE can record points.
- [ ] Match completion writes `winner_id` and updates leaderboard inputs.
- [ ] Unit tests for scoring rules (win-by-2, set transitions, undo correctness).

**Done when:** a full match can be scored point-by-point on mobile, undo works, completion sets a winner, and the result flows into the leaderboard.

---

## Phase 4 — Make live scoring actually live

Backend already broadcasts on `/topic/match/{matchId}`. Wire the client.

- [ ] Mobile: subscribe to the STOMP/WebSocket topic on the scoring + viewer screens; update score in real time instead of fetch-on-demand. (`/ws` SockJS endpoint, JWT in connect headers.)
- [ ] Show "live viewers"/LIVE indicator from real match status, not hardcoded.
- [ ] Reconnect handling + fall back to polling if socket drops.

**Done when:** two devices on the same match — scorer taps a point, viewer sees it update within ~1s without refreshing.

---

## Phase 5 — Mobile hardening / kill remaining mock data

- [ ] Persist auth token in AsyncStorage (dep already installed); auto-login on launch; clear on logout. (`pickelton-mobile/services/api.ts`)
- [ ] Remove/replace hardcoded stats:
  - Home XP "1,240 / Top 5%" → real or remove. (`app/(tabs)/index.tsx`)
  - Home live matches array → real live matches endpoint (may need a `GET /api/matches/live`).
  - Club metrics "04 weekly games / Energy A" → real or remove. (`app/clubs/[id].tsx`)
  - Match performance %/winners/break-points → real or remove. (`app/match/scoring.tsx`)
  - Invite placeholder "PLAYER A/B" → real participant names. (`app/match/invite.tsx`)
- [ ] Loading + error states on every screen that fetches.

**Decision needed:** for stats that have no backend source yet (XP, club energy, ball-possession %), do we (a) build endpoints, or (b) remove them from the UI for v1? Recommend **remove for v1**, add later.

**Done when:** grep for the known mock arrays returns nothing; app restart keeps you logged in.

---

## Phase 6 — Quality & release readiness

- [ ] Integration tests for the critical flows: register→login, create match→score→complete→leaderboard, club join/leave, tournament register.
- [ ] Backend: pagination on `/me/hosted`, `/club/{id}` tournament lists.
- [ ] KYC document upload: real file upload (currently URL-only) — or confirm Supabase Storage and upload there.
- [ ] Error response consistency + input validation pass.
- [ ] Basic rate-limit/abuse check on auth + OTP.

---

## Phase 7 — Web frontend (DEFERRED — when design lands)

Not started now. When you provide the design:
- Strip all mock data from `PickeltonWebApp.tsx`.
- Wire `services/apiClient.ts` (already exists, unused) to real endpoints.
- Real auth + token storage, then build screens to the design.
- Reuse the shared `packages/api` + `packages/types` that already define the routes/types.

---

## Decisions (LOCKED)
1. **Community likes** → Posts-only for v1. No like table/endpoints; hide the like button in mobile.
2. **Stats with no backend source** (XP, club energy, performance %) → **REMOVE from UI for v1.**
3. **KYC uploads** → **Use Supabase Storage** (upload bytes, store the returned URL).
4. **Seed size** → Users 20–30, Clubs 4–6, Tournaments 2–3, Matches 10–15, Posts 20–40.

## Suggested order
Phase 0 → 1 → 2 → 3 → 4 → 5 → 6, then 7 when design is ready. Phases 2–5 are where mobile
becomes a real, no-mock product.

---

## Progress log

### ✅ Phase 2 — Community backend (DONE)
- `CommunityController` + `CommunityService` + DTOs under `com.pickelton.backend.community`.
- Endpoints: `GET /api/community/posts?page=&size=`, `POST /api/community/posts`, `DELETE /api/community/posts/{id}`.
- Built to match the contract mobile already calls. `mvn compile` → BUILD SUCCESS.
- Mobile `community.tsx`: removed mock `fallback`, removed non-persistent LIKE button (posts-only).

### ✅ Phase 1 — Seed data (DONE, run to verify)
- `com.pickelton.backend.config.seed.DataSeeder` — `@Profile("seed")` `CommandLineRunner`, idempotent (skips if marker user exists).
- Seeds: 28 players (all login-able), 5 clubs w/ members, 3 tournaments (FINISHED/ONGOING/UPCOMING) w/ registrations,
  ~13 matches (completed + live) with participants, `match_state`, `score_events`, winners + tournament links,
  30 community posts, 1 approved + 1 pending host application.
- Produces real leaderboards and real win/loss profile stats.

**How to run the seed** (requires DB schema already applied + Redis up):
```
# from backend/
SPRING_PROFILES_ACTIVE=seed mvn spring-boot:run
# or with a built jar:
java -jar target/pickelton-backend.jar --spring.profiles.active=seed
```
- All seeded users share password: **`Pickelton@123`**
- Approved-host / main demo login: **`aarav.sharma@pickelton.dev`**
- Re-running is safe (it skips if already seeded). To re-seed, clear the tables first.

### ⏭ Next: Phase 3 (finish scorecard logic) → Phase 4 (live WebSocket) → Phase 5 (mobile token persistence + remove hardcoded stats).
