# Project Readiness Audit

Reviewed: 2026-11-21

## Overall position

StudyMate has a demonstrable MVP: account access, course/document management, grounded study sessions, Quiz revision, learning dashboard and automated quality checks are implemented and connected. The main remaining risk is not an absent core feature; it is final demonstration readiness and keeping older chapter documents aligned with the current implementation.

## What is ready to demonstrate

- A learner can register, log in, create a course, upload a PDF/DOCX and inspect extracted content.
- A learner can create a scoped study session, ask a question and see an answer with citations when evidence exists.
- A learner can create a manual Quiz, submit answers, receive per-question feedback and revisit weak Quizzes from the dashboard.
- A learner can set learning goals, view suggestions/activity and maintain a profile/password.
- CI validates backend tests plus frontend test, lint and production build on pushes and Pull Requests.

## Evidence available

- Backend: 72 tests passed locally on 2026-11-21.
- Frontend: 50 tests, ESLint and Vite production build passed locally on 2026-11-21.
- End-to-end API journey: registration → DOCX upload → grounded question → source-scoped Quiz → scored attempt.
- CI workflow: `.github/workflows/ci.yml`.

## Prioritized remaining work

### Must do before grading/demo

1. Run the browser manual checklist using PostgreSQL and complete the evidence fields truthfully.
2. Confirm the latest GitHub Actions run is green after this audit commit.
3. Prepare one clean demo account, one small DOCX/PDF and one fallback manual Quiz for the presentation.

### Needed only if the AI path is demonstrated

1. Configure an OpenAI-compatible API key/model through environment variables.
2. Test the configured provider with a non-sensitive course document.
3. Keep the manual Quiz path ready in case the external provider is unavailable.

### Follow-up quality work

1. Update historical Chapter 5–7 documents that still state that authentication, Quiz persistence or document retrieval are absent.
2. Add a browser automation suite when the grading scope requires visual end-to-end evidence.
3. Test migrations against PostgreSQL in automated CI, not only H2 compatibility mode.

## External design dependency

The repository contains the Chapter 4 wireframes and design review. The Figma file exists but import/clickable-prototype work is pending because the Starter-plan limit blocked further edits. This should be described honestly in the final presentation rather than marked complete.
