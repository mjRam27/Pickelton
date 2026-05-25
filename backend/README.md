# Pickelton Backend

Pickelton is a modular monolith backend for tournament and community management across Pickleball and Badminton.

## Stack

- Java 21
- Spring Boot 3.x
- Maven
- PostgreSQL
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

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_PRIVATE_KEY`
- `JWT_PUBLIC_KEY`
- `JWT_EXPIRATION_MS` (`900000` recommended for 15-minute access tokens)
- `JWT_REFRESH_EXPIRATION_MS` (`2592000000` recommended for 30-day refresh sessions)
- `REDIS_URL`

`application.yml` reads these values from environment variables.
JWTs are signed with RS256. For local development only, the backend generates an ephemeral RSA key pair if the JWT keys are missing.
Redis stores rotating refresh sessions, revoked access tokens, phone OTPs, user cache entries, and shared request-rate counters.

## Run Locally

1. Start PostgreSQL with Docker:

```bash
docker compose up -d postgres
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
- `GET /api/matches/tournament/{tournamentId}`
- `PATCH /api/matches/{id}/score`
- `PATCH /api/matches/{id}/cancel`

Only the tournament host can create/cancel matches or record scores. Match players must be actively registered; completed score updates are written to score history and broadcast over WebSocket.

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
