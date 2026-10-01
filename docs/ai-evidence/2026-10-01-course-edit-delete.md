# Course edit and delete UI evidence

- Date: 2026-10-01
- Owner: Member 2
- Related requirement or issue: Chapter 6 frontend Course management
- Tool or model: Codex
- Prompt version: v1

## Prompt

Add edit and delete flows to the existing React Dashboard using the current Course API. Keep the backend contract unchanged, include loading, errors, cancel, success feedback, and limit changes to the frontend API client, Dashboard, and required styling.

## Output summary

The AI proposed `updateCourse` and `deleteCourse` client functions plus inline course editing and deletion controls on each Dashboard card.

## Human review

- What was verified: Existing `PUT` and `DELETE` routes, request field limits, nullable code/description fields, and the current shared API error format.
- What was changed or rejected: Replaced clickable-card nesting with a separate link and action area; normalized blank optional fields to `null`; added an explicit destructive confirmation, disabled concurrent mutations, cancel behavior, and accessible labels/status messages.
- Verification method: `pnpm build`, `git diff --check`, and diff review confirming no backend files changed.
- Reviewer: Member 2
