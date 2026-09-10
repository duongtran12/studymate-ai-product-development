# StudyMate User Stories and Acceptance Criteria

## Authentication

### US-01 Register an account

As a new student, I want to register with an email and password so that my study data is private.

**Acceptance criteria**

- A valid, unused email and a valid password create an account.
- Duplicate emails return a clear validation error.
- Passwords are stored only as secure hashes.

### US-02 Sign in and out

As a registered student, I want to sign in and out so that I can use StudyMate securely.

**Acceptance criteria**

- Valid credentials create an authenticated session or token.
- Invalid credentials do not reveal whether an email exists.
- Protected APIs reject unauthenticated requests.

## Course documents

### US-03 Upload a course document

As a student, I want to upload a PDF or DOCX document so that StudyMate can use it for learning support.

**Acceptance criteria**

- The user can upload a supported file within the configured size limit.
- The library displays name, type, size, upload time, and processing status.
- Unsupported files and extraction failures show actionable errors.

### US-04 Manage my documents

As a student, I want to view and delete my documents so that my library remains relevant.

**Acceptance criteria**

- A user sees only documents that they own or were explicitly granted access to.
- A user can delete only their own document.
- Deleting a document removes it from future retrieval results.

## Grounded question answering

### US-05 Ask a question from selected documents

As a student, I want to ask a question within selected documents so that I can learn from trustworthy material.

**Acceptance criteria**

- The user can select one or more processed documents before asking.
- The response contains an answer and at least one source reference when evidence exists.
- When evidence is insufficient, the response says so instead of fabricating an answer.
- The conversation is saved within the current study session.

## Revision

### US-06 Generate and complete a quiz

As a student, I want to generate a quiz from my documents and view my result so that I can practise before an assessment.

**Acceptance criteria**

- A generated quiz contains supported question types, answers, explanations, and source references.
- The user can submit answers and view score and feedback.
- The system saves quiz attempts for the signed-in user.

## Study sessions

### US-07 Continue a study session

As a student, I want to reopen a previous study session so that I can continue learning with the same documents and chat history.

**Acceptance criteria**

- The user can create, list, and open their sessions.
- A session displays its related documents and question-answer history.
- Another user cannot open the session.
