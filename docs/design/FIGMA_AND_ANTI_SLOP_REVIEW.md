# StudyMate Figma and Anti Slop Design Review

## Review scope

This review records the design reasoning behind the Chapter 4 frontend prototype. The implementation covers authentication, course navigation, document processing states, grounded chat, and source-aware quiz feedback. It uses mock data so the team can validate the learning flow before connecting production APIs.

## Design evidence

The team Figma file has not been linked yet. The approved links must be added to [FIGMA_LINKS.md](./FIGMA_LINKS.md) after a team member creates or confirms the shared file.

- User flow specification: [USER_FLOWS.md](./USER_FLOWS.md)
- Initial low-fidelity source: [studymate-low-fidelity-wireframes.svg](./assets/studymate-low-fidelity-wireframes.svg)
- Implemented dashboard, desktop: [chapter-4-dashboard-after.png](./assets/chapter-4-dashboard-after.png)
- Implemented dashboard, mobile: [chapter-4-dashboard-mobile-after.png](./assets/chapter-4-dashboard-mobile-after.png)
- Implemented grounded chat: [chapter-4-chat-after.png](./assets/chapter-4-chat-after.png)
- Implemented quiz setup: [chapter-4-quiz-after.png](./assets/chapter-4-quiz-after.png)
- Implemented document library, mobile: [chapter-4-documents-mobile-after.png](./assets/chapter-4-documents-mobile-after.png)

The repository images provide before-and-after evidence while the external Figma links remain pending. A pull request must not claim that the Figma prototype is complete until those links have been reviewed by the team.

## Design direction

OpenDesign was not connected during implementation, so no external output is claimed. The team used the existing structured study desk brief as the design direction: a warm neutral canvas, a compact navy navigation area, white task surfaces, and a blue-green accent reserved for primary actions and ready states. The interface keeps the current course or study session visible and gives document evidence the same reading weight as the AI answer.

The working prompt was:

> Design a desktop-first Vietnamese study workspace named StudyMate. Prioritize course documents, grounded answers with readable citations, and source-aware quiz review. Use a quiet, structured study desk direction. Avoid marketing heroes, decorative gradients, repeated metric cards, and generic AI copy. Include useful empty, loading, failed, and insufficient-context states, then adapt the same hierarchy for mobile.

No API key, personal data, private course content, or production credential was included in the prompt or screenshots.

## Anti slop checklist

- [x] Each screen prioritizes a study task: create a course, upload a document, ask a question, or complete a quiz.
- [x] Citations sit directly below the related answer or quiz explanation.
- [x] Empty, loading, validation, processing, failed, and insufficient-context states explain the next action.
- [x] Upload and quiz states use a text label in addition to color.
- [x] Cards and bordered surfaces are limited to actionable or evidence-bearing content.
- [x] Copy is specific Vietnamese product language rather than marketing language.
- [x] Desktop navigation remains compact and mobile navigation stays available at the bottom of the viewport.
- [x] Desktop and 390 px mobile screenshots were checked for the dashboard and core content layouts.
- [ ] Team Figma file, frames, and clickable prototype links have been added and reviewed.

## Changes made after review

### 1 Dashboard hierarchy

- **Problem:** The original placeholder behaved like a generic product introduction and did not help a student resume work.
- **AI or OpenDesign feedback:** The structured study desk direction called for the next learning action to be visible without a marketing hero.
- **Team decision:** Lead with a short greeting, one recent study session, and a purposeful course list.
- **Change in Figma or code:** The dashboard now provides “Tiếp tục học”, “Tạo môn học”, immediate mock list updates, and direct course routes.

### 2 Grounded answer trust

- **Problem:** A conventional chat bubble can make an AI response look authoritative even when its evidence is weak.
- **AI or OpenDesign feedback:** Citation context should be adjacent to the answer, and insufficient evidence should be treated as a valid outcome.
- **Team decision:** Show confidence wording, the real mock document name and location, an open-source action, and a calm insufficient-context state.
- **Change in Figma or code:** The study session places a readable citation block under each supported answer and omits citations when no evidence is found.

### 3 Document processing feedback

- **Problem:** A large upload drop zone alone does not explain what happens after a file is selected.
- **AI or OpenDesign feedback:** Students need status meaning and a recovery action, not color alone.
- **Team decision:** Keep upload compact and dedicate the remaining surface to the document list.
- **Change in Figma or code:** Pending, processing, ready, and failed states now include text, explanatory copy, retry guidance, file validation, and confirmed deletion.

### 4 Quiz feedback

- **Problem:** A score-only result does not help a student correct a misconception.
- **AI or OpenDesign feedback:** Incorrect answers should retain both explanation and source context.
- **Team decision:** Make the result screen a review surface, not a celebration screen.
- **Change in Figma or code:** Each result displays the learner response, suggested answer when needed, explanation, citation, and actions to retry or return to the course.

### 5 Mobile overflow

- **Problem:** Long Vietnamese headings and document names could force a content column wider than a narrow viewport.
- **AI or OpenDesign feedback:** The mobile check identified clipped content as a higher-priority issue than decorative refinements.
- **Team decision:** Allow primary content and nested flex items to shrink and wrap naturally.
- **Change in Figma or code:** The application content, workspace, upload area, and document text now have explicit minimum-width and wrapping constraints.

## Verification

The frontend production build was run after each feature commit. The final review repeated the build and captured desktop and 390 px mobile views. The prototype remains intentionally disconnected from authentication, upload, AI, and persistence APIs; mock behavior is labeled where it could otherwise imply production functionality.

## Pull request notes

Before merge, add the real Figma file, user-flow frame, wireframe frame, clickable prototype, and design-review frame to [FIGMA_LINKS.md](./FIGMA_LINKS.md). The pull request should include the successful `pnpm build` result and link to this review. It should also note that the generic centered illustration-led authentication layout was rejected because it did not support a learning task.
