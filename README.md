# Summertech LMS (web app)

The Summertech learning platform's web front end — **a separate app from the marketing website**.
Students take courses; tutors edit their course content; admins provision accounts and enrolments.

This app holds **no database and no business logic**. Everything — accounts, sign-in, courses,
progress, tutor edits, uploads, email — lives in the **Summertech LMS API** (`../lms-api`), which
this app calls over HTTP. The two are deployed and scaled separately.

```
browser ──► lms (Next.js, this repo) ──HTTP + Bearer token──► lms-api (Express) ──► PostgreSQL
```

Design reference: [`../docs/lms-design.md`](../docs/lms-design.md).

## Stack

- **Next.js 15** (App Router) — server-rendered pages, server actions that call the API
- **Tailwind CSS v4** — same design tokens as the website (warm sand / emerald / orange)
- The API token is kept in an **httpOnly cookie**; browser JavaScript never sees it

## Roles

| Role | Can |
| --- | --- |
| `STUDENT` | See enrolled courses, work through lessons, track progress |
| `INSTRUCTOR` | All of the above + **Teaching**: edit modules, lessons, notes and resources of assigned courses |
| `MENTOR` | (reserved) same as student for now |
| `ADMIN` | Everything + **Admin**: create & suspend users, set roles, enrol learners, assign tutors |

There is no self sign-up: an admin creates each account. Permissions are enforced by the API on
every request; this app's checks only decide what to show.

## Run it locally

Start the API first (see `../lms-api/README.md`), then:

```bash
cd lms
cp .env.example .env          # API_URL=http://localhost:4000
npm install
npm run dev                   # http://localhost:3001
```

Demo accounts (password **`Passw0rd!`**) come from the API's seed: `admin@summertech.ac.ke`,
`grace@summertech.ac.ke` (tutor), `kelvin@summertech.ac.ke` (student). Magic-link emails are
printed in the **API's** terminal when no `RESEND_API_KEY` is set there.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `API_URL` | Base URL of the Summertech LMS API (required) |

Database, JWT secret, email and file-storage settings belong to the API, not here.

## Structure

```
src/
  middleware.ts          sends visitors without a session cookie to /login
  app/
    login/               password or magic-link sign-in
    api/auth/verify/     magic-link landing: API verifies, we set the cookie
    api/teach/upload/    forwards lesson uploads to the API with the session token
    (app)/               signed-in area: sidebar + top bar layout, error boundary
      dashboard/  courses/  courses/[slug]/  learn/[slug]/[lessonId]/
      teach/  teach/[slug]/            tutor course editor
      admin/  admin/users/  admin/enrollments/  admin/courses/
      settings/  help/
  lib/
    api.ts               fetch wrapper for the API (+ load() for pages)
    types.ts             API response types
    session.ts           session cookie
    auth.ts              current user / role guards (via GET /auth/me)
    actions.ts           server actions → API calls
    embed.ts progress.ts form.ts
  components/            Sidebar, CourseEditor, ResourceUploader, forms, …
```

## Deploy (Vercel)

1. Deploy the API somewhere reachable (see `../lms-api/README.md`).
2. Import this repo in Vercel and set `API_URL` to the API's public URL.
3. On the API, set `APP_URL` to this app's URL (magic links point here) and add it to
   `FRONTEND_ORIGIN`.

Uploads pass through this app on their way to the API, so on Vercel they're capped by the
platform's request-body limit (about 4.5 MB). For large videos, attach a YouTube/Drive link, or
host this app somewhere without that limit.

## Not done yet

- Mentor check-ins, at-risk detection, certificates, attendance (see the design doc's later phases)
- Rich text / file drag-and-drop in the lesson editor (Markdown textarea for now)
