# StudyMate AI Usage Policy

## Purpose

StudyMate uses generative AI to support the team during analysis, design, implementation, review, testing, and documentation. AI output is an input to the team's work, not an authority or a replacement for engineering judgment.

## Approved uses

- Brainstorm user stories, acceptance criteria, interface ideas, and test cases.
- Draft code, refactoring suggestions, SQL examples, and technical documentation.
- Generate answer and quiz drafts from course-document excerpts supplied by the retrieval pipeline.
- Review source code for likely defects, code smells, security concerns, and missing tests.

## Required human review

Before an AI-generated result is committed, the author must verify that it:

1. satisfies the relevant requirement and acceptance criterion;
2. does not expose credentials, personal data, or private course material;
3. has been checked against documentation, tests, or a reproducible manual scenario; and
4. is understandable enough for another team member to maintain.

## StudyMate answer policy

- An answer to a course-material question must be grounded in retrieved document chunks.
- The interface must show citations or excerpts used for the answer.
- When the retrieval result is insufficient, the system must say that the information was not found instead of inventing an answer.
- Generated quizzes are drafts that users can review; answers and explanations must retain source references where possible.

## Evidence to retain

For material AI-assisted work, the team stores the prompt version, a concise output summary, review notes, and the verification method in `docs/ai-evidence/` or the pull request description.
