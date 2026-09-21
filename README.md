# Learnova

**Learn Smarter. Grow Further.**

Learnova is an AI-powered Learning Management System (LMS) built as a full-stack
JavaScript web application. Students discover courses, learn through structured
lessons, practice with quizzes and assignments, track progress, earn
certificates, and receive personalized help from an AI Tutor.

- Roles: `STUDENT`, `INSTRUCTOR`, `ADMIN`
- The AI Tutor is a platform capability, not a user role.
- AI API keys live on the server only, never in the frontend.

> **Stage status:** Stages 1–5 are complete and verified against a local
> PostgreSQL 18 instance on port `5433`. Foundation (database migration, seed,
> health), Authentication & Authorization (register, login, logout, `/me`,
> role-based access control), the Public Website (course catalog, search,
> filters, course detail with curriculum), Course Management, and Student
> Enrollment & Learning are working. Instructors create courses, build
> curriculum (modules, lessons, resources), reorder content, preview, publish
> and archive their own courses; admins manage all courses and platform
> categories. Students browse courses, enroll, learn through the lesson
> interface, mark lessons complete and watch their server-calculated progress
> grow through "My Courses", "Continue Learning" and the student dashboard.
>
> Stage 6 (Quizzes) is complete and verified: instructors create and manage
> quizzes, questions and options inside the Course Builder; students take
> quizzes with server-side scoring, attempt limits, retake rules, and results
> with per-question review. Correct answers are never exposed to students
> before submission.
>
> Stage 7 (Assignments) is complete and verified: instructors create, edit and
> delete assignments inside the Course Builder; students view instructions,
> submit text and/or files, track submission status and view grades with
> instructor feedback; instructors review submissions and grade them with
> server-validated points and feedback. Files are type/size validated and
> stored outside the web root; downloads are ownership-checked. Graded
> submissions cannot be resubmitted.
>
> Stage 8 (Course Completion & Certificates) is complete and verified: when a
> student completes the final lesson, the server marks the enrollment
> `COMPLETED`, automatically issues a certificate (unique number + verification
> code) and sends a "Certificate ready" notification. Students can view a
> designed certificate, download it as a PDF, copy/share a public verification
> link, and verify certificates on a public page at `/certificates/verify/:code`.
> Re-issuing is idempotent (one certificate per student + course).
>
> Stage 9 (Instructor Dashboard & Analytics) is complete and verified:
> instructors get a real analytics overview (courses, distinct students,
> enrollments, completion rate, pending/graded submissions, quiz attempts,
> average quiz score, certificates) plus per-course statistics (enrollment
> breakdown, completion rate, lesson progress, quiz performance, assignment
> overview, certificates). A students page lists every learner across the
> instructor's courses with their progress percentage. All analytics routes are
> instructor-role protected and strictly ownership-scoped (403 for other
> instructors, 401 unauthenticated, 403 for students).
>
> Stage 10 (Admin Dashboard) is complete and verified: admins get a live
> dashboard (total users, pending instructors, active students, published
> courses, draft/approval snapshot, recent platform activity), full user
> management (students/instructors filters, instructor approval,
> suspend/reactivate), course management, category management, enrollment
> management, a certificate registry, and platform reports. Quiz and assignment
> oversight pages list every quiz and assignment platform-wide with attempt /
> submission statistics (questions, attempts, average score vs passing score;
> submissions, pending, graded, average grade). `/admin/login` redirects to the
> shared login, which already routes admins to their dashboard. All admin
> routes are role-protected (401 unauthenticated, 403 for students/instructors).
>
> Stage 11 (AI Tutor) is complete and verified: students open `/student/ai-tutor`
> (or jump in straight from a lesson via "Ask About This Lesson"), start
> context-bound conversations (attached to a course and/or lesson) or general
> chats, and chat with the tutor. Messages are sent to the configured AI
> provider (`AI_PROVIDER=openai` via the OpenAI Chat Completions API by
> default), with the course/lesson content and recent conversation history
> injected into the prompt. Conversational context: list conversations
> (with course/lesson titles), open one to see its full message history, auto
> titles ("New conversation" → first message) and per-conversation ownership
> (404 for other students). A rate limiter caps AI requests (30 per 15
> minutes). The AI API key stays server-side only; without a configured key the
> tutor answers `503 AI_NOT_CONFIGURED`, provider failures return
> `502 AI_PROVIDER_ERROR`, and `AI_PROVIDER=local` runs a built-in rule-based
> engine for development. New conversations validate that a lesson belongs to
> the selected course and that the course exists.
>
> Stage 12 (Notifications, Profile & Settings) is complete and verified:
> notifications are driven by real events — course enrollment, assignment
> submissions (to the course instructor), grading (to the student), account
> status changes and instructor approval (to the user), and issued certificates.
> Students and instructors get a notification bell in the dashboard header with
> a live unread-count badge and a dropdown (mark-as-read, mark-all-read, view
> all); shared notifications pages at `/student/notifications` and
> `/instructor/notifications` support read/unread state, per-item "mark read",
> "mark all read", and link-through to the related course, assignment or
> certificate. Notifications are strictly ownership-scoped (404 for another
> user's notification, 401 unauthenticated). Profile editing (`/users/profile`
> via the shared Profile page) now refreshes the auth context so the header
> name updates immediately; password change (`/users/password`) validates the
> current password and persists a new one (old credentials are rejected);
> preferences (`/users/preferences`) persist language, timezone and email/push
> notification toggles per user.
>
> Stage 13 (Polish, Accessibility & Security Hardening) is complete and verified:
> the frontend was audited for crash-resistance and accessibility — every data
> page now renders robust loading/error states with a "Try again" retry action
> (student dashboard, learning, quizzes, assignments, certificates, reports,
> settings, profile, notification bell), guarded optional data (`?? []`)
> throughout (learning page, quiz questions, builder preview, module summaries),
> and one real crash on the public certificate verification page was fixed.
> Accessibility: the dashboard navigation has an `aria-label` and visible focus
> rings, primary navigation shows a keyboard-visible focus outline, inputs
> across the Course Builder gained consistent focus rings, the course preview
> modal is keyboard-operable (Escape closes, dialog role), and low-contrast
> `text-navy/40` labels were bumped to `/60`. Security hardening on the backend:
> magic-byte validation rejects files whose contents do not match their claimed
> type (e.g. a renamed `.pdf` → 400), orphaned submission files are cleaned up
> on resubmit, invalid-UUID path parameters across admin/instructor routes now
> return 404 instead of a 500, the unread-notification endpoint got a dedicated
> high-frequency rate limiter, AI conversations are rate limited, `trust proxy`
> is configurable (`PROXY_COUNT`) so IP-based rate limits cannot be spoofed via
> forwarding headers, and unhandled promise/exception handlers shut the server
> down gracefully instead of leaving it in a broken state. Uploaded test
> artifacts were removed and ignored (`*.exe`, `*.pdf`, `*.txt` under `server/`).
> Backend service tests pass (6/6) and the client production build succeeds.
>
> Stage 14 (Full End-to-End Test) is complete and verified: all three role
> journeys were exercised end-to-end against the live API with fresh accounts.
> Student: registered, logged in, browsed and viewed a published course (built
> by the E2E instructor), enrolled (duplicate enroll → 409), started learning,
> completed all 4 lessons (progress 0→100%), took a quiz (20/20, passed, correct
> answers hidden from the student payload), submitted an assignment, received a
> grade with feedback (92/100; resubmit after grading → 409), the enrollment
> auto-completed and a certificate was issued automatically with a public
> verification link (verify works without auth, bogus code → 404, PDF download
> returns `application/pdf`). Instructor: registered PENDING (blocked from
> course management → 403), was approved by the admin, created a course with 2
> modules, 4 lessons, a 2-question quiz and a 100-point assignment, published
> it, saw it in the public catalog, viewed enrolled students, graded the
> submission, and saw live analytics (completion 100%, quiz 100%, grade 92).
> Admin: dashboard overview, user management, instructor approval, course
> management, category creation, enrollment registry, certificate registry and
> platform reports all returned live data. AI Tutor is now **live out of the
> box**: `AI_PROVIDER=local` runs the built-in rule-based engine (no API key,
> no external calls) and real tutor replies are returned end-to-end; setting
> `AI_PROVIDER=openai` plus `AI_API_KEY` swaps to real OpenAI responses
> (which currently return the documented `503 AI_NOT_CONFIGURED` while the key
> remains unset). Security matrix held:
> cross-role access → 403, unauthenticated → 401, cross-owner notifications /
> certificates → 404, unenrolled course content → 403, other instructor's
> course analytics → 403. No blockers were found; no code fixes were required.

---

## Course Management (Stage 4)

### Instructor Course Management

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/instructor/courses` | List courses owned by the instructor |
| `POST` | `/api/instructor/courses` | Create a draft course |
| `GET` | `/api/instructor/courses/:id` | Get a course with full curriculum |
| `GET` | `/api/instructor/courses/:id/preview` | Preview a course |
| `PATCH` | `/api/instructor/courses/:id` | Update course details |
| `POST` | `/api/instructor/courses/:id/publish` | Publish (requires a lesson) |
| `POST` | `/api/instructor/courses/:id/archive` | Archive |
| `DELETE` | `/api/instructor/courses/:id` | Delete a course |
| `POST` | `/api/instructor/courses/:courseId/modules` | Add a module |
| `POST` | `/api/instructor/courses/:courseId/modules/reorder` | Reorder modules |
| `PATCH`/`DELETE` | `/api/instructor/course-modules/:moduleId` | Edit/delete a module |
| `POST` | `/api/instructor/course-modules/:moduleId/lessons` | Add a lesson |
| `POST` | `/api/instructor/course-modules/:moduleId/lessons/reorder` | Reorder lessons |
| `PATCH`/`DELETE` | `/api/instructor/lessons/:lessonId` | Edit/delete a lesson |
| `POST` | `/api/instructor/lessons/:lessonId/resources` | Add a resource |
| `DELETE` | `/api/instructor/resources/:resourceId` | Delete a resource |

### Admin Management

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET`/`POST` | `/api/admin/categories` | List/create categories |
| `PATCH`/`DELETE` | `/api/admin/categories/:id` | Edit/delete a category (delete blocked while it has courses) |
| `GET` | `/api/admin/courses` | List all courses (search/status filter, paginated) |
| `PATCH` | `/api/admin/courses/:id` | Update course status/details |
| `DELETE` | `/api/admin/courses/:id` | Delete any course |

Instructors can only modify courses they own; admins can modify everything.
Only approved instructors can access course management and publish courses.
Publishing requires at least one module containing a lesson.

---

## Student Enrollment & Learning (Stage 5)

### Enrollment

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/enrollments` | Enroll in a published course (409 if already active) |
| `GET` | `/api/enrollments` | My courses with lessons, progress and "continue" guidance |
| `GET` | `/api/enrollments/:courseId` | Enrolled course detail with curriculum + completion state |
| `DELETE` | `/api/enrollments/:courseId` | Cancel an active enrollment |

### Progress & Learning

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/progress/summary` | Overall progress, statistics and next lesson to continue |
| `POST` | `/api/progress/lessons/:lessonId/complete` | Mark a lesson complete (server-calculated progress) |
| `POST` | `/api/progress/lessons/:lessonId/uncomplete` | Mark a lesson incomplete |

Progress is always calculated on the backend; the frontend never submits a
percentage. When every lesson in a course is complete, the enrollment is
automatically marked `COMPLETED`.

All enrollment/progress routes are protected by `authenticate`,
`loadAuthenticatedUser` and `requireStudent`. Instructors and admins receive
`403`; unauthenticated requests receive `401`. Completing a lesson in a course
you are not enrolled in is rejected with `403`.

---

## Quizzes (Stage 6)

### Instructor Quiz Management

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/instructor/course-modules/:moduleId/quizzes` | Create a quiz in a module |
| `PATCH` | `/api/instructor/quizzes/:quizId` | Update quiz details (title, description, passing score, time limit, max attempts, retake) |
| `DELETE` | `/api/instructor/quizzes/:quizId` | Delete a quiz |
| `POST` | `/api/instructor/quizzes/:quizId/questions` | Add a question with options |
| `PATCH` | `/api/instructor/questions/:questionId` | Update a question and replace its options |
| `DELETE` | `/api/instructor/questions/:questionId` | Delete a question |

Supported question types are `MULTIPLE_CHOICE` and `TRUE_FALSE`. Every question
needs at least two options with at least one marked correct; true/false
questions must have exactly two options. The instructor course payload includes
each quiz with its full question + option list.

### Student Quiz-taking

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/quizzes/:quizId` | Fetch a quiz for a student with prior attempt results |
| `POST` | `/api/quizzes/:quizId/attempts` | Submit answers; the server scores, stores, and returns the result |

Scoring is always server-side: the student answers are matched against the
correct answers stored in the database. The quiz detail returned to students
never includes correct answers. Attempt limits and retake rules are enforced on
the server. The results include score, percentage, pass/fail, and a per-question
review with explanations.

All quiz endpoints require an enrolled student; unauthorized roles receive
`403`, unauthenticated requests receive `401`.

---

## Assignments (Stage 7)

### Instructor Assignment Management

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/instructor/course-modules/:moduleId/assignments` | Create an assignment in a module |
| `PATCH` | `/api/instructor/assignments/:assignmentId` | Update title, instructions, due date, points |
| `DELETE` | `/api/instructor/assignments/:assignmentId` | Delete an assignment |
| `GET` | `/api/instructor/assignments` | List the instructor's assignments with submission counts |
| `GET` | `/api/instructor/assignments/:assignmentId` | Assignment detail with all submissions |
| `PATCH` | `/api/instructor/submissions/:submissionId/grade` | Grade a submission (points + feedback) |

### Student Assignment Flow

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/assignments` | List assignments from enrolled (active/completed) courses |
| `GET` | `/api/assignments/:assignmentId` | Assignment detail with the student's own submission |
| `POST` | `/api/assignments/:assignmentId/submissions` | Submit text and/or a file (multipart `file` or JSON `text`) |
| `GET` | `/api/submissions/:submissionId/file` | Download a submission file |

Rules enforced on the server:

- Submission must include text and/or a file (`400` otherwise).
- Allowed file types: PDF, DOC, DOCX, TXT, PNG, JPG, GIF, WEBP; max 10 MB.
- A graded submission cannot be resubmitted (`409`).
- Grade cannot exceed the assignment's point value (`400`).
- Only the owning student, the course instructor, or an admin may download a
  submission file (`403` otherwise); unenrolled students cannot fetch
  assignments for courses they are not enrolled in.
- All assignment/submission routes require authentication; role checks are
  enforced server-side.

---

## Course Completion & Certificates (Stage 8)

### Completion

- Completing the final lesson of a course marks the enrollment `COMPLETED`.
- Completion is always detected server-side from lesson-progress rows; the
  backend never trusts a client-supplied percentage.
- Un-completing a lesson reverts the enrollment to `ACTIVE` but does not
  revoke an already-issued certificate.

### Certificates

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/certificates` | List the student's certificates (auth, student) |
| `GET` | `/api/certificates/:certificateId` | Single certificate detail (auth, owner) |
| `GET` | `/api/certificates/:certificateId/download` | Download the certificate PDF (auth, owner) |
| `POST` | `/api/certificates/issue` | Issue the certificate for a completed course (idempotent) |
| `GET` | `/api/certificates/verify/:verificationCode` | Public verification lookup (no auth) |

Behavior:

- A certificate is issued automatically when an enrollment becomes `COMPLETED`,
  and a `CERTIFICATE` notification is created for the student.
- Each certificate has a unique certificate number and a unique verification
  code; there is exactly one certificate per (student, course).
- Only the owning student may view/download a certificate (`404` otherwise);
  unauthenticated requests receive `401`.
- The public verification page is `/certificates/verify/:verificationCode`.

---

## Instructor Dashboard & Analytics (Stage 9)

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/instructor/analytics` | Overview metrics + per-course statistics for the instructor's own courses |
| `GET` | `/api/instructor/students` | Every enrolled student across the instructor's courses with progress |
| `GET` | `/api/instructor/courses/:courseId/analytics` | Detailed stats for a single owned course |
| `GET` | `/api/instructor/courses/:courseId/students` | Enrolled students of one owned course with progress |

Overview metrics include total courses, published/draft/archived, distinct
students, enrollments (active/completed), completion rate, pending and graded
submissions, submitted quiz attempts, average quiz score, certificates issued,
and average rating. Per-course statistics include an enrollment status
breakdown, completion rate, lesson progress, quiz performance (attempts,
passed, average score), assignment overview (total, pending, graded, average
grade) and certificates.

All analytics routes require an approved instructor and are ownership-scoped:
an instructor can only read statistics for courses they own (`403` otherwise),
students receive `403`, unauthenticated requests receive `401`.

---

## Admin Dashboard & Oversight (Stage 10)

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/admin/overview` | Platform metrics (users, students, instructors, pending instructors, courses, enrollments, certificates) |
| `GET` | `/api/admin/reports` | Enrollment/submission status counts, certificates, submitted quiz attempts |
| `GET` | `/api/admin/activity` | Recent platform activity (registrations, enrollments, publications, certificates, grading) |
| `GET`/`POST` | `/api/admin/categories` | List/create categories |
| `PATCH`/`DELETE` | `/api/admin/categories/:id` | Edit/delete a category (delete blocked while it has courses) |
| `GET` | `/api/admin/courses` | List all courses (search/status filter, paginated) |
| `PATCH` | `/api/admin/courses/:id` | Update course status/details |
| `DELETE` | `/api/admin/courses/:id` | Delete any course |
| `GET` | `/api/admin/users` | List users (search/role/status filter, paginated) |
| `PATCH` | `/api/admin/users/:id/status` | Approve/suspend/reactivate a user account |
| `GET` | `/api/admin/enrollments` | List all enrollments (search/status, paginated) |
| `PATCH` | `/api/admin/enrollments/:id/status` | Activate/cancel/reactivate an enrollment |
| `GET` | `/api/admin/certificates` | List all certificates (search, paginated) |
| `GET` | `/api/admin/quizzes` | Quiz oversight — every quiz with course/instructor, question count, attempts, average score |
| `GET` | `/api/admin/assignments` | Assignment oversight — every assignment with course/instructor, submissions, pending, graded, average grade |

All admin routes require an authenticated `ADMIN` account: unauthenticated
requests receive `401`, students and instructors receive `403`.

---

## AI Tutor (Stage 11)

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/ai/conversations` | List the student's conversations (with course/lesson titles and message counts) |
| `POST` | `/api/ai/conversations` | Start a conversation (optional `courseId`/`lessonId` to bind context) |
| `GET` | `/api/ai/conversations/:id` | Read a conversation with its full message history (owner-only) |
| `POST` | `/api/ai/conversations/:id/messages` | Send a message; gets a tutor reply (rate limited to 30 per 15 min) |

All AI routes require an authenticated `STUDENT` account and are strictly
ownership-scoped (404 for another student's conversation). Provider responses
go through `src/services/ai.provider.js`; the configured model
(`AI_MODEL`, default `gpt-4o-mini`) is called via the OpenAI Chat Completions
API. Conversations carry a friendly default title ("Ask about <lesson>")
when created with context.

---

## Notifications, Profile & Settings (Stage 12)

### Notifications

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/notifications` | List the current user's notifications (newest first, up to 25) |
| `GET` | `/api/notifications/unread-count` | Number of unread notifications |
| `PATCH` | `/api/notifications/:id/read` | Mark one notification as read (owner-only, 404 otherwise) |
| `PATCH` | `/api/notifications/read-all` | Mark all notifications as read |

Notifications are created for real events: enrollment, submission
(`SUBMISSION`, to the course instructor), grading (`GRADING`, to the student),
account status changes / instructor approval (`ACCOUNT`), and issued
certificates (`CERTIFICATE`). All routes require an authenticated account and
are strictly scoped to `req.user.id`.

### Profile, Password & Preferences

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/users/profile` | Current user profile (names, title, bio, role, preferences) |
| `PATCH` | `/api/users/profile` | Update first/last name, title, bio |
| `PATCH` | `/api/users/password` | Change password (`currentPassword` verified, `newPassword` validated) |
| `PATCH` | `/api/users/preferences` | Save language, timezone, email/push notification toggles (upsert) |

Profile and preferences are stored per user (defaults: `en` / `UTC` /
email on / push off), and password changes invalidate the old credentials (401
on next login). The shared Profile/Settings pages live on
`/student|instructor|admin/:profile|settings`.

---

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Lucide React
- Axios

### Backend
- Node.js
- Express
- JavaScript
- Prisma ORM
- PostgreSQL
- JWT + bcrypt

---

## Project Structure

```text
learnova/
├── client/
│   ├── public/
│   │   ├── images/
│   │   └── favicon/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── common/
│       │   ├── layout/
│       │   ├── courses/
│       │   ├── learning/
│       │   ├── quizzes/
│       │   ├── assignments/
│       │   ├── certificates/
│       │   └── ai/
│       ├── pages/
│       │   ├── public/
│       │   ├── auth/
│       │   ├── student/
│       │   ├── instructor/
│       │   └── admin/
│       ├── layouts/
│       ├── routes/
│       ├── hooks/
│       ├── context/
│       ├── services/
│       ├── utils/
│       ├── constants/
│       ├── App.jsx
│       └── main.jsx
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── app.js
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── uploads/
│   ├── .env
│   └── package.json
├── .gitignore
├── README.md
└── package.json
```

---

## Prerequisites

- Node.js 20+ (tested with v24)
- npm 10+
- PostgreSQL 16+ (tested against 18 on port 5433)
- Git (optional)

---

## PostgreSQL Setup

Learnova targets the PostgreSQL 18 instance on port `5433` (superuser `postgres`).

1. Confirm the instance is running (Windows service `postgresql-x64-18`).
2. Create the `learnova` database if it does not exist:

   ```bash
   psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE learnova;"
   ```

The development `.env` currently uses the local `postgres` superuser password.

---

## Environment Variables

Create `server/.env` from the template with the local PostgreSQL credentials,
then run the commands below. The default local setup uses PostgreSQL 18 on port
`5433` (superuser `postgres`).

```text
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5433/learnova
JWT_SECRET=change_me_to_a_long_random_string
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
# AI Tutor (Stage 11)
AI_PROVIDER=openai
AI_API_KEY=sk-...            # leave unset → tutor replies 503 AI_NOT_CONFIGURED
AI_MODEL=gpt-4o-mini
```

| Variable         | Description                                    |
| ---------------- | ---------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string (Prisma)          |
| `JWT_SECRET`     | Secret used to sign JWTs (never commit)        |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d`                      |
| `PORT`           | Backend port (default `5000`)                  |
| `CLIENT_URL`     | Frontend origin allowed by CORS                |
| `PROXY_COUNT`    | Number of trusted proxy hops for `trust proxy`; keep `0` when running directly (rate-limit safety) |
| `NODE_ENV`       | `development` / `production`                   |
| `AI_PROVIDER`    | `openai` (real responses, default) or `local` (rule-based engine for dev) |
| `AI_API_KEY`     | OpenAI API key; **server-side only**, never exposed to the browser |
| `AI_MODEL`       | OpenAI model id (default `gpt-4o-mini`)        |

Never commit `.env`. A safe `.env.example` is provided.

---

## Installation

From the project root:

```bash
npm install:all
```

Or step by step:

```bash
npm install
npm --prefix server install
npm --prefix client install
```

---

## Prisma Setup

```bash
# Validate the schema (no database connection required)
npm run db:validate

# Generate the Prisma client (no database connection required)
npm run db:generate
```

## Database Migration

Requires a working `DATABASE_URL`:

```bash
npm run db:migrate
```

This executes `prisma migrate dev --name init`.

## Seed Command

Requires a successful migration:

```bash
npm run db:seed
```

---

## How to Run Frontend

```bash
npm run client
```

Frontend: http://localhost:5173

## How to Run Backend

```bash
npm run server
```

Backend: http://localhost:5000

## Run Both Together

```bash
npm run dev
```

---

## Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Learnova API is running",
  "timestamp": "ISO_TIMESTAMP"
}
```

---

## Auth Endpoints

- `POST /api/auth/register` — create a student/instructor account. Instructors
  are created with `PENDING` status until an admin approves them.
- `POST /api/auth/login` — exchange email + password for a JWT. Pending
  instructors can log in; suspended accounts are blocked.
- `GET /api/auth/me` — return the authenticated user (bearer token).
- `POST /api/auth/logout` — end a client session (stateless JWT; the client
  discards the token).

Responses never include password hashes.

## Public Course Endpoints (Stage 3)

- `GET /api/categories` — list categories with course counts.
- `GET /api/courses` — list published courses. Supports `search`, `category`
  (id or slug), `level` (`BEGINNER`/`INTERMEDIATE`/`ADVANCED`), `instructor`,
  `minRating`, `minDuration`, `maxDuration`, `sort`
  (`popular`/`newest`/`rating`/`title`), `page`, and `limit` (max 24).
- `GET /api/courses/:identifier` — published course detail by id or slug, with
  modules, lessons, quizzes and assignments in the curriculum.

See the **Course Management (Stage 4)** table above for instructor/admin
course management endpoints.

---

## Development Credentials (DEVELOPMENT-ONLY)

These accounts are created by the seed script. Use them in development only;
never in production.

| Role        | Email                        | Password          |
| ----------- | ---------------------------- | ----------------- |
| Admin       | `admin@learnova.local`       | `Admin@123456`    |
| Instructor  | `instructor@learnova.local`  | `Instructor@1234` |
| Instructor  | `instructor2@learnova.local` | `Instructor@1234` |
| Student     | `student@learnova.local`     | `Student@123456`  |
| Student     | `student2@learnova.local`    | `Student@123456`  |
| Student     | `student3@learnova.local`    | `Student@123456`  |

All passwords are hashed with bcrypt before storage.

---

## Important Security Notes

- JWT + bcrypt authentication; passwords never stored in plaintext.
- Passwords hashes are never returned from any API response.
- Role information comes from the authenticated backend user, never from the
  frontend.
- Helmet sets secure HTTP headers.
- CORS is restricted to `CLIENT_URL`.
- JSON body size is limited.
- Basic API rate limiting is enabled.
- Central error handler hides stack traces in production.
- AI keys (added in a later stage) remain server-side only.
- The `postgres` superuser / author role must not be used in production —
  create a dedicated least-privilege database role.