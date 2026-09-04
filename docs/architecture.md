# NordicDrive Phase 1 Architecture

NordicDrive uses a TypeScript monorepo with clear product and platform boundaries.

```text
apps/web       Next.js 15 public/admin frontend
apps/api       NestJS domain API
packages/db    Prisma schema, migrations, generated client export
packages/types Shared contracts and enum-like API types
packages/config Shared ESLint and TypeScript config
```

The public site should favor React Server Components, metadata-rich routes, and ISR. The API owns domain rules, validation, authorization, and integrations. PostgreSQL is the source of truth, accessed through Prisma.

## Runtime Boundaries

```text
Browser
  -> Next.js app on Vercel
    -> NestJS API
      -> Prisma
        -> PostgreSQL / Supabase
```

Auth.js manages web sessions. NestJS validates bearer JWTs for protected API calls and enforces RBAC with guards.
