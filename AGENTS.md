# Agents Instructions

When making technical decisions for this project, always adhere to the following stack and conventions:

## Stack
- **Runtime & Tooling:** Bun
- **Database:** SQLite (via Bun's native sqlite driver)
- **ORM / Queries:** Drizzle ORM
- **Web Framework:** Hono
- **Templating:** Hono JSX templates
- **Identifiers:** UUIDv7
- **Architecture:** Modular Monolith using DDD + Clean Architecture concepts (with adapters, interfaces, and repositories).

## Code Conventions
- **Language:** All code, routing, and variable naming MUST be in English.
- **UI Localization:** All user-facing interfaces should be in Brazilian Portuguese (pt-br) using i18n where applicable.
- **Strict Guidelines:** The stack boundaries are strict. Do not introduce other runtimes (like Node.js), heavy UI frameworks (like React, unless explicitly as a client-side explicit SPA), or ORMs like Prisma. The primary interface is server-side rendered with Hono JSX.