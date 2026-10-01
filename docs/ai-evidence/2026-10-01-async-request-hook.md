# Reusable async request state hook evidence

- Date: 2026-10-01
- Owner: Member 2
- Related requirement or issue: Chapter 6 frontend request-state reuse
- Tool or model: Codex
- Prompt version: v1

## Prompt

Design a reusable React hook for the existing frontend that owns loading, error, retry, and request cancellation. Apply it to read requests in Dashboard, Document Library, and Study Session without changing API contracts or successful user flows. Account for rapid selection changes and component unmounts.

## Output summary

The AI proposed `useAsyncRequest`, which passes an `AbortSignal` to a caller-supplied request, cancels the previous run, retains the latest arguments for retry, and exposes data/error/loading state. The three pages now use it for their read flows while keeping create, update, delete, upload, and chat mutations explicit.

## Human review

- What was verified: Cancellation on unmount and selection changes, stale-response protection, retry with the previous request arguments, `AbortError` handling, and React Strict Mode effect cleanup.
- What was changed or rejected: Rejected automatic retries for POST/DELETE operations because they can duplicate side effects; kept mutation messages local to each page; added request IDs so a slow cancelled response cannot overwrite newer state; grouped the Study Session reads into course/session context requests to preserve its previous behavior.
- Verification method: `pnpm build` succeeded; `git diff --check` succeeded; reviewed the changed-file list to confirm no backend, local data, dependency output, or environment files were included.
- Reviewer: Member 2
