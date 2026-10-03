# StudyMate Prompt Library

## Rules for every production prompt

1. Include only the smallest retrieved context needed to answer the request.
2. State the requested output format explicitly.
3. Tell the model to avoid unsupported claims.
4. Require source identifiers in its structured result so the API can render citations.
5. Treat model output as untrusted input and validate its structure before persistence or display.

## QA from course documents

**Purpose:** Answer a learner's question using selected course documents.

```text
You are StudyMate, a careful learning assistant.
Answer only from the retrieved course-document excerpts below.
If the excerpts do not support an answer, say that the information was not found
in the selected documents. Do not use outside knowledge or guess.

Question: {{question}}

Retrieved excerpts:
{{retrieved_chunks}}

Return JSON with:
- answer: concise answer in the language of the question
- citations: array of chunk ids used as evidence
- confidence: high, medium, or insufficient
```

## Quiz generation

**Purpose:** Produce an editable quiz draft grounded in a document excerpt.

```text
Create {{question_count}} quiz questions from the excerpts below.
Use only facts supported by the excerpts. For each item, return a question,
question type, answer, short explanation, and source chunk ids. If a reliable
question cannot be created, omit it instead of inventing content.

Retrieved excerpts:
{{retrieved_chunks}}
```

## Prompt evaluation cases

- A supported question must cite at least one retrieved chunk.
- A question outside the retrieved material must return `insufficient`.
- A generated quiz answer must be traceable to one or more chunks.
- Malformed JSON or missing citations must be rejected by the backend validator.

## Improvement record

When a prompt changes, save its previous and current version, the observed failure, and the evaluation result using the template in `docs/ai-evidence/README.md`.

## Chapter 6 code-generation prompts

These prompts are starting points for pair programming, not instructions to accept generated code unchanged. Replace every `{{placeholder}}`, attach only the files needed for the task, and record the reviewed result in `docs/ai-evidence/`.

### Spring Boot Controller, Service and Repository

**Input required**

- User story and acceptance criteria.
- Existing API contract and relevant domain schema.
- Current Controller, Service, Repository and exception-handling files.
- Exact files that may be created or changed.

```text
Act as a pair programmer for the StudyMate Spring Boot application.

Task: {{task}}
Allowed files: {{allowed_files}}
Existing API contract: {{api_contract}}
Relevant database schema: {{schema}}

Constraints:
- Do not change files outside the allowed list.
- Preserve existing routes and response shapes unless the task explicitly changes them.
- Resolve the current user through @CurrentUserId; never trust a user ID from the body.
- Keep authorization checks in the service layer and scope repository queries by owner.
- Use the shared API error handling instead of exposing stack traces.
- Do not add credentials, API keys, personal data or production configuration.
- Do not introduce a dependency without explaining why it is necessary.

Return:
1. A short design summary and assumptions.
2. A file-by-file patch proposal.
3. Validation, authorization and transaction edge cases.
4. Tests that prove success, invalid input and cross-user isolation.
```

**Verification checklist**

- [ ] Diff contains only the allowed files.
- [ ] Controller delegates business rules to a service.
- [ ] Repository queries cannot expose another user's data.
- [ ] Error responses use the shared Problem Details contract.
- [ ] `./mvnw.cmd test` succeeds.

### Flyway migration

**Input required**

- Current migration files and latest schema version.
- Proposed tables, columns, constraints and relationships.
- PostgreSQL version and H2 compatibility requirements for tests.

```text
Design the next append-only Flyway migration for StudyMate.

Schema change: {{schema_change}}
Allowed files: {{allowed_migration_files}}
Current latest migration: {{latest_migration}}

Constraints:
- Never edit an already-applied migration.
- Use the next version number and a descriptive filename.
- Add primary keys, foreign keys, delete behavior, uniqueness and indexes explicitly.
- Preserve existing data; identify any backfill or nullability risk before writing SQL.
- Keep SQL compatible with PostgreSQL and the repository's H2 PostgreSQL-mode tests.
- Do not place credentials or environment-specific values in SQL.

Return:
1. Risk and compatibility notes.
2. The complete migration SQL.
3. Queries or integration tests that verify the new schema.
4. A rollback/recovery note; do not generate destructive rollback commands by default.
```

**Verification checklist**

- [ ] Existing migrations are unchanged.
- [ ] Fresh-schema migration succeeds.
- [ ] Foreign-key and delete behavior match the domain.
- [ ] Required lookup columns have indexes.
- [ ] Backend integration tests succeed against H2 PostgreSQL mode.

### React component or hook

**Input required**

- User flow, API functions and response/error shapes.
- Existing component, shared hook and styles.
- Loading, empty, success, error and cancellation requirements.

```text
Act as a pair programmer for the StudyMate React/Vite frontend.

User flow: {{user_flow}}
Allowed files: {{allowed_files}}
Available API functions: {{api_functions}}
Existing UI conventions: {{ui_conventions}}

Constraints:
- Do not change backend contracts.
- Reuse apiRequest and useAsyncRequest where appropriate.
- Abort stale read requests and prevent stale responses from replacing newer state.
- Do not automatically retry POST, PUT or DELETE operations.
- Cover loading, empty, error, success and disabled states.
- Use accessible labels, semantic controls and keyboard-safe interactions.
- Never expose secrets or embed production endpoints in the client bundle.

Return:
1. State and request-flow design.
2. A file-by-file patch proposal.
3. Race conditions and user-interaction edge cases considered.
4. Manual checks and build commands.
```

**Verification checklist**

- [ ] Existing successful flows still behave the same.
- [ ] Loading and errors cannot leave controls permanently disabled.
- [ ] Unmount or selection changes cancel stale reads.
- [ ] Destructive actions require explicit user intent.
- [ ] `pnpm build` succeeds and browser console has no new errors.

### Backend regression test

**Input required**

- Acceptance criteria and implementation diff.
- Existing test conventions and migrations.
- Expected HTTP statuses and JSON response fields.

```text
Propose regression tests for this StudyMate backend change.

Behavior under test: {{behavior}}
Allowed test files: {{allowed_test_files}}
Implementation diff: {{implementation_diff}}
Existing related tests: {{existing_tests}}

Constraints:
- Test public behavior rather than private implementation details.
- Include success, boundary input, malformed input and cross-user access where relevant.
- Verify persistence or absence of side effects with database assertions.
- Use isolated H2 database names and run Flyway migrations.
- Do not weaken assertions just to make a failing test pass.
- Do not use real credentials, network services or user documents.

Return:
1. A coverage matrix mapped to acceptance criteria.
2. Proposed test code.
3. Any behavior that remains untested and why.
```

**Verification checklist**

- [ ] The test fails for the relevant broken behavior and passes after the fix.
- [ ] Test data is isolated and cleaned in foreign-key-safe order.
- [ ] Status, error code and response shape are asserted where relevant.
- [ ] Database side effects are asserted.
- [ ] The complete `./mvnw.cmd test` suite succeeds.

### Debugging and code review

**Input required**

- Reproduction steps and expected versus actual behavior.
- Complete error cause chain or minimal failing test output.
- Relevant diff and the smallest set of source/configuration files.

```text
Help debug and review this StudyMate issue as a pair programmer.

Observed behavior: {{observed_behavior}}
Expected behavior: {{expected_behavior}}
Reproduction: {{reproduction_steps}}
Error or failing test: {{error_output}}
Allowed files: {{allowed_files}}
Relevant diff: {{diff}}

Constraints:
- Separate confirmed evidence from hypotheses.
- Trace the first actionable root cause; do not stop at wrapper exceptions.
- Do not request or print passwords, tokens, private documents or production data.
- Prefer the smallest safe fix and preserve API/database compatibility.
- Do not disable validation, authorization or failing tests to hide the issue.

Return:
1. Ranked root-cause hypotheses with evidence for each.
2. Read-only checks that distinguish the hypotheses.
3. The minimal fix after the cause is confirmed.
4. A regression test and commands to verify the fix.
5. Residual risks requiring human review.
```

**Verification checklist**

- [ ] Root cause is supported by logs, a failing test or code evidence.
- [ ] The proposed fix is limited to the confirmed cause.
- [ ] A regression test covers the observed failure.
- [ ] Full backend tests and/or frontend build succeed.
- [ ] Evidence records what AI suggested and what the developer accepted or changed.
