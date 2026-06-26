# Product Manager (Next.js + TypeScript)

A one-page CRUD demo: list, add, and delete products, with loading states,
error handling, and form validation on both client and server.

## Run it

```bash
npm install
npm run dev
```

## Git / GitHub setup

This project includes a `.gitignore` that excludes `node_modules/`, `.next/`,
and other generated files. **Do not remove or bypass it** — `node_modules`
contains compiled binaries that can exceed GitHub's 100MB file size limit
and will cause your push to be rejected.

If you're starting a fresh repo for this project:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

Because `.gitignore` is already in place *before* your first commit,
`node_modules` will never get added in the first place — so there's
nothing to clean up later.

Open http://localhost:3000

## Structure

```
app/
  layout.tsx           Root layout (required by App Router)
  page.tsx              The page: form + list + all client state/logic
  api/products/route.ts API route: GET (list), POST (create), DELETE (remove)
types.ts                Shared Product / ApiResponse types used by both sides
```

## Design decisions

- **Real API route, not just useState.** Products live behind
  `/api/products`, backed by an in-memory array on the server. This
  mirrors a real app's client/server split (fetch → JSON → render) instead
  of faking everything in component state, while still requiring zero
  external database setup.

- **Shared types (`types.ts`).** `Product` and `ApiResponse<T>` are defined
  once and imported by both the route handler and the page, so the client
  and server can't silently drift out of sync on field names or shapes.

- **Discriminated `ApiResponse<T>` envelope.** Every API response is either
  `{ ok: true, data }` or `{ ok: false, error }`. The client checks `json.ok`
  and TypeScript narrows the type automatically — no guessing whether a
  field is present.

- **Validation in two places, one source of truth for messages.**
  - Client-side (`validate()` in `page.tsx`) gives instant feedback per
    field (name required/length, price required/numeric/positive) without
    a network round trip.
  - Server-side (`validateNewProduct()` in `route.ts`) re-checks the same
    rules, because client validation can always be bypassed (devtools,
    curl, etc.) — the server is the actual gate.

- **Granular loading state**, not one big boolean:
  - `isLoading` — initial GET on mount
  - `isSubmitting` — the add-product POST (disables the form/button)
  - `deletingId` — *which row* is being deleted, so other rows stay
    interactive while one is in flight

- **Error handling.** Network/server failures set a dismissable-by-retry
  `pageError` banner; the `fetch` calls are wrapped in try/catch and check
  `res.ok` since `fetch` doesn't reject on HTTP error statuses.

- **Optimistic-but-confirmed updates.** On add/delete, the UI updates from
  the server's response (not by assuming success before the request
  completes), so the list never shows a product that wasn't actually
  persisted.

## What's intentionally skipped

Per the prompt, no custom CSS/responsive layout — just enough inline
styling to keep the structure legible. The focus is functionality, code
structure, and TypeScript usage.

## Note on verification

This sandbox has no network access, so I wasn't able to run `next build`
or `npm install` against the real `next`/`react` packages to compile this
end-to-end. I reviewed the code by hand for type consistency, correct
Next.js App Router conventions, and matching imports — but please run
`npm install && npm run dev` yourself as a first check before relying on it.
