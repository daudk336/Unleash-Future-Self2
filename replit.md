# Unleash Your Future Self

A guided future-self workshop website with separate attendee and instructor account access.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/unleash-future-self run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/unleash-future-self` — public site, account entry points, and role-specific portals
- `artifacts/api-server` — shared API, Clerk middleware, and account-role endpoint
- `lib/api-spec/openapi.yaml` — API contract source of truth

## Architecture decisions

- Replit-managed Clerk handles browser sign-in with session cookies; the API server also hosts Clerk's production proxy.
- Roles live in Clerk `publicMetadata.role`: `attendee` or `instructor`.
- Attendees can create accounts. The authenticated API only grants attendee access; it never promotes an account to instructor.
- PostgreSQL stores app data, not credentials: attendee profiles are keyed by Clerk user ID, with workshops, registrations, and attendance modeled separately.
- The attendee-access endpoint creates a minimal attendee profile row without copying email or password data from Clerk.
- Instructor accounts are invite-only and must be assigned the instructor role by an administrator before sign-in.

## Product

- Public workshop and instructor-program pages based on the existing Unleash Your Future Self site.
- Attendee login and self-registration, plus an attendee portal.
- Instructor login and a protected instructor portal; public instructor self-registration is disabled.
- PostgreSQL schemas are ready for profiles, workshops, registrations, and attendance; booking and workshop-management screens/APIs are not implemented yet.

## User preferences

- The user specified that instructors are invite-only and attendees can sign up themselves.

## Gotchas

- When changing the Clerk React package or React runtime, keep `react` and `react-dom` on the same supported version; see `.agents/memory/clerk-react-runtime.md`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
