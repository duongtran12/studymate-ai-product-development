# Grounded answer debugging and review log

- Date: 2026-10-03
- Owner: Member 3
- Chapter: 6 - AI Programming
- Scope: code-generation prompts and grounded-answer extraction
- Tool or model: Codex

This log records code-review findings and verification performed in this branch. No runtime production incident is claimed; the findings below came from repository inspection and regression testing.

## Prompt used

```text
Review the StudyMate main branch after Chapter 6 work from Members 1 and 2. Then:
1. add structured code-generation prompts for Spring Boot, React, tests and debugging;
2. extract the mock grounded-answer logic from StudySessionService behind an interface without changing the Chat API;
3. enforce that SUPPORTED answers contain citations and INSUFFICIENT_CONTEXT answers do not;
4. add focused tests and run the complete backend regression suite and frontend build.

Do not change the shared current-user resolver or API error handler. Do not integrate a real LLM, API key, secret or user document. Keep each concern in a small commit and preserve existing API response shapes.
```

## Finding 1: Chapter 6 code-generation prompt coverage was missing

**Evidence**

- `docs/PROMPT_LIBRARY.md` contained grounded Q&A and quiz prompts from an earlier chapter.
- Git history after the Chapter 5 baseline did not contain the planned `docs: add code generation prompt library` commit.
- There were no reusable prompts covering allowed files, security constraints, expected output and verification for Spring Boot, React, migrations, regression tests or debugging.

**AI proposal reviewed**

Extend the existing prompt library instead of creating a competing document. Give every prompt the same structure: required inputs, constrained prompt body and a human verification checklist.

**Human decision and final change**

Accepted the shared structure and added five task-specific templates. Kept the existing grounded Q&A prompts intact because they serve a different product concern. Added explicit rules against credentials, cross-user data exposure, destructive migration edits and weakening failing tests.

**Verification**

- Reviewed the Markdown diff for all required prompt categories.
- Ran `git diff --check` before committing the prompt-library change.

## Finding 2: grounded-answer generation was coupled to persistence orchestration

**Evidence**

- `StudySessionService` both persisted chat messages and constructed mock answer text/citations in a private `createAssistantDraft` method.
- Replacing the mock with RAG would therefore require editing the session orchestration service even though the Chat API and persistence flow should remain stable.

**AI proposal reviewed**

Introduce a `GroundedAnswerGenerator` interface and inject it into `StudySessionService`. Move the current deterministic behavior into `MockGroundedAnswerGenerator`, leaving the controller, request DTOs, response DTOs and database schema unchanged.

**Human decision and final change**

Accepted the interface boundary. During test design, human review caught that a generator receiving only course and document IDs could not answer a future user's question. The final boundary therefore receives an immutable `GroundedAnswerRequest` containing the validated question, course ID and document IDs. Kept `CourseDocumentRepository` in `StudySessionService` because it is still required to validate the selected document scope when a session is created; only answer construction moved. Rejected any real LLM client or configuration because Chapter 6 requires a replaceable mock, not RAG integration.

**Verification**

- Compiled the refactored Spring context successfully.
- Ran `StudySessionApiIntegrationTests`: 4 tests passed with the existing Chat response shape and persistence behavior.
- Confirmed no controller, frontend API or migration changed in the refactor commit.

## Finding 3: grounding rules were implicit rather than enforced by the type

**Evidence**

- The previous private draft record accepted any status/citation combination.
- A future generator could accidentally return `SUPPORTED` with an empty citation list, violating `docs/api/GROUNDED_CHAT_API.md`.
- It could also attach citations to `INSUFFICIENT_CONTEXT`, producing a contradictory response.

**AI proposal reviewed**

Represent status as a `GroundingStatus` enum and validate status/citation combinations in the compact constructor of an immutable `GroundedAnswer` record.

**Human decision and final change**

Accepted the enum and constructor invariants. Also copied the citation list defensively and rejected blank answer content. `StudySessionService` persists `answer.status().name()`, so the public strings remain `SUPPORTED` and `INSUFFICIENT_CONTEXT`.

**Verification completed so far**

- Existing API integration tests pass for both supported and insufficient-context answers.
- Direct unit tests for the generator and invalid invariant combinations are part of the final Chapter 6 regression commit.

## Review outcome

- The Chat API contract remains unchanged.
- The mock implementation remains deterministic and uses no external network or secret.
- A later RAG implementation can implement `GroundedAnswerGenerator` and be selected by configuration without changing `StudySessionController` or Chat response DTOs.
- Full-suite results are recorded separately in the Chapter 6 regression report after all tests and the frontend production build are run.
