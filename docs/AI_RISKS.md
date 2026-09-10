# StudyMate AI Risk Register

## Scope

This register covers risks created by AI-assisted development and by the document-grounded assistant delivered to students.

## Risks and controls

### Hallucinated or unsupported answers

- Risk: the assistant presents information that is absent from the selected course documents.
- Control: answer generation receives only retrieved chunks; the response includes citations; weak retrieval produces a clear "not found in selected documents" response.
- Verification: automated tests cover the no-context path and manual reviewers compare answers with cited excerpts.

### Incorrect quiz content

- Risk: generated questions, answers, or explanations are inaccurate.
- Control: retain source chunks with every generated item and label generated quizzes as editable drafts.
- Verification: reviewers sample quiz items against their document sources before demonstration.

### Private document exposure

- Risk: one user retrieves another user's uploaded material.
- Control: ownership checks apply to documents, chunks, conversations, and quizzes; file storage uses non-public locations.
- Verification: integration tests attempt cross-user access and must receive a forbidden or not-found response.

### Sensitive data in prompts or logs

- Risk: credentials, personal data, or unnecessary full documents are sent to an AI provider or written to logs.
- Control: keep secrets in environment variables, redact operational logs, and send the smallest relevant context to AI services.
- Verification: code review checks configuration, log statements, and prompt payload construction.

### Overreliance on AI-generated development work

- Risk: the team commits unreviewed code or documentation suggested by AI.
- Control: follow the review checklist in `AI_USAGE.md`; every production behavior requires tests or a documented manual verification.
- Verification: pull-request review and linked test evidence.

## Review cadence

The team revisits this register after the first end-to-end RAG flow, before release, and whenever an AI provider or prompt pattern changes.
