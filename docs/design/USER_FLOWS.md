# StudyMate User Flows

## Figma handoff

No Figma account or file is available in this session, so this repository contains the source specification rather than a claimed Figma artefact. Import these flows into a Figma page named `StudyMate Chapter 4`, create one section per flow, then record the file and prototype URLs in `docs/design/FIGMA_LINKS.md`.

## 1. Start a study workspace

```mermaid
flowchart TD
    A[Open StudyMate] --> B{Authenticated?}
    B -- No --> C[Log in or register]
    C --> D[Dashboard]
    B -- Yes --> D
    D --> E{Has course?}
    E -- No --> F[Create first course]
    F --> G[Course workspace]
    E -- Yes --> G[Open a course]
```

## 2. Upload and process a document

```mermaid
flowchart TD
    A[Course workspace] --> B[Open document library]
    B --> C[Choose PDF or DOCX]
    C --> D{File valid?}
    D -- No --> E[Show clear validation guidance]
    D -- Yes --> F[Create pending document]
    F --> G[Processing: extract and index content]
    G --> H{Processing successful?}
    H -- Yes --> I[Ready for chat and quiz]
    H -- No --> J[Failed state with retry guidance]
```

## 3. Ask a grounded question

```mermaid
flowchart TD
    A[Open or create study session] --> B[Select ready documents]
    B --> C{At least one selected?}
    C -- No --> D[Prompt user to select a document]
    C -- Yes --> E[Ask question]
    E --> F[Retrieve relevant chunks]
    F --> G{Evidence sufficient?}
    G -- Yes --> H[Show answer with citations]
    G -- No --> I[Say information was not found]
    H --> J[Save session history]
    I --> J
```

## 4. Generate and complete a quiz

```mermaid
flowchart TD
    A[Course workspace] --> B[Select ready document]
    B --> C[Choose quiz settings]
    C --> D[Generate editable quiz]
    D --> E[Answer questions]
    E --> F[Review unanswered questions]
    F --> G[Submit quiz]
    G --> H[Show score, explanations, and sources]
    H --> I[Save attempt]
```

## Flow acceptance checks

- Every flow offers a useful next action after an empty, loading, or failure state.
- Document answers and quiz feedback retain a path back to the course source.
- A student can return to Dashboard or the course workspace without losing context.
