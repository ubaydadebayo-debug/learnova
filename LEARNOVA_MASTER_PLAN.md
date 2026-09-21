# Learnova — Web Application Master Plan & OpenCode Build Specification

**Project:** Learnova  
**Product:** AI-powered Learning Management System (LMS)  
**Document type:** Master product plan + staged OpenCode implementation prompt  
**Status:** Planning complete — ready for staged implementation  
**Rule:** OpenCode must follow this document stage by stage and must not skip ahead.

---

# 1. Product Overview

Learnova is an AI-powered learning platform where students can discover courses, learn through structured lessons, practice with quizzes and assignments, track their progress, earn certificates, and receive personalized help from an AI Tutor.

Instructors can create and manage courses, lessons, quizzes, assignments, students, grading, and basic analytics.

Administrators can manage users, instructors, courses, categories, enrollments, certificates, and platform reports.

## Brand

**Learnova**

## Positioning

> An AI-powered learning platform that helps people learn, practice, track progress, and grow with confidence.

## Hero Headline

**Learn Smarter. Grow Further.**

## Hero Supporting Copy

> Learnova brings courses, practice, progress tracking, and AI-powered guidance together in one learning platform built to help you learn with confidence.

## Primary CTA

**Start Learning**

## Secondary CTA

**Explore Courses**

---

# 2. Product Principles

Every implementation decision should follow these principles:

1. Learning comes first.
2. The interface should be simple to understand.
3. The next action should always be obvious.
4. Student progress should be visible.
5. AI should assist learning, not replace it.
6. Backend security must never depend on frontend checks.
7. Mobile responsiveness is required.
8. Build the MVP before advanced features.
9. Prefer reusable components and maintainable code.
10. Do not create fake functionality where real functionality is required.

---

# 3. User Roles

Learnova has three authenticated roles:

- `STUDENT`
- `INSTRUCTOR`
- `ADMIN`

The AI Tutor is a platform capability, not a user role.

---

# 4. MVP Scope

## Build in MVP

### Platform

- Authentication
- Role-based access
- Profiles
- Settings
- Notifications
- Responsive UI
- Search and filtering
- Error/loading/empty states
- Security

### Student

- Dashboard
- Browse courses
- Course details
- Enrollment
- My Courses
- Structured learning
- Lesson completion
- Progress tracking
- Quizzes
- Assignments
- Grades and feedback
- Certificates
- AI Tutor
- Notifications
- Profile
- Settings

### Instructor

- Dashboard
- Course creation
- Course editing
- Course builder
- Modules
- Lessons
- Quizzes
- Assignments
- Publishing
- Student management
- Grading
- Basic analytics
- Notifications
- Profile
- Settings

### Admin

- Dashboard
- User management
- Student management
- Instructor management
- Instructor approval
- Course management
- Category management
- Enrollment management
- Quiz/assignment oversight
- Certificate management
- Reports
- Settings

### AI Tutor

- Explain lessons
- Simplify topics
- Generate practice questions
- Quiz students
- Study assistance
- Study plans
- Conversation history
- Course/lesson context

---

# 5. Explicitly Excluded From MVP

Do NOT implement these unless a later stage explicitly enables them:

- Payments
- Subscriptions
- Live classes
- Video conferencing
- Discussion forums
- Social feed
- Gamification
- Leaderboards
- Native mobile apps
- Organization/school accounts
- Marketplace
- Instructor payouts
- AI voice tutor
- AI video generation
- Advanced AI agents
- Advanced recommendation engine

---

# 6. Public Website

## `/`

Homepage sections:

1. Navbar
2. Hero
3. Trust/benefits
4. Why Learnova
5. Featured Courses
6. AI Tutor introduction
7. How It Works
8. Learning Progress section
9. Instructor CTA
10. Testimonials
11. Final CTA
12. Footer

Hero:

**Learn Smarter. Grow Further.**

Buttons:

- Start Learning
- Explore Courses

## `/courses`

Features:

- Search
- Category filter
- Level filter
- Duration filter
- Instructor filter
- Rating filter
- Sorting
- Pagination
- Course cards
- Empty state

## `/course/:id`

Contains:

- Course title
- Description
- Instructor
- Category
- Level
- Duration
- Student count
- Rating
- Learning outcomes
- Curriculum
- Enrollment CTA

CTA:

**Enroll Now**

## `/how-it-works`

Explain:

`Create Account → Choose Course → Learn & Practice → Track Progress → Complete → Grow`

## `/ai-tutor`

Explain AI Tutor capabilities:

- Explain
- Simplify
- Practice
- Quiz
- Study plans
- Course assistance

CTA:

**Meet Your AI Tutor**

## `/about`

- Learnova story
- Mission
- Vision
- Values

## `/contact`

Fields:

- Name
- Email
- Subject
- Message

CTA:

**Send Message**

---

# 7. Authentication

Routes:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password/:token`

Registration:

- First name
- Last name
- Email
- Password
- Confirm password
- Account type

Public registration may create:

- Student
- Instructor

Admin accounts must not be created through unrestricted public registration.

Authentication requirements:

- bcrypt password hashing
- JWT authentication
- Protected routes
- Role-based authorization
- Authenticated `/me` endpoint
- Safe user responses
- Never expose password hashes

---

# 8. Student Application

Navigation:

- Dashboard
- My Courses
- AI Tutor
- Progress
- Assignments
- Certificates
- Notifications
- Profile
- Settings
- Logout

## `/student/dashboard`

Display:

- Welcome message
- Continue Learning
- Active courses
- Progress statistics
- Quiz statistics
- Assignment status
- Certificates
- Notifications
- AI Tutor shortcut

## `/student/courses`

Display:

- Enrolled courses
- Progress
- Status
- Continue Learning

## `/student/courses/:id`

Display course-specific student learning information.

## `/student/learn/:courseId/:lessonId`

Learning interface:

- Course sidebar
- Module list
- Lesson content
- Video support where available
- Resources
- Progress
- Previous lesson
- Next lesson
- Complete lesson
- Ask AI

CTA:

**Ask About This Lesson**

## `/student/quizzes/:id`

Quiz flow:

`Introduction → Start → Questions → Submit → Server Scoring → Results`

Results:

- Score
- Percentage
- Correct answers
- Incorrect answers
- Pass/fail
- Review
- Retake where allowed

## Assignments

Routes:

- `/student/assignments`
- `/student/assignments/:id`

Student can:

- View instructions
- Write text
- Upload supported files
- Submit
- Track status
- View grade
- View instructor feedback

## Progress

`/student/progress`

Display:

- Overall progress
- Course progress
- Lesson completion
- Quiz performance
- Learning activity

## Certificates

`/student/certificates`

Actions:

- View
- Download
- Share
- Verify

Public verification:

`/certificates/verify/:verificationCode`

---

# 9. Instructor Application

Navigation:

- Dashboard
- My Courses
- Create Course
- Students
- Assignments
- Quizzes
- Analytics
- Notifications
- Profile
- Settings
- Logout

Routes:

- `/instructor/dashboard`
- `/instructor/courses`
- `/instructor/courses/create`
- `/instructor/courses/:id/edit`
- `/instructor/courses/:id/builder`
- `/instructor/students`
- `/instructor/assignments`
- `/instructor/assignments/:id`
- `/instructor/quizzes`
- `/instructor/analytics`
- `/instructor/notifications`
- `/instructor/profile`
- `/instructor/settings`

## Course Builder

Structure:

```text
Course
 ├── Module
 │    ├── Lesson
 │    ├── Lesson
 │    └── Quiz
 └── Module
      ├── Lesson
      └── Assignment
```

Instructor can:

- Create
- Edit
- Delete
- Reorder
- Preview
- Publish
- Archive

Every course must have an `instructorId`.

An instructor can modify only courses they own unless they are an admin.

---

# 10. Instructor Approval

Instructor account status:

- `PENDING`
- `APPROVED`
- `SUSPENDED`

Only approved instructors can publish courses.

Admin controls approval.

---

# 11. Admin Application

Routes:

- `/admin/login`
- `/admin/dashboard`
- `/admin/users`
- `/admin/students`
- `/admin/instructors`
- `/admin/courses`
- `/admin/categories`
- `/admin/enrollments`
- `/admin/quizzes`
- `/admin/assignments`
- `/admin/certificates`
- `/admin/reports`
- `/admin/settings`

Admin can manage the platform globally.

## Dashboard

Statistics:

- Total users
- Students
- Instructors
- Courses
- Enrollments
- Completed courses
- Platform activity

Recent activity:

- Registrations
- Course publications
- Enrollments
- Certificates
- Grading activity

---

# 12. Course Structure

Course hierarchy:

```text
Course
 ├── Module
 │    ├── Lesson
 │    ├── Lesson
 │    └── Quiz
 └── Module
      ├── Lesson
      └── Assignment
```

Modules and lessons have a position/order field.

Course statuses:

- `DRAFT`
- `PUBLISHED`
- `ARCHIVED`

Course levels:

- `BEGINNER`
- `INTERMEDIATE`
- `ADVANCED`

---

# 13. Progress System

Progress is tracked at lesson level.

Relationship:

`Student → Progress → Lesson`

Example:

```text
HTML Basics       100%
CSS Basics         60%
JavaScript          0%
```

Overall course progress must be calculated by the backend.

Do not trust a percentage submitted by the frontend.

---

# 14. Quiz System

Models:

```text
Quiz
 └── Question
      └── QuestionOption
```

Attempts:

```text
Student
 └── QuizAttempt
      └── StudentAnswer
           └── Question
```

Initial question types:

- `MULTIPLE_CHOICE`
- `TRUE_FALSE`

When submitted:

1. Receive student answers.
2. Load actual correct answers from the server.
3. Calculate score server-side.
4. Save attempt.
5. Return result.

Never expose correct answers unnecessarily before submission.

---

# 15. Assignment System

Supported MVP submission types:

- Text
- PDF
- DOC
- DOCX
- Images where appropriate

Backend must validate:

- File type
- File size
- Filename
- Upload permissions

Never allow executable uploads.

Assignment states:

- `PENDING`
- `SUBMITTED`
- `GRADED`
- `LATE`

---

# 16. Certificate System

Certificate contains:

- Student name
- Course
- Instructor
- Completion date
- Certificate number
- Verification code
- Learnova branding

Requirements:

- Certificate number unique
- Verification code unique

Public verification route:

`/certificates/verify/:verificationCode`

---

# 17. AI Tutor

Routes:

- `/student/ai-tutor`
- `/student/ai-tutor/:conversationId`

Core actions:

- Explain this lesson
- Simplify this topic
- Quiz me
- Give me practice questions
- Help me study
- Create a study plan

AI context may include:

- Course
- Module
- Lesson
- Lesson content
- Conversation history
- Student question

Architecture:

```text
Student
  ↓
React
  ↓
Express API
  ↓
Authentication
  ↓
Conversation ownership check
  ↓
AI Service
  ↓
AI Provider
  ↓
Save response
  ↓
React
```

The AI API key must remain on the server.

AI behavior:

- Explain clearly
- Adapt to learner level
- Encourage understanding
- Ask guiding questions
- Generate practice
- Prefer course context
- Avoid pretending to know unavailable information
- Do not simply complete active graded assignments for students

---

# 18. Notifications

Examples:

- Course completed
- Assignment graded
- Certificate ready
- New course
- New lesson
- Instructor feedback

Actions:

- View
- Mark one as read
- Mark all as read

---

# 19. Settings

## Student/Instructor

- Profile
- Password
- Email notifications
- Push notifications
- Language
- Timezone

## Admin

Platform-level settings.

---

# 20. Database Models

Required Prisma models:

- `User`
- `Category`
- `Course`
- `Module`
- `Lesson`
- `Resource`
- `Enrollment`
- `Progress`
- `Quiz`
- `Question`
- `QuestionOption`
- `QuizAttempt`
- `StudentAnswer`
- `Assignment`
- `Submission`
- `Certificate`
- `AIConversation`
- `AIMessage`
- `Notification`
- `UserPreference`

Important constraints:

- User email unique
- Enrollment unique per student/course
- Progress unique per student/lesson
- Certificate number unique
- Verification code unique
- Appropriate indexes
- Proper foreign keys
- Proper cascading behavior

Never store plaintext passwords.

---

# 21. Backend Architecture

Stack:

- Node.js
- Express
- Prisma
- PostgreSQL
- JWT
- bcrypt

Architecture:

```text
Route
 ↓
Controller
 ↓
Service
 ↓
Prisma
 ↓
PostgreSQL
```

Controllers handle HTTP requests/responses.

Services contain business logic.

Keep database logic and business logic out of route files where practical.

---

# 22. API Groups

Base:

`/api`

Groups:

- `/auth`
- `/users`
- `/courses`
- `/categories`
- `/modules`
- `/lessons`
- `/enrollments`
- `/progress`
- `/quizzes`
- `/assignments`
- `/certificates`
- `/ai`
- `/notifications`
- `/instructor`
- `/admin`

Health:

`GET /api/health`

Expected shape:

```json
{
  "success": true,
  "message": "Learnova API is running",
  "timestamp": "ISO_TIMESTAMP"
}
```

---

# 23. Authorization

Backend middleware:

- `authenticate`
- `requireStudent`
- `requireInstructor`
- `requireAdmin`

Frontend route protection is for UX.

Backend authorization is the real security boundary.

Examples:

- Student cannot access admin APIs.
- Instructor cannot access another instructor's course.
- Student cannot grade assignments.
- Unapproved instructor cannot publish.
- Admin can manage platform resources.

---

# 24. API Response Standard

Success:

```json
{
  "success": true,
  "message": "Course retrieved successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Course not found",
  "error": "COURSE_NOT_FOUND"
}
```

Use appropriate HTTP status codes:

- `200 OK`
- `201 CREATED`
- `400 BAD REQUEST`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`
- `404 NOT FOUND`
- `409 CONFLICT`
- `422 VALIDATION ERROR`
- `429 TOO MANY REQUESTS`
- `500 SERVER ERROR`

---

# 25. Frontend Architecture

Use reusable components.

Suggested:

```text
client/src/
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│   ├── courses/
│   ├── learning/
│   ├── quizzes/
│   ├── assignments/
│   ├── certificates/
│   └── ai/
├── pages/
│   ├── public/
│   ├── auth/
│   ├── student/
│   ├── instructor/
│   └── admin/
├── layouts/
├── routes/
├── hooks/
├── context/
├── services/
├── utils/
├── constants/
├── App.jsx
└── main.jsx
```

API services:

```text
api.js
authService.js
courseService.js
enrollmentService.js
progressService.js
quizService.js
assignmentService.js
certificateService.js
aiService.js
notificationService.js
instructorService.js
adminService.js
```

---

# 26. Backend Project Structure

```text
server/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── utils/
│   └── constants/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── uploads/
├── .env
└── package.json
```

---

# 27. Design System

## Colors

```text
Primary Blue:   #2563EB
Deep Navy:      #0F172A
Background:     #F8FAFC
White:          #FFFFFF
Secondary Blue: #3B82F6
Success:        #16A34A
Warning:        #F59E0B
Error:          #DC2626
Border:         #E2E8F0
```

## Typography

Headings:

**Plus Jakarta Sans**

Body:

**Inter**

Fallback fonts are acceptable if external fonts cannot be loaded.

## Visual direction

Learnova should feel:

- Premium
- Intelligent
- Clean
- Modern
- Friendly
- Trustworthy
- Spacious

Avoid:

- Cyberpunk
- Hacker aesthetics
- Gaming aesthetics
- Excessive gradients
- Excessive animations
- Childish UI
- Clutter

---

# 28. Responsive Design

Must work on:

- Mobile
- Tablet
- Laptop
- Desktop

Mobile requirements:

- Collapsible navigation
- Single-column layouts where appropriate
- Full-width primary actions
- Collapsible course curriculum
- Touch-friendly controls

---

# 29. Accessibility

Required:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Proper labels
- Good contrast
- Alt text
- Accessible buttons
- Screen-reader-friendly navigation

---

# 30. Loading, Empty and Error States

Major pages/features must support:

### Loading

Skeleton or meaningful loading UI.

### Empty

Example:

> Your learning journey starts here.

### Error

Example:

> Something went wrong.

CTA:

**Try Again**

### Unauthorized

> You don't have permission to access this page.

### Not Found

> We couldn't find what you're looking for.

---

# 31. Security Requirements

Implement:

- bcrypt password hashing
- JWT authentication
- Role-based authorization
- Ownership checks
- Helmet
- CORS
- Rate limiting
- Input validation
- JSON body limits
- Safe error handling
- No password hashes in API responses
- No secrets in frontend
- Server-side quiz scoring
- AI API key protection
- File validation
- Safe filenames
- No executable uploads
- Environment variables

Frontend validation is for user experience.

Backend validation is required for security.

---

# 32. Environment Variables

Backend:

```text
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

AI key will be added when the AI stage begins.

Never commit `.env`.

Create `.env.example`.

---

# 33. Development Seed Data

Seed development data:

- 1 Admin
- 2 Instructors
- 3 Students
- Several categories
- At least 2 courses
- Modules
- Lessons
- Quizzes
- Assignments

Development-only example accounts:

```text
admin@learnova.local
instructor@learnova.local
student@learnova.local
```

Passwords must be hashed.

Clearly mark all seed credentials as development-only.

---

# 34. Development Ports

Frontend:

`http://localhost:5173`

Backend:

`http://localhost:5000`

Health:

`http://localhost:5000/api/health`

---

# 35. Complete Route Map

## Public

```text
/
 /courses
 /course/:id
 /how-it-works
 /ai-tutor
 /about
 /contact
 /login
 /register
 /forgot-password
 /reset-password/:token
```

## Student

```text
/student/dashboard
/student/courses
/student/courses/:id
/student/learn/:courseId/:lessonId
/student/quizzes/:id
/student/assignments
/student/assignments/:id
/student/progress
/student/certificates
/student/certificates/:id
/student/ai-tutor
/student/ai-tutor/:conversationId
/student/notifications
/student/profile
/student/settings
```

## Instructor

```text
/instructor/dashboard
/instructor/courses
/instructor/courses/create
/instructor/courses/:id/edit
/instructor/courses/:id/builder
/instructor/students
/instructor/assignments
/instructor/assignments/:id
/instructor/quizzes
/instructor/analytics
/instructor/notifications
/instructor/profile
/instructor/settings
```

## Admin

```text
/admin/login
/admin/dashboard
/admin/users
/admin/students
/admin/instructors
/admin/courses
/admin/categories
/admin/enrollments
/admin/quizzes
/admin/assignments
/admin/certificates
/admin/reports
/admin/settings
```

---

# 36. Implementation Stages

OpenCode MUST follow these stages in order.

Do not skip stages.

Do not silently combine multiple stages.

Each stage must be tested before the next stage begins.

---

## STAGE 1 — FOUNDATION

Build:

- Project setup
- React/Vite
- Tailwind
- React Router
- Lucide
- Express
- PostgreSQL
- Prisma
- Environment configuration
- Basic frontend shell
- Basic public routes
- `/api/health`
- Database schema
- Migration
- Seed
- Basic authentication infrastructure

Test:

- Frontend starts
- Backend starts
- Database connects
- Prisma works
- Seed works
- Health works
- Register works
- Login works
- `/api/auth/me` works

STOP after successful verification.

---

## STAGE 2 — AUTHENTICATION & AUTHORIZATION

Complete:

- Register
- Login
- Logout
- `/me`
- JWT handling
- Protected routes
- Student route protection
- Instructor route protection
- Admin route protection
- Role middleware
- Ownership middleware/checks
- Account status handling

Test:

- Student access
- Instructor access
- Admin access
- Unauthorized access
- Invalid JWT
- Expired/invalid credentials
- Duplicate accounts

STOP and report results.

---

## STAGE 3 — PUBLIC WEBSITE

Build final public UI:

- Navbar
- Hero
- Benefits
- Featured courses
- AI Tutor section
- How It Works
- Instructor CTA
- Testimonials
- Final CTA
- Footer
- Courses page
- Course details
- How It Works
- AI Tutor landing page
- About
- Contact

Use real backend course data where appropriate.

Test:

- All routes
- Navigation
- Responsive behavior
- Search/filter
- Course details
- Empty/error states

STOP and report.

---

## STAGE 4 — COURSE MANAGEMENT

Build backend + frontend for:

- Categories
- Courses
- Modules
- Lessons
- Resources
- Course ordering
- Draft/published/archived states

Instructor:

- Create
- Edit
- Delete
- Reorder
- Preview
- Publish
- Archive

Admin:

- Manage all courses
- Manage categories

Test ownership carefully.

STOP and report.

---

## STAGE 5 — STUDENT ENROLLMENT & LEARNING

Build:

- Enrollment
- My Courses
- Learning interface
- Curriculum
- Lesson content
- Lesson completion
- Progress calculation
- Continue Learning

Test:

`Browse → Course → Enroll → Learn → Complete Lesson → Progress`

STOP and report.

---

## STAGE 6 — QUIZZES

Build:

- Quiz creation
- Question creation
- Options
- Quiz-taking UI
- Attempt storage
- Server-side scoring
- Results
- Review
- Retake logic

Test:

- Correct answers
- Incorrect answers
- Score calculation
- Permissions
- Attempt persistence

STOP and report.

---

## STAGE 7 — ASSIGNMENTS

Build:

- Assignment creation
- Instructions
- Submission
- File upload
- Text submission
- Submission status
- Instructor grading
- Feedback
- Student grade view

Test:

`Student submits → Instructor sees → Instructor grades → Student sees result`

STOP and report.

---

## STAGE 8 — COURSE COMPLETION & CERTIFICATES

Build:

- Completion criteria
- Completion detection
- Certificate generation
- Certificate storage
- Certificate view
- Download
- Share
- Verification page

Test:

- Incomplete course cannot receive certificate
- Completed course receives certificate
- Certificate number unique
- Verification works

STOP and report.

---

## STAGE 9 — INSTRUCTOR DASHBOARD & ANALYTICS

Build:

- Instructor dashboard
- Course statistics
- Student list
- Enrollment statistics
- Completion statistics
- Quiz performance
- Assignment overview
- Basic analytics

Ensure instructors see only their own relevant data.

Test authorization and ownership.

STOP and report.

---

## STAGE 10 — ADMIN DASHBOARD

Build:

- Admin dashboard
- Users
- Students
- Instructors
- Instructor approval
- Courses
- Categories
- Enrollments
- Certificates
- Reports
- Settings

Test admin authorization.

STOP and report.

---

## STAGE 11 — AI TUTOR

Only begin after all previous stages are stable.

Build:

- AI Tutor page
- New conversation
- Conversation list
- Conversation history
- Messages
- Context-aware tutoring
- Course context
- Lesson context
- AI service
- AI provider integration
- Rate limiting
- Error handling
- Ownership protection

AI key must stay server-side.

Test:

- New conversation
- Message
- Response
- History
- Course context
- Lesson context
- Unauthorized conversation access
- AI provider failure
- Rate limiting

STOP and report.

---

## STAGE 12 — NOTIFICATIONS, PROFILE & SETTINGS

Build:

- Notifications
- Read/unread state
- Mark all read
- Profile
- Password change
- Preferences
- Notification settings
- Language/timezone settings

Test persistence and permissions.

STOP and report.

---

## STAGE 13 — POLISH, ACCESSIBILITY & SECURITY HARDENING

Audit the complete system.

Check:

- Responsive design
- Accessibility
- Keyboard navigation
- Contrast
- Loading states
- Empty states
- Error states
- API errors
- Security headers
- CORS
- Rate limits
- Input validation
- File validation
- Ownership checks
- Role checks
- Secret exposure
- Console errors
- Server errors

Fix issues instead of hiding them.

STOP and report.

---

## STAGE 14 — FULL END-TO-END TEST

Perform these flows.

### Student

```text
Register
 ↓
Login
 ↓
Browse Course
 ↓
View Course
 ↓
Enroll
 ↓
Start Learning
 ↓
Complete Lessons
 ↓
Take Quiz
 ↓
Submit Assignment
 ↓
Receive Grade
 ↓
Complete Course
 ↓
Receive Certificate
 ↓
Ask AI Tutor
```

### Instructor

```text
Register
 ↓
Login
 ↓
Wait for Approval
 ↓
Admin Approves
 ↓
Create Course
 ↓
Add Modules
 ↓
Add Lessons
 ↓
Add Quiz
 ↓
Add Assignment
 ↓
Publish
 ↓
View Students
 ↓
Grade Assignment
 ↓
View Analytics
```

### Admin

```text
Login
 ↓
Dashboard
 ↓
Manage Users
 ↓
Approve Instructor
 ↓
Manage Courses
 ↓
Manage Categories
 ↓
View Enrollments
 ↓
View Certificates
 ↓
View Reports
```

Fix every blocker discovered during this stage.

---

# 37. Testing Rules

OpenCode must not claim success because files were created.

A feature is complete only when:

1. It runs.
2. The intended user can access it.
3. Unauthorized users cannot access it.
4. Data is persisted correctly.
5. Error states work.
6. Responsive behavior is acceptable.
7. No obvious console/server errors remain.

When something fails:

1. Diagnose the actual cause.
2. Fix it.
3. Re-run the relevant test.
4. Continue only after verification.

Never replace a broken real feature with a fake response just to make a test pass.

---

# 38. Git/Change Discipline

Before major changes:

- Inspect existing files.
- Preserve useful work.
- Avoid destructive rewrites unless necessary.
- Keep changes focused on the current stage.
- Do not introduce unrelated features.
- Keep environment secrets out of source control.

If Git is available, create logical commits at major stage boundaries.

Suggested:

```text
stage-01-foundation
stage-02-auth
stage-03-public-site
stage-04-courses
...
```

---

# 39. Stage Completion Report

At the end of every stage, OpenCode must provide:

```text
STAGE:
STATUS:

IMPLEMENTED:
- ...

FILES CREATED:
- ...

FILES MODIFIED:
- ...

DATABASE CHANGES:
- ...

API CHANGES:
- ...

TESTS RUN:
- ...

TEST RESULTS:
- ...

KNOWN ISSUES:
- ...

NEXT STAGE:
- ...
```

Never say `COMPLETE` if there are unresolved blockers.

---

# 40. Master OpenCode Instructions

The following rules apply to the entire project.

## Rule 1 — Inspect first

Before changing anything, inspect the existing project and understand its current state.

## Rule 2 — Follow stages

Implement only the current stage.

Do not jump to future stages.

## Rule 3 — Don't guess

If a requirement is already defined in this document, follow it.

If implementation details are genuinely unspecified, choose a conventional maintainable solution and document the choice.

## Rule 4 — Real functionality

Do not use fake/mock data for functionality that is supposed to be real.

Seed data is acceptable for development.

## Rule 5 — Security

Never trust the frontend for authorization.

## Rule 6 — Database

Use Prisma and PostgreSQL.

Do not replace PostgreSQL with another database.

## Rule 7 — AI

Never expose AI API keys to the browser.

## Rule 8 — UI

Keep Learnova professional, clean, premium, modern, spacious and accessible.

## Rule 9 — Responsive

Every major page must work on mobile, tablet and desktop.

## Rule 10 — Reusable code

Avoid unnecessary duplication.

## Rule 11 — Error handling

Errors should be visible and understandable during development.

Do not silently swallow errors.

## Rule 12 — Testing

Test every stage before proceeding.

## Rule 13 — No scope creep

Do not implement excluded features unless the current stage explicitly requires them.

## Rule 14 — Do not stop at scaffolding

A folder existing does not mean a feature exists.

Verify actual functionality.

## Rule 15 — Ask only when necessary

Do not repeatedly ask for information that is already defined in this document.

If an unavoidable blocking ambiguity exists, explain it clearly before making a destructive decision.

---

# 41. Final Architecture

```text
                         LEARNOVA
                            │
                ┌───────────┴───────────┐
                │                       │
          React Frontend           Express Backend
          Vite + Tailwind              │
                │                    REST API
                │                       │
                │                 ┌─────┴─────┐
                │                 │           │
                │              Prisma         AI
                │                 │         Service
                │                 │           │
                │              PostgreSQL   Provider
                │
                └────── HTTP / JSON ─────────┘
```

The frontend never communicates directly with PostgreSQL.

The backend owns business logic, authorization, database access, file validation and AI integration.

---

# 42. Final Product Flow

```text
Visitor
  ↓
Learnova Homepage
  ↓
Explore Courses
  ↓
Course Details
  ↓
Register/Login
  ↓
Enroll
  ↓
Student Dashboard
  ↓
Learning
  ↓
Quiz
  ↓
Assignment
  ↓
Progress
  ↓
Course Completion
  ↓
Certificate
  ↓
AI Tutor
```

---

# 43. Final Definition of Done

Learnova MVP is considered complete only when:

- Public website works.
- Authentication works.
- Student role works.
- Instructor role works.
- Admin role works.
- Course creation works.
- Course enrollment works.
- Lesson learning works.
- Progress works.
- Quizzes work.
- Assignments work.
- Grading works.
- Certificates work.
- AI Tutor works.
- Notifications work.
- Profiles/settings work.
- Authorization is enforced server-side.
- Responsive UI works.
- Major accessibility requirements are addressed.
- Security checks pass.
- Database persists real data.
- End-to-end student flow passes.
- End-to-end instructor flow passes.
- End-to-end admin flow passes.
- No known critical blockers remain.

---

# 44. START COMMAND FOR OPENCODE

When beginning implementation, use this instruction:

> Read `LEARNOVA_MASTER_PLAN.md` completely before making changes.
>
> You are working on the Learnova LMS.
>
> Begin with **STAGE 1 only**.
>
> Inspect the existing project first.
>
> Implement the current stage exactly according to this document.
>
> Test the implementation.
>
> Fix any failures.
>
> Provide the required Stage Completion Report.
>
> **Do not begin Stage 2 until Stage 1 has been successfully verified and explicitly authorized.**

---

# END OF MASTER PLAN

**Learnova — Learn Smarter. Grow Further.**
