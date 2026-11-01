# Chapter 8 Test Evidence

## Verification scope

- Date: 2026-11-01 (Asia/Saigon)
- Branch: `feat/member-3-chapter-8-integration`
- Verified source commit: `d3e0ee7` (`build: add unified verification command`)
- Evidence covers the Chapter 8 integration-test additions and the existing backend/frontend regression suites.

## Commands and observed results

### Targeted API integration regression

```powershell
.\mvnw.cmd "-Dtest=CourseApiIntegrationTests,CourseDocumentApiIntegrationTests,StudySessionApiIntegrationTests" test
```

Observed result:

- 23 tests run;
- 0 failures, 0 errors, 0 skipped;
- Maven build succeeded.

### Unified verification gate

```powershell
.\scripts\verify.ps1
```

The final run completed successfully with these observed results:

| Stage | Result |
| --- | --- |
| Backend test suite | 52 passed; 0 failures, 0 errors, 0 skipped |
| Frontend test suite | 8 test files passed; 44 tests passed |
| Frontend lint | Passed with `--max-warnings=0` |
| Frontend production build | Passed; Vite transformed 62 modules |

The gate was run again after restoring the local frontend dependency directory, and all four stages passed in the same order.

### Required pnpm build attempt

```powershell
cd frontend
pnpm build
```

This command did **not** reach the Vite build in the Codex Windows runtime. The runtime's pnpm wrapper attempted to rebuild `node_modules` and Windows rejected a dependency symlink with `ERR_PNPM_EPERM`. The local dependency directory was then restored without creating a package lock:

```powershell
npm install --no-package-lock
```

The frontend tests, lint and production build were subsequently rerun through `.\scripts\verify.ps1` and passed. Therefore this evidence records the Vite build as successful through the existing npm package-script runner, but does not claim that `pnpm build` itself passed on this machine.

## Added API coverage

Six integration-test cases were added without changing production services or API contracts:

- Course create rejects a missing `X-User-Id` and an unknown user without persisting a course.
- Invalid Course update leaves the existing name and code unchanged.
- Document upload rejects a missing user header and an empty file without persisting metadata or a stored file.
- A Document cannot be read or deleted through another Course, even when both Courses belong to the same user; the original metadata and file remain intact.
- Study Session create rejects a missing header and an unknown user without persisting a session or document link.
- Malformed Study Session and question JSON do not leave partial sessions, document links or chat messages.

## System-test execution status

The manual end-to-end journey was **not executed** during this verification run. The reusable procedure is recorded in `docs/quality/CHAPTER_8_END_TO_END_USER_JOURNEY_CHECKLIST.md`, with all Pass/Fail fields intentionally left blank for the demo tester.

## Known limitations and follow-up risks

- There is no automated browser end-to-end suite. React tests use Vitest and Testing Library; the complete user journey still requires manual execution.
- The Quiz page is a frontend prototype. There is no Quiz backend API, database persistence, generated question set or uploaded-document linkage to verify end to end.
- Grounded answers use a deterministic mock generator rather than a real RAG/LLM pipeline.
- Integration tests run against in-memory H2 in PostgreSQL compatibility mode, not a containerized PostgreSQL instance.
- User identity still relies on the temporary `X-User-Id` header rather than production authentication/JWT.
- Maven emitted non-failing warnings about Mockito dynamically attaching its agent and the test H2 version being newer than Flyway's latest verified version.
- `npm install --no-package-lock` reported six moderate dependency audit findings. No automatic audit fix was applied because it could introduce unrelated or breaking dependency changes.
- `pnpm build` needs to be rerun on a developer machine where pnpm can create symlinks (or with an approved Windows developer-mode/elevated setup) before the PR is merged if the team requires a pnpm-specific green run.
