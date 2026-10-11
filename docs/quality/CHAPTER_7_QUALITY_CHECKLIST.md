# Chapter 7 quality checklist

## Purpose and scope

This checklist defines the Chapter 7 acceptance baseline for StudyMate after the backend and frontend quality refactors. The goal is to protect existing API contracts, user ownership boundaries, grounded-chat guarantees and the current Quiz prototype while adding regression coverage rather than new product behavior.

The current scope includes Course, Document Library, Study Session/Chat and the frontend Quiz prototype. Authentication still uses `X-User-Id`; Quiz does not yet have a backend API; document text extraction and real RAG/LLM generation remain future work.

## AI-assisted code review checklist

Use this checklist for every AI-generated or AI-reviewed change. Human review remains responsible for the final decision.

- [ ] Security: no API keys, passwords, local paths, uploaded content or personal data are committed or exposed in responses.
- [ ] Ownership: every owner-scoped Course, Document and Study Session query is restricted to the current `X-User-Id`.
- [ ] Error handling: invalid input produces the shared Problem Details JSON and does not expose stack traces or storage paths.
- [ ] Duplication: authorization, validation, request state and form behavior reuse the shared components already in the codebase.
- [ ] Naming: class, method, test and DTO names describe the protected business rule.
- [ ] Null handling: missing headers, files, JSON bodies, identifiers, questions and citations fail deliberately.
- [ ] API compatibility: routes, status codes, request DTOs and response DTOs remain unchanged unless explicitly approved.
- [ ] Grounding: every `SUPPORTED` answer has at least one valid citation; `INSUFFICIENT_CONTEXT` has none and clearly says the documents are insufficient.
- [ ] Test coverage: success, invalid-input and cross-user paths are covered at the appropriate unit, integration or component level.
- [ ] Verification: backend tests plus frontend lint, tests and production build pass before commit and PR review.

## Product-flow checklist

### Course management

- [ ] The owner can create, list, view, edit and delete a Course.
- [ ] Blank or oversized fields return a validation error in the shared format.
- [ ] Another user cannot view, edit or delete the Course.

### PDF/DOCX upload

- [ ] The owner can upload PDF and DOCX files and retrieve their metadata.
- [ ] Path-like browser filenames are reduced to a safe base filename.
- [ ] Missing, empty, unsupported, content-type-mismatched, oversized and excessively long filenames are rejected.
- [ ] Rejected uploads create neither database metadata nor local files.
- [ ] Another user cannot list, upload, retrieve or delete documents in the Course.

### Study Session and grounded chat

- [ ] A Study Session only accepts documents belonging to its selected Course.
- [ ] Blank/oversized titles and questions are rejected without persisting chat messages.
- [ ] Another user cannot read or post messages in the session.
- [ ] `SUPPORTED` responses contain a citation to a selected Course document.
- [ ] A session without sources returns `INSUFFICIENT_CONTEXT` with no citations and the documented Vietnamese fallback message.

### Quiz prototype

- [ ] Loading, API-error and empty/invalid Quiz data produce explicit UI states.
- [ ] A valid option can be selected and submitted once.
- [ ] Correct and incorrect answers display feedback and a source label.
- [ ] Reset clears the selected answer and feedback.
- [ ] Review evidence states clearly that Quiz still uses frontend prototype data and has no persistence API.

### Shared validation and access failures

- [ ] Missing or malformed `X-User-Id` is rejected using the shared Problem Details format.
- [ ] Non-owned resources use the same not-found response as absent resources to avoid leaking their existence.
- [ ] Tests assert stable error status/code/path fields where those fields are part of the current contract.

## Automated verification commands

From the repository root on Windows:

```powershell
.\mvnw.cmd test
cd frontend
pnpm install
pnpm lint
pnpm test
pnpm build
cd ..
git diff --check
```

Expected quality gates:

- Maven exits successfully with zero failed or errored tests.
- ESLint exits successfully with zero warnings.
- Vitest reports zero failed tests.
- Vite creates a production bundle successfully.
- `git diff --check` prints no whitespace errors.

## Manual verification record

Leave an item unchecked until it has actually been performed against a running backend/frontend environment.

- [ ] Create, edit and delete a Course through the Dashboard.
- [ ] Upload one PDF and one DOCX, then reject one invalid file through Document Library.
- [ ] Create a Study Session, ask a sourced question and inspect its citation.
- [ ] Ask in a session with no selected documents and inspect the insufficient-context response.
- [ ] Complete and reset the Quiz prototype.
- [ ] Change `VITE_API_USER_ID` to confirm owner-scoped data is not visible to another user.

The final verification evidence must distinguish automated results, source inspection and manual checks; it must not mark an unexecuted manual flow as passed.
