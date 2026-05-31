# Pickelton Backend

Pickelton is a modular monolith backend for tournament and community management across Pickleball and Badminton.

## Stack

- Java 21
- Spring Boot 3.x
- Maven
- PostgreSQL
- Upstash Redis
- Spring Data JPA
- Spring Security + JWT
- Lombok
- Swagger/OpenAPI
- DTO-based REST APIs

## Structure

The backend follows a feature-based modular monolith layout:

- `auth`
- `user`
- `club`
- `tournament`
- `registration`
- `match`
- `leaderboard`
- `security`
- `config`
- `common`
- `mapper`
- `enums`

## Configuration

Copy `.env.example` to `.env` and provide values for:

- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `JWT_PRIVATE_KEY`
- `JWT_PUBLIC_KEY`
- `JWT_EXPIRATION_MS` (`900000` recommended for 15-minute access tokens)
- `JWT_REFRESH_EXPIRATION_MS` (`2592000000` recommended for 30-day refresh sessions)
- `REDIS_URL`
- `MATCH_CACHE_TTL_MINUTES` (`120` by default)

`application.yml` reads these values from environment variables.
JWTs are signed with RS256. For local development only, the backend generates an ephemeral RSA key pair if the JWT keys are missing.
Redis stores rotating refresh sessions, revoked access tokens, phone OTPs, user cache entries, and shared request-rate counters.

For Upstash, use the TLS URL form:

```properties
REDIS_URL=rediss://default:<password>@<host>:6379
```

Never commit `.env`. Rotate credentials immediately if they have been exposed in a terminal recording, screenshot, or chat.

## Database Setup

For a fresh database, run:

```text
src/main/resources/schema.sql
```

For an existing Supabase database created from the previous schema, run this once in the Supabase SQL editor before starting the refactored backend:

```text
src/main/resources/db/supabase_production_refactor.sql
```

The migration replaces fixed `player1_id` and `player2_id` columns with `match_participants`, stores current score state in `match_state`, appends changes to `score_events`, adds `tournament_matches` and `posts`, and renames the database table `host_verifications` to `host_applications`.

## Run Locally

1. Use Java 21. On PowerShell:

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
java -version
```

2. Run the backend:

```bash
mvn spring-boot:run
```

3. Open Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

## Run Everything With Docker

```bash
docker compose up --build
```

## API Endpoints

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/google`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/verification-code`
- `POST /api/v1/auth/verify-code`
- `GET /api/v1/auth/me`

Successful register/login/Google/refresh responses include an access `token` and a `refreshToken`.
Access tokens are short lived. Store refresh tokens securely and send them to `/refresh` to receive a rotated token pair.
Send the refresh token in the optional logout body to revoke the session:

```json
{
  "refreshToken": "..."
}
```

Phone OTP data is Redis-backed with expiry, resend cooldown, and attempt limiting. The development profile logs OTPs for local Swagger testing; integrate an SMS provider before production.

### Host Verification

- `POST /api/v1/host-verifications/me`
- `GET /api/v1/host-verifications/me`
- `GET /api/v1/admin/host-verifications/pending`
- `PATCH /api/v1/admin/host-verifications/{id}/review`

Tournament creation requires an approved host verification record.
Host verification submission requires the user's account phone number to be verified.
Admin review endpoints require the `X-Admin-Key` header matching `ADMIN_API_KEY`.

### Clubs

- `POST /api/clubs`
- `GET /api/clubs?search=&page=&size=`
- `GET /api/clubs/me`
- `GET /api/clubs/{id}`
- `PATCH /api/clubs/{id}` (club admin)
- `POST /api/clubs/{id}/join`
- `DELETE /api/clubs/{id}/leave`
- `GET /api/clubs/{id}/members`
- `PATCH /api/clubs/{id}/members/{userId}/role` (club admin)
- `DELETE /api/clubs/{id}/members/{userId}` (club admin)

Creating a club requires a verified phone number. Club responses expose public creator/member summaries only.

### Tournaments

- `POST /api/tournaments`
- `GET /api/tournaments?status=&sportType=&clubId=&page=&size=`
- `GET /api/tournaments/me/hosted`
- `GET /api/tournaments/club/{clubId}`
- `GET /api/tournaments/{id}`
- `PATCH /api/tournaments/{id}` (host, upcoming only)
- `PATCH /api/tournaments/{id}/status` (host)

Creating a tournament requires approved host KYC and a verified phone number. A tournament attached to a club can only be created by a club admin.

### Registrations

- `GET /api/tournaments/registrations/me`
- `POST /api/tournaments/{id}/register`
- `DELETE /api/tournaments/{id}/register`
- `GET /api/tournaments/{id}/participants`
- `DELETE /api/tournaments/{id}/participants/{userId}` (host)

Players must have verified phones and can register only while a tournament is upcoming. Cancelled registrations can be activated again if capacity remains.

### Matches

- `POST /api/matches`
- `GET /api/matches/{id}`
- `GET /api/matches/{id}/live-score`
- `GET /api/matches/tournament/{tournamentId}`
- `PATCH /api/matches/{id}/score`
- `PATCH /api/matches/{id}/cancel`

Only the tournament host can create or cancel matches. The host and accepted scorer/referee participants can record scores. Match players must be actively registered.

PostgreSQL remains the source of truth. Live score reads use the Redis key `match:{matchId}` first and fall back to PostgreSQL. Score updates persist to `match_state` and append a `score_events` row before refreshing Redis, publishing on `match.score-updates`, and broadcasting over WebSocket.

`POST /api/matches` accepts the new participant list. The legacy `player1Id` and `player2Id` request fields remain supported temporarily so the existing mobile client does not break during rollout.

### Leaderboard

- `GET /api/tournaments/{id}/leaderboard`

### Users

- `GET /api/v1/users/me`
- `PUT /api/v1/users/me`
- `GET /api/v1/users/{id}`
- `GET /api/v1/users/{id}/stats`

Private profile responses include account/verification data. Public profiles and relational responses expose display-safe fields only.

## Notes

- UUIDs are used for all entities.
- Timestamps are managed via audited base entity fields.
- Secrets are sourced from environment variables.
- The project is structured to allow future additions like payments, feeds, analytics, image uploads, and notifications without moving to microservices.
