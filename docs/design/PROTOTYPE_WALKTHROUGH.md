# StudyMate MVP Prototype Walkthrough

## Goal

The Chapter 4 prototype demonstrates that a student can reach the core learning actions without needing backend data. It covers the same MVP scope as the PRD and is the review script for the clickable frontend prototype introduced with the application layout.

## Demo script

1. Open Dashboard and identify a course to continue.
2. Open the course workspace and navigate to Documents.
3. Select the upload action and observe the valid, processing, ready, and failed document states.
4. Open a study session, select ready documents, ask a question, and inspect its citation.
5. Navigate to Quiz, choose an available document, complete a question, and view source-aware feedback.

## Prototype success criteria

- Every main navigation destination is reachable from the shared application layout.
- The student can always identify the current course or study context.
- A source citation is visible with an AI-generated answer or quiz explanation.
- Empty, processing, error, and insufficient-context states communicate a next action.
- The prototype does not imply that its mock data is already backed by a production AI service.

## Figma delivery checklist

When a Figma file is created, add its links in `FIGMA_LINKS.md` and verify that its clickable prototype follows this walkthrough. Export screenshots of the final frames to `docs/design/assets/` only if the team wants repository-side visual evidence.
