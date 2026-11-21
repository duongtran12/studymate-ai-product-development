# StudyMate Demo Script

Duration: 3 to 5 minutes

## Before presenting

1. Start PostgreSQL, Spring Boot and the React frontend.
2. Open a clean browser window and sign in with a prepared demo account.
3. Keep `studymate-demo-unit-testing.docx` ready to upload.
4. Keep the manual Quiz fallback open in another tab.

## 1. Problem and overview — 20 seconds

“StudyMate helps a student turn course documents into an organized learning workflow. Instead of switching between files, chat notes and separate Quiz tools, the student can manage a course, ask grounded questions and measure revision progress in one place.”

## 2. Document workflow — 45 seconds

Create or open the Software Testing course. Open Documents and upload `studymate-demo-unit-testing.docx`. Point out the processing status, then open the extracted-content preview. Explain that the extracted chunks become the allowed source for later answers and Quiz generation.

## 3. Grounded study session — 60 seconds

Open Study Sessions, create “Ôn Unit Test” and select the uploaded document. Ask: “Unit Test kiểm tra điều gì?” Point out the answer, citation and source excerpt. Then explain that StudyMate returns an insufficient-context message rather than inventing a source when the document does not support a question.

## 4. Quiz and feedback — 60 seconds

Open Quiz. If AI is configured, generate a short easy Quiz from the uploaded document and review the draft before saving. Otherwise create the fallback Quiz from `MANUAL_QUIZ_FALLBACK.md`. Answer once incorrectly to show the correct answer and explanation, then retry and submit correctly. Point out the saved score and attempt history.

## 5. Learning dashboard — 35 seconds

Return to Dashboard. Show Quiz performance, the “Ôn lại” shortcut for weak results, learning goals, automatic recommendations and the activity timeline. Explain that this turns completed learning actions into a next-step plan.

## 6. Quality and close — 20 seconds

Show the README badge or GitHub Actions page. “Every push runs backend tests plus frontend tests, lint and build. The project also includes an API-level end-to-end learning journey.” Close by stating that StudyMate already supports the complete manual learning path without an external AI key; live AI generation is an optional enhancement.

## Recovery notes

- If document extraction fails, re-upload the provided DOCX and use the status action to process it again.
- If the AI provider is unavailable, use the manual Quiz fallback; do not spend demo time debugging an external API.
- If the session lacks a citation, confirm that the document status is Ready and that it was selected when creating the session.
