# Authentication & Credential Handling

## Three independent credential domains

### 1. Platform user session

1. `POST /api/auth/login` with username/password over HTTPS.
2. Backend verifies password hash, applies rate limits, creates session and returns a short-lived access token.
3. Backend sets refresh token in an `HttpOnly; Secure; SameSite=Lax/Strict` cookie.
4. Frontend keeps access token only in `tokenStore` memory and sends `Authorization: Bearer <access-token>`.
5. On reload, frontend calls `POST /api/auth/refresh`; the browser attaches the HttpOnly cookie and server rotates refresh token.
6. The shared HTTP client uses one single-flight refresh for concurrent 401s. It replays safe methods automatically; writes require an `Idempotency-Key`.
7. Logout revokes refresh session server-side, clears cookie and clears frontend memory.

Cookie refresh endpoints require CSRF defenses (SameSite, Origin validation and/or CSRF token). Validate JWT issuer, audience, signature and expiry server-side.

### 2. Robot connection credentials

SSH passwords/private keys and MQTT broker secrets belong in a server-side encrypted secret store. Browser submits credentials only to dedicated, permission-checked registration/rotation endpoints; server returns a credential reference/status, never the secret. Prefer SSH keys/certificates over passwords and host-key pinning over automatic trust.

### 3. Device License

License is a device entitlement, not a logged-in user. Verify signature cryptographically on the server using a pinned public key, then check machine binding, product features, not-before/expiry and revocation. Parsing a `signature` field or comparing machine IDs alone is not signature verification.

## MQTT ticket session

The browser obtains a short-lived ticket from `POST /api/realtime/mqtt-ticket` using the platform session. The ticket has a WSS URL, ephemeral client ID/username/password and expiry. The broker enforces server-side ACL by user, tenant/site, device and Topic. Tickets are memory-only, renewed before expiry, and re-fetched for reconnects. Never put secrets in URL query parameters, environment files or browser storage.

## Frontend rules

- No long-lived token or password in localStorage, sessionStorage, IndexedDB, URL query, logs or crash reports.
- Never log Authorization/Cookie headers or request bodies containing credentials.
- Route guards and menu visibility are usability checks only. Every backend endpoint must authorize independently.
- `VITE_AUTH_MODE=mock` is isolated local UI demo mode and must be rejected by production build configuration.

## API contract

- `POST /auth/login` -> `{ accessToken, expiresIn, user }` + HttpOnly refresh cookie
- `POST /auth/refresh` -> `{ accessToken, expiresIn, user }` + rotated refresh cookie
- `POST /auth/logout` -> revoke current refresh session + clear cookie
- `POST /realtime/mqtt-ticket` -> short-lived scoped WSS ticket
