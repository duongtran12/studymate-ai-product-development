# Backend Code Quality Baseline

## Purpose

This baseline defines the Chapter 7 quality standard for StudyMate's Spring Boot backend. It is used during AI-assisted refactoring and review so that code changes improve maintainability without changing public API behavior.

## Layer responsibilities

- Controllers translate HTTP requests and responses only. They use `@CurrentUserId` and do not perform business authorization.
- Services own validation, authorization, transaction boundaries and business rules.
- Repositories perform persistence queries only; owner-scoped queries must be used for owner-scoped resources.
- Shared policies such as Course access and document upload validation live in dedicated components rather than being duplicated across services.

## Refactoring rules

- Preserve public routes, response DTOs and HTTP status behavior unless a user story explicitly changes them.
- Keep methods focused on one responsibility. Extract a collaborator when a method mixes authorization, validation, storage and persistence orchestration.
- Prefer immutable DTOs and records for request, response and value objects.
- Do not add framework dependencies merely to avoid a small extraction.
- Do not edit an applied Flyway migration; use a new migration for every schema change.

## Reliability and security checks

- All Course, Document and Study Session access is scoped to the current user.
- Validation happens before a local file is persisted.
- Failed persistence after local storage must remove the stored file.
- API errors use the shared Problem Details response and never expose stack traces, secrets or storage paths.
- A supported grounded answer has citations; an insufficient-context answer has no citations.

## Review checklist

- [ ] No duplicated authorization or file-validation rule remains in a service.
- [ ] Names communicate intent without relying on implementation detail.
- [ ] Null, empty and size-limit cases are handled deliberately.
- [ ] New behavior has success, invalid-input and cross-user regression coverage where applicable.
- [ ] `./mvnw.cmd test` and `git diff --check` pass before commit.
