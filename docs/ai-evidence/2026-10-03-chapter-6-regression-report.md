# Chapter 6 regression report

- Date: 2026-10-03
- Owner: Member 3
- Branch: `feat/member-3-ai-coding-quality`
- Base: merged Chapter 6 work from Members 1 and 2 on `main`

## Scope

This regression run verifies that the grounded-answer extraction preserves the Chapter 5 Chat API while the Chapter 6 current-user resolver, standardized API errors, Course CRUD UI/API and shared React request hook remain buildable and covered by the existing suite.

## New focused coverage

`GroundedAnswerGeneratorTests` adds six unit tests:

1. No selected documents returns `INSUFFICIENT_CONTEXT` with the required message and no citation.
2. A selected document returns `SUPPORTED` with a non-empty citation.
3. A missing selected document is rejected instead of producing an unsupported citation.
4. A `SUPPORTED` result cannot be constructed without a citation.
5. An `INSUFFICIENT_CONTEXT` result cannot be constructed with a citation.
6. `GroundedAnswerRequest` carries the question needed by a future RAG implementation and defensively copies the document scope.

The existing `StudySessionApiIntegrationTests` continue to verify message persistence, response shape, citations, insufficient context and cross-user isolation through the public HTTP API.

## Coverage matrix

| Area | Verification |
| --- | --- |
| Course API | `CourseApiIntegrationTests`: create, list, update, delete, validation and cross-user access |
| Course UI | Dashboard edit/delete code included in the successful Vite production build |
| Document API | Upload/list/get/delete, invalid format and cross-user access integration tests |
| Shared API errors | `ApiValidationRegressionTests`: missing/invalid identity, malformed JSON, safe not-found response and unsupported upload |
| Grounded-answer abstraction | Six direct unit tests plus four Study Session API integration tests |
| Async request hook consumers | Dashboard, Document Library and Study Session compiled in the production frontend bundle |
| Flyway/application context | Fresh H2 PostgreSQL-mode migrations and Spring context startup in integration tests |

## Commands and results

### Backend

```powershell
.\mvnw.cmd test
```

Result:

```text
Tests run: 19, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Breakdown:

- `CourseApiIntegrationTests`: 2
- `CourseDocumentApiIntegrationTests`: 3
- `GroundedAnswerGeneratorTests`: 6
- `StudySessionApiIntegrationTests`: 4
- `ApiValidationRegressionTests`: 3
- `StudymateApplicationTests`: 1

### Frontend

```powershell
pnpm build
```

Result:

```text
57 modules transformed
vite build completed successfully
```

### Repository hygiene

```powershell
git diff --check
```

This check is run immediately before the regression commit. No dependency directory, build output, `.env`, secret or local uploaded document is included in the commit.

## Known limits

- The frontend currently has no component-test runner, so Course button interactions and the shared hook are verified by compilation, existing API tests and manual browser review rather than automated DOM tests.
- The pre-existing upload-size handler is implemented, but the suite still lacks a dedicated multipart request larger than the configured 10 MB limit. Unsupported file types are covered.
- The answer generator is intentionally deterministic. No external LLM, vector database, API key or user document content is used in Chapter 6.

## Outcome

The refactor preserves the current Chat API and persistence behavior. The answer-generation boundary now accepts the learner question and enforces citation invariants, so a future RAG/LLM implementation can replace the mock generator without changing the controller or response contract.
