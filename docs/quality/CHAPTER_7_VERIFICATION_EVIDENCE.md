# Chapter 7 verification evidence

## Verification context

- Date: 2026-10-11 (Asia/Saigon)
- Branch: `feat/member-3-ai-code-review`
- Tested source commit: `8d735d5`
- Backend profile: Spring Boot `test` profile with H2 databases and Flyway migrations
- Frontend toolchain: ESLint, Vitest/Testing Library and Vite production build

This report only marks commands and checks that were actually executed. Browser-based manual product flows were not run during this verification session.

## Automated results

| Gate | Command executed | Result |
| --- | --- | --- |
| Backend regression | `.\mvnw.cmd test` | Passed: 33 tests, 0 failures, 0 errors, 0 skipped |
| Frontend regression | `npm run test` | Passed: 2 test files, 9 tests |
| Frontend static quality | `npm run lint` | Passed: ESLint exited with zero errors and zero warnings |
| Frontend production bundle | `npm run build` | Passed: Vite 7.3.7 transformed 62 modules |
| Repository whitespace | `git diff --check` | Passed: no whitespace errors |

The frontend scripts are package-manager independent and are also exposed as `pnpm test`, `pnpm lint` and `pnpm build`. On this Windows runner, pnpm dependency linking was blocked by the local symlink policy, so the equivalent npm script commands above were the commands actually executed. No npm lockfile was created or committed; `pnpm-lock.yaml` remains the repository lockfile.

## Coverage added in Chapter 7

### Course ownership

- A non-owner receives `404 RESOURCE_NOT_FOUND` when reading, updating or deleting another user's Course.
- A rejected cross-user update/delete leaves the owner's Course unchanged.
- Blank Course input retains the shared `400 REQUEST_REJECTED` response contract.

### Document upload and ownership

- Unsupported extensions and mismatched content types are rejected.
- Missing multipart file, files larger than 10 MB and filenames longer than 255 characters are rejected.
- Rejected uploads create neither document metadata nor a local storage directory.
- Browser path-like filenames are sanitized to their base filename by the existing successful upload test.
- List/get/delete/upload operations remain unavailable to a user who does not own the Course.

### Study Session and grounded chat

- Sessions cannot be created for another user's Course or with a document from a different Course.
- A `null` document identifier, title longer than 200 characters and question longer than 4,000 characters are rejected without partial persistence.
- Cross-user session and message access remains rejected.
- A session without documents returns `INSUFFICIENT_CONTEXT`, the documented Vietnamese fallback message and no citations.
- A `SUPPORTED` response contains a citation with document id, document name, locator and excerpt.

### Quiz prototype

- Component tests cover loading, API-error/retry and invalid/empty Quiz states.
- A valid answer can be selected, submitted with feedback/source and reset.
- These are frontend component tests because no Quiz API, database model or persistence flow exists yet.

## AI-assisted review record

### Review request used

The review was driven by the team prompt to inspect security, ownership, validation, code duplication, naming, null handling, API compatibility and test coverage, while preserving Member 1's backend refactors and recording only verified evidence.

### AI suggestions and human decisions

| Review observation or suggestion | Decision | Verification |
| --- | --- | --- |
| Add cross-user update/delete coverage instead of changing the shared Course ownership service. | Accepted. Existing behavior was correct; integration assertions were added. | Course API tests pass. |
| Exercise upload rejection through HTTP and assert no database/file side effects. | Accepted. This protects the refactored validator without duplicating its unit tests. | Document API and validator tests pass. |
| Treat Quiz as a frontend prototype rather than inventing a backend contract. | Accepted. Component regression tests were added; no fake API or persistence was introduced. | Four Quiz component tests pass. |
| Preserve the current grounded-answer generator and strengthen its API-level citation assertions. | Accepted. Current domain validation already rejects `SUPPORTED` answers with an empty citation list. | Grounded Answer unit tests and Study Session integration tests pass. |
| Claim manual flows as verified based only on automated tests. | Rejected. Automated and manual evidence are recorded separately. | Manual section below remains explicitly not run. |

## Manual verification status

The following flows were not executed in a browser during this work and therefore are not marked as passed:

- Course create/edit/delete through the Dashboard.
- PDF and DOCX upload through Document Library.
- Grounded chat with and without selected documents through the Study Session screen.
- Quiz selection/submission/reset through the running application.
- Switching `VITE_API_USER_ID` between two users in a running environment.

They remain available as an explicit checklist in `CHAPTER_7_QUALITY_CHECKLIST.md` for PR review or acceptance testing.

## Known limitations and non-blocking warnings

- `X-User-Id` remains a temporary identity mechanism; JWT/session authentication is not implemented.
- Quiz remains frontend prototype data with no backend API, generation service or persistence.
- Document text extraction, embeddings, retrieval and real LLM/RAG calls are not implemented.
- `GroundedAnswer` validates citation presence by list cardinality, while individual `CitationResponse` text fields are not yet domain-validated for future generator implementations. The current generator's fields are asserted non-empty by integration tests.
- Frontend automated coverage currently targets `useAsyncRequest` and Quiz; full page journeys still require manual or future end-to-end tests.
- Maven emitted non-failing warnings about Mockito dynamic agent loading, Spring's generated development password and H2 2.4 being newer than Flyway's verified H2 version.

## PR summary data

- New/expanded backend cases protect Course ownership, upload boundaries, upload side effects, Study Session validation, document scope and grounded citation behavior.
- New frontend cases protect Quiz loading, error, empty, answer submission and reset behavior.
- Final automated outcome: backend 33/33 and frontend 9/9 passed; lint and production build passed.
- Remaining product limitations are listed above and should be copied into the Pull Request description.
