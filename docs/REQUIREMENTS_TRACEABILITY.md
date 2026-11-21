# StudyMate Requirements Traceability

Last reviewed: 2026-11-21

## Completion rule

A requirement is complete only when implementation, automated verification and a demo path all exist. “Complete with a demo dependency” means the product works locally but needs a configured external service before that optional path can be shown.

## MVP traceability

### FR-01 — Account and access control

- User stories: US-01, US-02.
- Implementation: registration, login, logout, Bearer session resolution, protected API boundaries, profile editing and secure password change with session invalidation.
- Verification: auth/profile service tests; core learning journey registers a user and uses the returned Bearer token.
- Status: **Complete**. The legacy `X-User-Id` fallback remains only for local compatibility and selected tests.

### FR-02 — Course document management

- User stories: US-03, US-04.
- Implementation: Course CRUD; PDF/DOCX upload, validation, extraction, status, preview, reprocessing, filtering and deletion; document chunks are persisted for retrieval.
- Verification: document API and service tests cover supported files, validation, extraction, ownership and deletion. The core journey uploads and ingests a DOCX.
- Status: **Complete**.

### FR-03 — Document-grounded question answering

- User stories: US-05.
- Implementation: source-scoped study sessions, persisted history, chunk retrieval, citations, insufficient-context response and optional OpenAI-compatible answer rewriting.
- Verification: study-session API/service tests and the core journey verify a supported answer from an uploaded document; no-source behavior is separately tested.
- Status: **Complete for local grounded retrieval**. A live LLM answer path is optional and requires configured provider credentials.

### FR-04 — Quiz-based revision

- User stories: US-06.
- Implementation: manual Quiz creation, source document references, attempt persistence, scoring, detailed answer feedback, history, deletion, search and dashboard performance. AI Quiz generation supports size and difficulty controls when an AI provider is configured.
- Verification: Quiz API tests cover creation, source ownership, scoring, feedback and history. The core journey creates a document-scoped Quiz and submits an attempt.
- Status: **Complete for manual Quiz flow**; **Complete with demo dependency for AI generation** because it requires an API key/provider.

### FR-05 — Study-session continuity

- User stories: US-07.
- Implementation: create/list/open/delete study sessions, document scope and persisted conversation history.
- Verification: study-session API tests cover continuation, history, ownership and deletion.
- Status: **Complete**.

## Cross-cutting evidence

- UX: responsive React pages, design guardrails, document/Quiz filtering, dashboard recommendations and learning goals.
- Quality: 72 backend tests, 50 frontend tests, ESLint and production build passed locally on 2026-11-21.
- Automation: GitHub Actions runs backend tests and frontend test/lint/build on every push and Pull Request.
- System journey: `CoreLearningJourneyIntegrationTests` exercises registration, upload, grounded study, Quiz creation and a scored attempt.

## Remaining items before final demonstration

1. Execute the browser manual checklists against a running local PostgreSQL environment and record Pass/Fail evidence; API-level tests do not replace this step.
2. Complete the Figma import and clickable prototype when the external Starter-plan rate limit is available; the repository-side design source is ready, but the Figma artifact remains pending.
3. Configure `STUDYMATE_AI_ENABLED`, a compatible API key and model if AI quiz generation or answer rewriting must be demonstrated live. The manual document/Quiz path works without it.
4. Run the application against local PostgreSQL for the final demo. Automated integration tests use H2 compatibility mode.
5. Review legacy chapter documents that still describe pre-implementation mock/prototype behavior; this matrix is the current source of truth.

## Out of MVP scope

Third-party drive sync, public sharing, voice interaction, native mobile applications and advanced predictive analytics remain out of scope.
