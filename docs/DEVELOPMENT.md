# StudyMate Development Setup

## Prerequisites

- Java 21
- Docker Desktop with Docker Compose
- Node.js 20 or newer and pnpm

## Local database

1. Copy `.env.example` to `.env`.
2. Replace the example database password with a local secret.
3. Start PostgreSQL with `docker compose up -d postgres`.
4. Check the service with `docker compose ps`.

The database is available at `localhost:5432` by default. Its data is kept in the Docker volume `postgres-data`.

## Backend

Run the Spring Boot application from the repository root:

```powershell
.\mvnw.cmd spring-boot:run
```

The application reads the `SPRING_DATASOURCE_*` and `SERVER_PORT` environment variables. Their local examples are listed in `.env.example`; production values must be supplied by the deployment environment and never committed.

The default local `dev` profile creates one `Demo Student` account (`demo@studymate.local`) after Flyway has applied migrations. The React client sends `X-User-Id: 1` by default, so this account lets the Course, Document and Study Session flows work before real authentication is implemented. To use another local account, set `VITE_API_USER_ID` to its database ID before starting Vite.

This bootstrap account is restricted to the `dev` profile. A deployed environment must set an explicit non-dev profile and must not rely on `X-User-Id`; the future authentication module will replace this temporary Chapter 5 mechanism.

## Frontend

Run the following commands from `frontend/`:

```powershell
pnpm install
pnpm dev
```

Vite serves the development client at `http://localhost:5173`.

## Before opening a pull request

1. Run backend tests with `.\mvnw.cmd test`.
2. Run `pnpm build` in `frontend/`.
3. Confirm that no `.env`, dependency directory, build output, or secrets appear in `git status`.
4. Link changed requirements, AI evidence, and verification results in the pull request.
