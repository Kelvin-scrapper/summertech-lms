# Summertech LMS

The Summertech learning platform — **a separate app from the marketing website**. Students take
courses; tutors edit their course content; admins provision accounts and enrolments.

Design reference: [`../docs/lms-design.md`](../docs/lms-design.md).

## Stack

- **Next.js 15** (App Router) full-stack — pages, server actions, route handlers
- **PostgreSQL** + **Prisma**
- **Auth**: email + **hashed password** (scrypt) *or* magic link — no public sign-up; signed JWT session cookie via `jose`
- **Tailwind CSS v4** — same design tokens as the website (emerald / orange, DM Sans / Plus Jakarta)
- **Vercel Blob** for lesson file uploads (optional; links work without it)

## Roles

| Role | Can |
| --- | --- |
| `STUDENT` | See enrolled courses, work through lessons, track progress |
| `INSTRUCTOR` | All of the above + **Teaching** section: edit modules, lessons, notes and resources of assigned courses |
| `MENTOR` | (reserved) same as student for now |
| `ADMIN` | Everything + **Admin**: create & **approve/suspend** users, set roles, enrol learners, assign tutors |

**Access control:** there is no self sign-up. An admin creates each account (optionally with an
initial password) — that *is* the approval. An admin can suspend a user at any time (`Active` toggle
in Admin → Users) to revoke access without deleting anything; suspended users are signed out on
their next request. A user with no password can still receive a magic link and can set a password
from Settings.

## Run it locally

```bash
cd lms
cp .env.example .env          # then set AUTH_SECRET (openssl rand -base64 32)

# Postgres via Docker:
docker run --name summertech-lms-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=summertech_lms -p 5433:5432 -d postgres:16

npm install
npm run db:push               # create tables
npm run db:seed               # 5 courses + demo users
npm run dev                   # http://localhost:3001
```

### Signing in (dev)

Seed accounts — password **`Passw0rd!`** for all three:

| Email | Role |
| --- | --- |
| `admin@summertech.ac.ke` | ADMIN |
| `grace@summertech.ac.ke` | INSTRUCTOR (tutors Full-Stack + UI/UX) |
| `kelvin@summertech.ac.ke` | STUDENT (enrolled in Full-Stack) |

Go to `/login` and sign in with email + password. To test magic links instead, use
*"Email me a sign-in link"* — with no `RESEND_API_KEY` set, the link is printed to the terminal
running `npm run dev`.

## Environment variables

| Variable | Purpose | If unset |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | required |
| `AUTH_SECRET` | signs session + magic-link JWTs (≥ 16 chars); passwords use scrypt and need no key | required |
| `APP_URL` | base URL for magic-link URLs | `http://localhost:3001` |
| `RESEND_API_KEY` | send magic-link emails via Resend | links printed to server console |
| `EMAIL_FROM` | From address for emails | a default |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store token, for lesson file uploads | file upload disabled; attach resources by URL instead |

## Structure

```
prisma/schema.prisma     User, LoginToken, Course, Module, Lesson, Resource,
                         Enrollment, LessonProgress
prisma/seed.ts           demo data
src/
  middleware.ts          route protection (edge JWT check)
  app/
    login/               magic-link request
    api/auth/verify/     magic-link callback -> session
    api/teach/upload/    lesson file upload -> Vercel Blob
    (app)/               authed area: sidebar + topbar layout
      dashboard/         "My Learning Path"
      courses/  courses/[slug]/
      learn/[slug]/[lessonId]/     lesson player
      teach/  teach/[slug]/        tutor course editor
      admin/  admin/users/  admin/enrollments/  admin/courses/
      settings/  help/
  lib/                   prisma, session (jose), auth guards, magic-link,
                         email, actions (server actions), progress, embed
  components/             Sidebar, MagicLinkForm, CourseEditor, ResourceUploader, …
```

## Deploy (Vercel)

1. Push this folder as its own repo, import in Vercel (Root Directory = repo root).
2. Add a **Postgres** database (Vercel Postgres / Neon) and a **Blob** store; set the env vars.
3. Set `AUTH_SECRET`, `APP_URL` (your deployment URL), and optionally `RESEND_API_KEY`.
4. Build command `npm run build` runs `prisma generate` first. After first deploy, run
   `npx prisma migrate deploy` (or `db push`) against the production database, then seed if desired.

## Not done yet

- Mentor check-ins, at-risk detection, certificates, attendance (see the design doc's later phases)
- Rich text / file drag-and-drop in the lesson editor (Markdown textarea for now)
- Email verification of the magic-link sender domain
