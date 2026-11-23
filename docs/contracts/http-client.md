# HTTP Client Contract

Use only `src/shared/api/http.ts` (`request` or `http` helpers).

## Behavior

- Default timeout: 15 seconds. Override with `timeoutMs`; pass `AbortSignal` for caller cancellation.
- Includes cookies for HttpOnly refresh-session requests.
- Adds in-memory Bearer access token unless `auth: false`.
- One shared refresh request is used for concurrent 401 responses.
- GET/HEAD/OPTIONS may be replayed after refresh. POST/PUT/PATCH/DELETE must carry `Idempotency-Key` to be automatically replayed.
- No generic retry for 5xx/network errors. Domain services decide whether a safe retry is appropriate.
- Errors normalize into `ApiError(status, message, body, requestId)`; status 0 is network error, 408 timeout, 499 caller cancellation.
- HTTP 204/205 returns `undefined`.

## Backend requirements

- HTTPS in production; CORS allowlist; credentials true only for trusted origins.
- Refresh cookie: HttpOnly + Secure + SameSite, rotation and server-side revocation.
- Return JSON error shape with `message` and optional `requestId`.
- Support Idempotency-Key for task creation and command submission.
- Validate user authorization at every endpoint. Frontend route guards are not security.
