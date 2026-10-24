# Chapter 8 AI Assisted Test Design Plan

## Purpose

This plan turns the core StudyMate user journeys into repeatable backend checks for Chapter 8: unit testing, integration testing, system-level verification, test automation, and test-case design. AI may suggest scenarios, but each scenario below is verified against the implemented API and service contracts before it is added to the suite.

## Scope and test levels

- **Unit tests:** isolate service or validation rules with mocked repositories and collaborators.
- **Integration tests:** exercise HTTP endpoints, validation, persistence mappings, ownership rules, and Flyway migrations with the test database.
- **System verification:** run the backend suite and the frontend production build together before a pull request is merged.

## Core scenarios

### Course management

- A known user can create a course with a trimmed name and optional code or description.
- A user can read, update, and delete only courses that they own.
- A missing owner, missing course, blank name, and name longer than 160 characters are rejected without persisting invalid data.

### Document library

- A course owner can upload a PDF or DOCX and receive normalized file metadata.
- An empty file, unsupported extension, mismatched content type, oversized file, or invalid file name is rejected before storage.
- A user cannot list, read, upload, or delete documents for another user's course.

### Study sessions and grounded answers

- A course owner can create a session with unique document IDs from that course.
- A request with a foreign or missing document is rejected and does not create a session-document association.
- A session with source documents produces a supported answer with citations; a session without sources returns insufficient context without citations.
- Only the session owner can read session details, messages, or ask a question.
- A blank or overlong question is rejected before chat messages are saved.

### Quiz boundary

Quiz user-interface automation is assigned outside this backend scope. Its system test should verify that quiz requests contain valid course-scoped source material and that loading, empty, error, and completed states are visible to the learner.

## Automation and evidence

Run `mvnw.cmd test` after every backend test commit. Run `pnpm build` in `frontend` before the final Chapter 8 pull request. Record the exact results and any known limits in the Chapter 8 verification evidence after all member branches are integrated.
