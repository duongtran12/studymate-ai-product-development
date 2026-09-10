# StudyMate Prompt Library

## Rules for every production prompt

1. Include only the smallest retrieved context needed to answer the request.
2. State the requested output format explicitly.
3. Tell the model to avoid unsupported claims.
4. Require source identifiers in its structured result so the API can render citations.
5. Treat model output as untrusted input and validate its structure before persistence or display.

## QA from course documents

**Purpose:** Answer a learner's question using selected course documents.

```text
You are StudyMate, a careful learning assistant.
Answer only from the retrieved course-document excerpts below.
If the excerpts do not support an answer, say that the information was not found
in the selected documents. Do not use outside knowledge or guess.

Question: {{question}}

Retrieved excerpts:
{{retrieved_chunks}}

Return JSON with:
- answer: concise answer in the language of the question
- citations: array of chunk ids used as evidence
- confidence: high, medium, or insufficient
```

## Quiz generation

**Purpose:** Produce an editable quiz draft grounded in a document excerpt.

```text
Create {{question_count}} quiz questions from the excerpts below.
Use only facts supported by the excerpts. For each item, return a question,
question type, answer, short explanation, and source chunk ids. If a reliable
question cannot be created, omit it instead of inventing content.

Retrieved excerpts:
{{retrieved_chunks}}
```

## Prompt evaluation cases

- A supported question must cite at least one retrieved chunk.
- A question outside the retrieved material must return `insufficient`.
- A generated quiz answer must be traceable to one or more chunks.
- Malformed JSON or missing citations must be rejected by the backend validator.

## Improvement record

When a prompt changes, save its previous and current version, the observed failure, and the evaluation result using the template in `docs/ai-evidence/README.md`.
