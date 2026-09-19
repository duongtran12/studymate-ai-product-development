# StudyMate Figma and Anti-Slop Design Review

## Scope reviewed

The Chapter 4 prototype covers authentication, course dashboard, document upload and processing state, grounded chat with citations, and quiz feedback. It follows the visual brief and the guardrails in `ANTI_SLOP_GUARDRAILS.md`.

## AI and design-tool evidence

- OpenDesign: the repository contains a handoff prompt and decision brief in `DESIGN_BRIEF.md`. No OpenDesign export is claimed because the tool was not connected to this workspace.
- Figma: the file is available at https://www.figma.com/design/Bw7z9wxFoSA6p7zZGPTZLN. It is a draft shell only; the Figma Starter-plan MCP limit blocked import and editing after file creation. See `FIGMA_LINKS.md` for the exact pending actions.
- Anti-slop review: this review was applied to the React prototype and its source wireframe.

## Decisions made after review

### 1. Replace a generic landing page with a task-first dashboard

- Observed issue: the initial React page read like a broad product introduction and did not help a returning student resume a task.
- Decision: use course cards, a single create-course action, and a visible continue-study action.
- Result: `DashboardPage` now prioritizes course selection and the next study activity.

### 2. Make document processing states actionable

- Observed issue: a simple upload box does not explain when a document can be used for AI features.
- Decision: distinguish ready, pending/processing, and failed states with text labels and next actions.
- Result: the document library explains processing, gives retry guidance on failure, and limits study context to ready documents.

### 3. Treat citations and insufficient context as first-class UI

- Observed issue: a generic chatbot could make answers appear certain and hide the source.
- Decision: place citations immediately below the answer and render insufficient context as a helpful study outcome.
- Result: the chat prototype shows source location beside each supported answer and a clear no-context response.

### 4. Make quiz feedback useful for learning

- Observed issue: a score-only quiz does not show why an answer is wrong.
- Decision: after submission, show the explanation and document location.
- Result: the quiz screen has answer feedback plus a source reference.

## Accessibility and responsive checks

- Navigation has an active state and a mobile variant.
- Labels accompany file, form, radio, and checkbox controls.
- Processing and answer states use text in addition to color.
- The study-session layout collapses to one column on smaller screens.
- Keyboard focus is visible on form fields; a future visual test should verify focus for all buttons and links.

## Remaining limitation

The repository-side design and interactive React prototype are complete for Chapter 4. The Figma canvas import and clickable Figma prototype remain pending solely because the Figma Starter-plan MCP rate limit prevented any follow-up write after the empty file was created. Do not mark that external Figma artefact as complete until the pending checklist in `FIGMA_LINKS.md` has been executed.
