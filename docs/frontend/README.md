# Frontend Development Notes

This frontend is a React + TypeScript app using Vite, React Query, Zustand, Axios and Zod.

## Commands

- `npm run dev` - start local development server
- `npm run build` - type-check and production build
- `npm test` - run Vitest test suite once
- `npm run test:watch` - run Vitest in watch mode

## Testing Standard

- Unit tests are written with **Vitest**.
- Keep tests close to code where possible (`*.test.ts` / `*.test.tsx`).
- Priority test targets:
  - pure helper logic (`src/lib/*`)
  - hooks with permission/auth behavior (`src/hooks/*`)
  - state bootstrap/auth branching (`src/store/*`)

## API + Validation Conventions

- All HTTP calls go through `src/lib/api.ts`.
- Parse external payloads with Zod schemas from `src/schemas/*` before writing into state.
- Keep server error messaging via `getErrorMessage(...)` so FluentValidation/API messages surface in UI.

## Access Control

- `useAccess()` is the canonical source for UI permissions.
- Admin pages are route-guarded and should never assume access based on URL alone.

