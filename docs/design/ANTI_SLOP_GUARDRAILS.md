# StudyMate Anti-Slop UI Guardrails

## Purpose

These guardrails keep StudyMate focused on study work rather than generic AI-product decoration. A component must help a student make a learning decision, complete a task, or verify information.

## Hard rules

- Do not use a marketing hero section inside the authenticated application.
- Do not use gradients as a substitute for hierarchy or meaning.
- Do not show repeated metric cards unless each metric leads to a distinct action.
- Do not use generic copy such as "Unlock your potential" or "Your AI-powered journey starts here".
- Do not present AI output as certain when it is grounded only in selected documents.
- Do not use color as the only indicator of upload, processing, ready, failed, correct, or incorrect states.

## StudyMate-specific checks

### Navigation and hierarchy

- The current course or study session is always visible in context.
- One primary action is clear on each page: create a course, upload a document, ask a question, or submit a quiz.
- Navigation stays compact; it must not compete with document or chat content.

### Document processing

- Status messages explain what is happening, for example: "Dang trich xuat noi dung de chuan bi hoi dap".
- Failed uploads describe an action the student can take.
- Empty states direct a student to a next useful action.

### Grounded answers and quizzes

- Citations are adjacent to the relevant answer, not hidden in a distant footer.
- An insufficient-context answer is a valid study outcome, not styled as a system crash.
- Quiz feedback includes an explanation and source context where available.

### Visual restraint

- Prefer spacing, type hierarchy, and semantic labels over nested cards, excessive shadows, or ornamental icons.
- Use rounded surfaces consistently and sparingly.
- Check mobile layouts for clipped controls and hidden evidence.

## Review evidence

Each Chapter 4 UI pull request must note the checks that passed, a rejected generic design choice if one existed, and any follow-up needed before merge.
