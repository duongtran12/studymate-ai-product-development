# Chapter 8 End-to-End User Journey Checklist

## Purpose

This checklist verifies StudyMate as one complete system journey during a manual demo. It records what to enter, what the system must show, and which failure signals to watch for. It is a test procedure only; no Pass/Fail result is pre-filled.

## Test record

| Field | Value |
| --- | --- |
| Tester |  |
| Date and time |  |
| Git commit |  |
| Browser |  |
| Backend profile/database |  |
| Test user (`X-User-Id`) |  |
| PDF/DOCX test file |  |

## Preconditions

- PostgreSQL is running and the backend starts without Flyway errors.
- The frontend is running and can reach the backend API.
- A valid test user exists in the database and the frontend uses that user's `X-User-Id`.
- Prepare one supported PDF or DOCX file smaller than 10 MB.
- Start with a course code that does not already exist for the test user.

## Complete journey

| Step | Input / action | Expected result | Failure signs to observe | Result / evidence |
| --- | --- | --- | --- | --- |
| 1. Create a course | Open **Môn học**, enter a non-empty name, unique code and optional description, then submit once. | The request completes successfully; the new course appears once with the entered values and remains visible after refresh. | Loading never ends; duplicate cards appear; validation is unclear; refresh loses the course; a failed request still creates data. | ☐ Pass ☐ Fail — Evidence: |
| 2. Upload a document | Open **Tài liệu**, select the course from step 1, choose the prepared PDF/DOCX and upload once. | Upload succeeds; one document row shows the correct course, original filename, file type, upload time and processing status. It remains after refresh. | Unsupported/empty file is accepted; file is linked to another course; duplicate metadata appears; an error leaves a stored file or row; message exposes a server stack trace. | ☐ Pass ☐ Fail — Evidence: |
| 3. Create a Study Session | Open **Phiên học**, select the course and the uploaded document, enter a non-empty title, then create the session. | A session is created for the selected course; its detail/history identifies the selected document and contains no chat messages yet. | A document from another course can be selected; repeated clicks create duplicate sessions; invalid input persists a partial session; the wrong course/document is displayed. | ☐ Pass ☐ Fail — Evidence: |
| 4. Ask a grounded question | In the session, ask a question whose answer is represented by the current grounded-answer mock and submit once. | The question and assistant answer appear in order and remain after reload. A `SUPPORTED` answer contains at least one visible citation with document identity and source details. | Submit remains enabled while sending; messages are duplicated or reordered; `SUPPORTED` is shown without a citation; history disappears after refresh; citation points outside the selected documents. | ☐ Pass ☐ Fail — Evidence: |
| 5. Check insufficient context | Ask a question for which the current mock has no grounded source, when such an input is supported by the implementation. | The answer is marked `INSUFFICIENT_CONTEXT`, clearly states that the documents do not provide enough basis, and does not invent a citation. | An unsupported claim is presented as grounded; status is `SUPPORTED` with no citation; a fake citation is emitted; request failure creates partial chat messages. | ☐ Pass ☐ Fail ☐ N/A — Evidence: |
| 6. Complete the Quiz prototype | Open **Quiz**, select an answer, submit/check it, inspect feedback and source text, then move/reset if the controls are available. | The prototype displays its predefined question, selection state, correctness feedback and source consistently without a page error. | Selection is ignored; multiple submissions corrupt state; feedback/source is missing; navigation crashes or shows stale state. | ☐ Pass ☐ Fail — Evidence: |

## Access-control and validation checkpoints

Run these checkpoints with disposable test data. A failed request must not create or modify records.

| Checkpoint | Input / action | Expected result | Failure signs to observe | Result / evidence |
| --- | --- | --- | --- | --- |
| Missing user identity | Send one protected API request without `X-User-Id`. | The API rejects it with the standard error JSON; no domain data is persisted. | Request succeeds, returns another user's data, or creates partial data. | ☐ Pass ☐ Fail — Evidence: |
| Other user's course | Use a second valid user to read/update/delete the first user's course or create a session for it. | Access is rejected without revealing or changing the protected resource. | Resource contents leak; update/delete succeeds; a session is persisted. | ☐ Pass ☐ Fail — Evidence: |
| Invalid upload | Attempt an empty file, unsupported extension/MIME type, and a file larger than 10 MB. | Each upload is rejected with a clear message; neither metadata nor a local file remains. | Invalid file appears in the library or storage; error is generic/technical; duplicate upload starts while pending. | ☐ Pass ☐ Fail — Evidence: |

## Current scope and exit criteria

- The Quiz screen is currently a frontend prototype. This checklist does not claim Quiz generation, backend persistence, scoring history, or linkage to the uploaded document.
- Grounded chat currently uses a deterministic mock generator, not a real RAG/LLM pipeline.
- This checklist is complete only when every applicable row has a tester-entered result and evidence such as a screenshot, API response, or database query reference.
- Any failed row must have an issue or review note before release; do not convert an unexecuted row into Pass.
