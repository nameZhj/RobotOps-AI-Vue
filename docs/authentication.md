# Authentication & Credential Handling

## Three independent credential domains

### 1. Platform user session

1. `POST /api/auth/login` with username/password over HTTPS.
2. Backend verifies the password hash, rate limits attempts, creates a session and returns a short-lived access token.
3. Backend sets refresh token in an `HttpOnly; Secure; SameSite=Lax/Strict` cookie. JavaScript cannot read this cookie.
4. Frontend keeps access token only in `tokenStore` memory and sends `Authorization: Bearer <access-token>`.
5. On reload, frontend calls `POST /api/auth/refresh`; browser attaches the HttpOnly cookie and server rotates refresh token.
6. Logout revokes the refresh session server-side and clears cookie; frontend clears memory state.

For cookie-based refresh endpoints, apply CSRF defenses (SameSite, Origin validation and/or CSRF token). Validate JWT issuer, audience, signature and expiry server-side.

### 2. Robot connection credentials

SSH passwords/private keys and MQTT broker secrets belong in a server-side encrypted secret store. Browser submits credentials only to a dedicated, permission-checked registration/rotation endpoint; server returns credential reference/status, never the secret. Prefer SSH keys/certificates over passwords and host-key pinning over automatic trust.

### 3. Device License

License is a device entitlement, not a logged-in user. Verify signature cryptographically on the server using a pinned public key, then check machine binding, product features, not-before/expiry and revocation. Parsing a `signature` field or comparing machine IDs alone is not signature verification.

## Frontend rules

- No long-lived token or password in localStorage, sessionStorage, IndexedDB, URL query, logs or crash reports.
- Never log Authorization/Cookie headers or request bodies containing credentials.
- Route guards and menu visibility are usability checks only. Every backend endpoint must authorize independently.
- `VITE_AUTH_MODE=mock` is an isolated local UI demo mode and must be rejected by production build configuration.

## API contract

- `POST /auth/login` -> `{ accessToken, expiresIn, user }` + HttpOnly refresh cookie
- `POST /auth/refresh` -> `{ accessToken, expiresIn, user }` + rotated refresh cookie
- `POST /auth/logout` -> revokes current refresh session + clears cookie
