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

`application.yml` reads these values from environment variables.
JWTs are signed with RS256. For local development only, the backend generates an ephemeral RSA key pair if the JWT keys are missing.

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
- `POST /api/v1/auth/verification-code`
- `POST /api/v1/auth/verify-code`
- `GET /api/v1/auth/me`

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
- `GET /api/clubs`
- `GET /api/clubs/{id}`
- `POST /api/clubs/{id}/join`

### Tournaments

- `POST /api/tournaments`
- `GET /api/tournaments`
- `GET /api/tournaments/{id}`

### Registrations

- `POST /api/tournaments/{id}/register`
- `GET /api/tournaments/{id}/participants`

### Matches

- `POST /api/matches`
- `GET /api/matches/{id}`
- `PATCH /api/matches/{id}/score`

### Leaderboard

- `GET /api/tournaments/{id}/leaderboard`

## Notes

- UUIDs are used for all entities.
- Timestamps are managed via audited base entity fields.
- Secrets are sourced from environment variables.
- The project is structured to allow future additions like payments, feeds, analytics, image uploads, and notifications without moving to microservices.
