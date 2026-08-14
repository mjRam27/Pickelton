# Pickelton

Pickelton is organized as a single repository with three separate client applications, one backend, and shared TypeScript packages.

## Structure

```text
backend/   Spring Boot API
mobile/    Expo Router application for Android, iOS, and Expo web
partner/   Next.js portal for venue and court partners
partner-backend/ Standalone Node.js/PostgreSQL API for the partner portal
web/       Next.js public/player-facing website
packages/  Shared API client, types, constants, and utilities
```

The older duplicate React Navigation mobile client has been retired. `mobile/` is the canonical mobile application.

## Requirements

- Node.js 22 LTS
- Java 21
- PostgreSQL
- Redis

## Install frontend dependencies

From the repository root:

```bash
npm install
```

## Run applications

```bash
npm run mobile
npm run mobile:tunnel
npm run web
npm run partner
```

When running both Next.js applications, assign one a different port, for example `npm run partner -- --port 3001`.

## Verify frontend code

```bash
npm run typecheck
npm test
npm run web:build
npm run partner:build
```

## Backend

Backend setup, environment variables, database instructions, and endpoints are documented in [`backend/README.md`](backend/README.md).

```powershell
cd backend
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
mvn spring-boot:run
```
