# Chapter 8 frontend manual test checklist

## Purpose

Use this checklist during local acceptance testing or the Chapter 8 demo. Each row describes one user action and an observable expected result. Mark exactly one status only after performing the step against a running frontend, backend and database.

Status format: `☐ Pass  ☐ Fail`. For a failure, add a short note and issue/commit reference.

## Test environment record

| Field | Value |
| --- | --- |
| Tester |  |
| Test date/time |  |
| Git commit |  |
| Browser/version |  |
| Backend URL | `http://localhost:8080` unless overridden |
| Frontend URL | `http://localhost:5173` unless overridden |
| Test user (`VITE_API_USER_ID`) |  |
| PostgreSQL/database |  |

## Preconditions

- PostgreSQL is running and the current Flyway migrations have completed.
- Spring Boot is running without startup errors.
- The frontend is running with `pnpm dev` and points to the intended API/user.
- A valid PDF and DOCX under 10 MB are available.
- Invalid samples include a `.txt` file and a PDF/DOCX larger than 10 MB.
- Unless a case says otherwise, start with a user who has no Course data.

## Dashboard

| ID | Action | Expected result | Status | Notes/evidence |
| --- | --- | --- | --- | --- |
| DASH-01 | Open `/` while the Course request is still pending, using browser network throttling if needed. | A visible “Đang tải danh sách môn học…” state appears; the page is not blank. | ☐ Pass ☐ Fail |  |
| DASH-02 | Open `/` for a user with no Courses. | “Bạn chưa có môn học” and a “Tạo môn học” action are visible. | ☐ Pass ☐ Fail |  |
| DASH-03 | Stop the backend and reload the Dashboard. | A user-friendly connection error and “Thử lại” action appear; no stack trace or internal URL is shown. | ☐ Pass ☐ Fail |  |
| DASH-04 | Restart the backend and click “Thử lại”. | The Course list loads without a full browser refresh. | ☐ Pass ☐ Fail |  |

## Course create, edit and delete

| ID | Action | Expected result | Status | Notes/evidence |
| --- | --- | --- | --- | --- |
| COURSE-01 | Click “+ Tạo môn học”, enter a valid name, code and description, then submit. | One POST request is sent; the new card appears with normalized values and a success message. | ☐ Pass ☐ Fail |  |
| COURSE-02 | Open the create form with a blank/whitespace name. | Submission remains unavailable or validation explains that the name is required; no Course is created. | ☐ Pass ☐ Fail |  |
| COURSE-03 | Enter values at the documented limits: name 160, code 50 and description 1,000 characters. | The form accepts the values and does not display a client length error. | ☐ Pass ☐ Fail |  |
| COURSE-04 | Click “Sửa”, change name, code and description, then click “Lưu”. | One PUT request is sent; the card updates and a success message appears. | ☐ Pass ☐ Fail |  |
| COURSE-05 | Start editing and click “Hủy”. | The editor closes and the original Course values remain unchanged. | ☐ Pass ☐ Fail |  |
| COURSE-06 | Click “Xóa” and cancel the confirmation dialog. | No DELETE request is sent and the Course card remains visible. | ☐ Pass ☐ Fail |  |
| COURSE-07 | Click “Xóa” and confirm. | One DELETE request is sent; the Course card disappears and a success message appears. | ☐ Pass ☐ Fail |  |
| COURSE-08 | Double-click a create/save/delete action while its request is pending. | The relevant inputs/actions are disabled and only one mutation request is submitted. | ☐ Pass ☐ Fail |  |

## Document Library

| ID | Action | Expected result | Status | Notes/evidence |
| --- | --- | --- | --- | --- |
| DOC-01 | Open `/documents` for a user with no Courses. | “Chưa có môn học” appears and upload is disabled. | ☐ Pass ☐ Fail |  |
| DOC-02 | Select a Course with no documents. | “Môn học chưa có tài liệu” appears with upload guidance. | ☐ Pass ☐ Fail |  |
| DOC-03 | Upload a valid PDF under 10 MB. | Upload is disabled while pending; one POST request is sent; the PDF appears in the list with a success message. | ☐ Pass ☐ Fail |  |
| DOC-04 | Upload a valid DOCX under 10 MB. | The DOCX is accepted and appears with filename, size and processing status. | ☐ Pass ☐ Fail |  |
| DOC-05 | Select a `.txt` or other unsupported extension. | Client validation displays “Chỉ hỗ trợ tệp PDF hoặc DOCX”; no upload request is sent. | ☐ Pass ☐ Fail |  |
| DOC-06 | Select a PDF/DOCX larger than 10 MB. | Client validation displays the 10 MB limit; no upload request is sent. | ☐ Pass ☐ Fail |  |
| DOC-07 | Make the API reject an otherwise valid upload, then click “Thử lại”. | A clear backend-derived message appears; retry submits the same pending file once. | ☐ Pass ☐ Fail |  |
| DOC-08 | Switch between Courses in the filter. | The URL query and document list change to the selected Course without showing the previous Course’s documents. | ☐ Pass ☐ Fail |  |
| DOC-09 | Delete a document, first canceling and then confirming. | Cancel preserves the row; confirm sends one DELETE request, removes the row and shows success. | ☐ Pass ☐ Fail |  |

## Study Session and grounded chat

| ID | Action | Expected result | Status | Notes/evidence |
| --- | --- | --- | --- | --- |
| STUDY-01 | Open `/study-sessions` while Course/session data is pending. | A visible loading state appears and duplicate controls are disabled where applicable. | ☐ Pass ☐ Fail |  |
| STUDY-02 | Create a session with a valid title and one selected document. | The session is created, becomes active and retains the selected document scope. | ☐ Pass ☐ Fail |  |
| STUDY-03 | Try to create/send with a blank title or blank question. | Client or API validation explains the missing value; no invalid session/message is added. | ☐ Pass ☐ Fail |  |
| STUDY-04 | Ask a question in a session with a selected document. | User and assistant messages appear; a `SUPPORTED` answer displays at least one citation with document information. | ☐ Pass ☐ Fail |  |
| STUDY-05 | Ask a question in a session with no selected documents. | The assistant states “Chưa đủ căn cứ từ tài liệu…” with `INSUFFICIENT_CONTEXT` and no citation. | ☐ Pass ☐ Fail |  |
| STUDY-06 | Submit a question and immediately try to submit again. | The form is disabled while pending and only one chat request is submitted. | ☐ Pass ☐ Fail |  |
| STUDY-07 | Stop the backend while loading sessions or messages, then retry after restart. | A safe error is shown; retry restores the relevant data without exposing technical details. | ☐ Pass ☐ Fail |  |

## Quiz prototype

| ID | Action | Expected result | Status | Notes/evidence |
| --- | --- | --- | --- | --- |
| QUIZ-01 | Open `/quizzes`. | The prototype question, source, answer options and disabled submit button are visible. | ☐ Pass ☐ Fail |  |
| QUIZ-02 | Select the correct answer and submit. | Feedback says “Chính xác.”, explains the answer and displays a source label; options cannot be changed after submission. | ☐ Pass ☐ Fail |  |
| QUIZ-03 | Select an incorrect answer and submit. | Feedback says “Chưa đúng.” and still displays the explanation and source. | ☐ Pass ☐ Fail |  |
| QUIZ-04 | Click “Làm lại” after submitting. | Selection and feedback clear; submit returns to its disabled state. | ☐ Pass ☐ Fail |  |
| QUIZ-05 | Exercise the loading, error/retry and empty-data states in the test harness/component tests. | Each state has explicit user-facing content; the empty state renders no answer controls. | ☐ Pass ☐ Fail |  |

## Ownership and responsive smoke checks

| ID | Action | Expected result | Status | Notes/evidence |
| --- | --- | --- | --- | --- |
| CROSS-01 | Change `VITE_API_USER_ID` to a different valid user and reload. | Courses, documents and sessions owned by the original user are not visible or accessible. | ☐ Pass ☐ Fail |  |
| CROSS-02 | Test Dashboard, Document Library, Study Session and Quiz at a viewport no wider than 760 px. | Navigation and primary actions remain readable, reachable and free of horizontal content loss. | ☐ Pass ☐ Fail |  |

## Exit criteria

- All critical cases `COURSE-01`, `COURSE-04`, `COURSE-07`, `DOC-03`, `DOC-04`, `STUDY-04`, `STUDY-05` and `CROSS-01` are marked Pass.
- Every Fail has reproduction notes and an issue or fixing commit.
- `pnpm test`, `pnpm lint` and `pnpm build` pass on the same commit recorded above.
- The Chapter 8 evidence report distinguishes automated results from the manually executed rows in this checklist.
