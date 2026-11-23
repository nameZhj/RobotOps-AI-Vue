## Shared HTTP client

All module APIs call `request<T>()` or `http.get/post/put/patch/delete` from `http.ts`.

- Default 15-second timeout; supports caller AbortSignal.
- Adds memory-only access token and HttpOnly refresh cookie.
- Concurrent 401 responses share one refresh request.
- Only safe methods or writes with `Idempotency-Key` replay after refresh.
- No generic retries for 5xx or network failures.
- Errors use `ApiError`; 204/205 returns undefined.

See `docs/contracts/http-client.md`. Never use page-local fetch or log credentials/headers.
