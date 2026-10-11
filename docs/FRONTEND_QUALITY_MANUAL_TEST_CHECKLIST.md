# Frontend quality regression checklist

The frontend currently has no automated test runner or `test` script. Use this checklist after changes to API error handling, validation, or async UI states.

## Setup

1. Start PostgreSQL and the Spring Boot API.
2. From `frontend/`, run `pnpm dev`.
3. Use a valid demo `VITE_API_USER_ID`; use a new user with no data for empty-state checks.
4. Open browser developer tools. Use Network throttling or stop the API when a failure is required.

## Dashboard and course list

- [ ] With Slow 3G enabled, `/` and `/courses` show “Đang tải danh sách môn học…” instead of a blank page.
- [ ] A user with no courses sees the empty-state title, explanation, and “Tạo môn học” action.
- [ ] With the API stopped, the page shows a friendly connection message and “Thử lại”; restarting the API and retrying loads the courses.
- [ ] Submitting a blank course name is blocked with a Vietnamese validation message.
- [ ] Course name, code, and description respect limits of 160, 50, and 1,000 characters.
- [ ] Create, save, and delete buttons are disabled while their request is pending; rapid clicks do not create duplicate requests.

## Document Library

- [ ] Course loading and document loading each show a visible loading state.
- [ ] A user with no courses sees “Chưa có môn học”; a course with no documents sees “Môn học chưa có tài liệu”.
- [ ] Stopping the API produces the shared connection message and retry reloads the failed list.
- [ ] `.txt` and other unsupported files are rejected before upload with the PDF/DOCX message.
- [ ] A PDF or DOCX larger than 10 MB is rejected before upload.
- [ ] The course selector, file input, and document delete actions cannot be triggered repeatedly while a request is pending.

## Study Session

- [ ] Initial course/session requests show “Đang tải dữ liệu phiên học…”.
- [ ] A user with no courses sees the course empty state; a new session with no messages sees the question empty state.
- [ ] Failed course, session, or message-history requests show a friendly error and a retry action where retry is safe.
- [ ] A blank question is rejected, and the question input cannot exceed 4,000 characters.
- [ ] While a question is being sent, the textarea, send button, source selection, and session selection prevent duplicate actions.

## Quiz prototype

- [ ] The default prototype renders its question, answer choices, feedback, and disabled submit behavior correctly.
- [ ] In a local review harness, render `QuizPage` with `loading`, then with an `error` string, and then with a quiz containing an empty `options` array; verify the shared loading, error, and empty panels.
- [ ] Confirm no Quiz API call is introduced until a backend contract exists.

## Build and repository hygiene

- [ ] `pnpm build` completes successfully.
- [ ] `git diff --check` reports no whitespace errors.
- [ ] `frontend/node_modules`, `frontend/dist`, `.env`, and local data files are not staged.
