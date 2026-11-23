## Shared HTTP client

All module APIs call `request<T>()` from `http.ts`. It adds JSON headers, sends access tokens in Authorization, includes cookies for refresh-session endpoints, normalizes API/network errors, and handles empty 204 responses. Never log credentials or request headers.
