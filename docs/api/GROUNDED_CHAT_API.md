# StudyMate Grounded Chat API Contract

## Purpose

This contract defines the Chapter 5 boundary for study sessions and document-grounded chat. The current implementation persists sessions and messages and returns a deterministic mock assistant response. It does not call an LLM or perform retrieval yet, but its response model is designed so a later RAG pipeline can replace the mock without changing the public API.

## Common conventions

- Base path: `/api/v1`.
- Every request includes `X-User-Id` until real authentication is implemented.
- A user may access only their own study sessions and courses.
- A selected document must belong to the session course.
- Timestamps use ISO 8601 with an offset.
- Errors use the Spring HTTP problem response and an appropriate status code.
- Unknown or foreign-owned resources return `404` so the API does not disclose their existence.

## Grounding invariant

Every assistant message has one of these grounding states:

| State | Required behavior |
| --- | --- |
| `SUPPORTED` | `citations` contains at least one source that supports the response. |
| `INSUFFICIENT_CONTEXT` | The content clearly says `Chưa đủ căn cứ từ tài liệu đã chọn để trả lời câu hỏi này.` and `citations` is empty. |

The backend must never return `SUPPORTED` with an empty citation list. It must never invent a citation when the selected documents do not provide evidence. During Chapter 5, the supported response and its citation are explicitly marked as mock data because extraction and RAG are not implemented yet.

## Resource models

### Study session

```json
{
  "id": 42,
  "courseId": 7,
  "title": "Ôn tập chương Dependency Injection",
  "status": "ACTIVE",
  "documentIds": [18, 21],
  "createdAt": "2026-09-24T14:30:00+07:00",
  "updatedAt": "2026-09-24T14:35:00+07:00"
}
```

### Chat message

```json
{
  "id": 101,
  "sessionId": 42,
  "role": "ASSISTANT",
  "content": "Phản hồi mô phỏng cho giai đoạn lưu lịch sử hội thoại.",
  "groundingStatus": "SUPPORTED",
  "citations": [
    {
      "documentId": 18,
      "documentName": "chapter-03.pdf",
      "locator": "Tài liệu đã chọn",
      "excerpt": "Citation mô phỏng; nội dung tài liệu chưa được trích xuất ở Chương 5."
    }
  ],
  "createdAt": "2026-09-24T14:35:00+07:00"
}
```

User messages have `groundingStatus: null` and an empty `citations` array.

## Endpoints

### Create a study session

`POST /api/v1/study-sessions`

Request:

```json
{
  "courseId": 7,
  "title": "Ôn tập chương Dependency Injection",
  "documentIds": [18, 21]
}
```

Rules:

- `courseId` is required and must identify a course owned by the current user.
- `title` is required and has a maximum length of 200 characters.
- `documentIds` may be empty, but every supplied document must belong to the course.
- Duplicate document IDs are stored only once.

Response: `201 Created` with a Study session body and a `Location` header.

### List study sessions

`GET /api/v1/study-sessions`

Optional query parameter: `courseId`.

The response is an array of the current user's sessions, newest activity first. When `courseId` is supplied, the API first verifies course ownership and returns only sessions for that course.

### Get a study session

`GET /api/v1/study-sessions/{sessionId}`

Response: `200 OK` with a Study session body.

### Get message history

`GET /api/v1/study-sessions/{sessionId}/messages`

Response: `200 OK` with messages ordered by creation time and ID.

### Send a question

`POST /api/v1/study-sessions/{sessionId}/messages`

Request:

```json
{
  "question": "Dependency injection là gì?"
}
```

Rules:

- `question` is required and has a maximum length of 4,000 characters.
- The API persists the user message before creating the assistant message.
- In Chapter 5, a session with selected documents returns a clearly labelled mock `SUPPORTED` answer and citation.
- A session without selected documents returns `INSUFFICIENT_CONTEXT` with the required no-evidence sentence.
- A future RAG service will replace only the response-generation step; persistence and response shapes remain stable.

Response: `201 Created`:

```json
{
  "userMessage": {
    "id": 100,
    "sessionId": 42,
    "role": "USER",
    "content": "Dependency injection là gì?",
    "groundingStatus": null,
    "citations": [],
    "createdAt": "2026-09-24T14:35:00+07:00"
  },
  "assistantMessage": {
    "id": 101,
    "sessionId": 42,
    "role": "ASSISTANT",
    "content": "Phản hồi mô phỏng cho giai đoạn lưu lịch sử hội thoại.",
    "groundingStatus": "SUPPORTED",
    "citations": [
      {
        "documentId": 18,
        "documentName": "chapter-03.pdf",
        "locator": "Tài liệu đã chọn",
        "excerpt": "Citation mô phỏng; nội dung tài liệu chưa được trích xuất ở Chương 5."
      }
    ],
    "createdAt": "2026-09-24T14:35:00+07:00"
  }
}
```

## Error responses

| Scenario | Status |
| --- | --- |
| Missing or invalid request data | `400 Bad Request` |
| Course, document, or session is absent or not owned by the current user | `404 Not Found` |
| Unexpected persistence or serialization failure | `500 Internal Server Error` |

## Future RAG integration boundary

The study-session service owns authorization, session scope, message persistence, ordering, and the public DTOs. A future grounded-answer component will receive the question plus authorized document IDs and return assistant content, grounding status, and citations. Model output is untrusted: the service must validate that every `SUPPORTED` result has citations and downgrade an invalid result to `INSUFFICIENT_CONTEXT` before saving or returning it.
