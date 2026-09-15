# StudyMate Visual Design Brief

## Product intent

StudyMate is a focused workspace for learning from course documents. The interface should feel calm, structured, and trustworthy: students should immediately understand what to study next and why an AI answer can be trusted.

## Users and core tasks

- Students upload a course document and wait for it to become ready.
- Students ask questions within selected documents and inspect citations.
- Students generate a small quiz, complete it, and review explanations.

The primary task on each screen must be visible without scrolling on a typical laptop display.

## Chosen direction

**Structured study desk** is the chosen direction. It uses a quiet warm-gray canvas, white working surfaces, a deep navy reading color, and a blue-green accent reserved for meaningful actions and ready states. The layout follows the mental model of a course binder: navigation on the left, current work in the center, and evidence or details alongside the work when needed.

## Foundations

- Typography: system sans-serif for reliable Vietnamese rendering; a compact scale with strong page titles and readable body text.
- Spacing: 4px base unit; generous 24px and 32px section gaps rather than decorative whitespace.
- Surfaces: one primary content surface per task, with borders used only to separate actionable regions.
- Color semantics: blue-green for actions and ready state, amber for processing, red only for destructive or failed states, and neutral gray for supporting information.
- Accessibility: body text and state labels must not rely on color alone; interactive targets need visible keyboard focus.

## OpenDesign handoff

OpenDesign has not been connected to this workspace, so no external design export is claimed in this repository. When it is available, use this brief as the input prompt and store the resulting prototype URL, selected design-system name, screenshots, and review notes in `docs/design/OPEN_DESIGN_EVIDENCE.md`.

Suggested prompt:

```text
Design a desktop-first Vietnamese study workspace named StudyMate. Its core flows are course documents, grounded question answering with visible citations, and quiz review. Use a calm structured-study-desk direction: quiet warm-gray background, white working surfaces, deep navy text, blue-green accent for meaningful actions. Avoid marketing hero sections, generic gradient cards, and decorative dashboard metrics. Prioritize document processing status, evidence near AI answers, readable Vietnamese copy, and responsive navigation.
```
