# Manual Smoke Checklist

> This project intentionally keeps no unit-test files or test runner. Use this short checklist for a human release pass instead of adding fixtures and test scaffolding.

## 1. Responsive layout

- [ ] Check 1920×1080, 1366×768, 1024×768, 768×1024, 390×844 and 320×640.
- [ ] Check 200% browser zoom and device-pixel-ratio 1 / 2.
- [ ] No document-level horizontal overflow; navigation and wide tables scroll inside their own containers.
- [ ] Long device IDs, task names, paths and timestamps wrap or ellipsize without stretching cards.
- [ ] Portrait/landscape changes and browser resizing do not leave stale canvas dimensions.

## 2. Visual contrast and controls

- [ ] Normal text contrast is at least 4.5:1; large text at least 3:1.
- [ ] Primary/secondary buttons: default, hover, active, focus, loading and disabled states.
- [ ] Selected nav, table row, select option, checkbox, radio and tab remain readable.
- [ ] Buttons keep centered text, adequate padding and stable hit area.
- [ ] Reduced-motion preference does not break status feedback.

## 3. Authentication and HTTP

- [ ] Mock login works only in local development; production build refuses Mock mode.
- [ ] API login stores access token in memory only; refresh token is HttpOnly Cookie.
- [ ] Simultaneous 401 responses trigger one refresh request.
- [ ] GET retries after refresh; unsafe writes retry only with Idempotency-Key.
- [ ] Timeout, abort, network failure, JSON error and 204 response display a useful state.
- [ ] Browser storage and logs contain no passwords, tokens, SSH secrets or MQTT credentials.

## 4. Maps and visualization

- [ ] PGM without YAML is not rendered; paired YAML provides correct resolution and origin.
- [ ] Selecting a new PGM clears old YAML; YAML image filename mismatch blocks the map.
- [ ] PGM P2/P5, 8-bit/16-bit files and invalid dimensions produce expected behavior.
- [ ] PCD size guard and WebGL unsupported state show actionable errors.
- [ ] Three.js scene, texture, geometry, material and ResizeObserver are released on route leave.

## 5. MQTT gateway

- [ ] Ticket endpoint requires an authenticated session and returns a short-lived WSS ticket.
- [ ] Broker ACL limits the user to approved tenant/site/device Topics.
- [ ] No static Broker credentials appear in frontend env, storage, logs or URL.
- [ ] Valid connection subscribes and dispatches normalized payloads.
- [ ] Network loss reconnects with bounded backoff and a fresh ticket; active subscriptions recover.
- [ ] Invalid/expired ticket or ACL denial stops retry until an explicit new connect.
- [ ] Unsubscribe disposer removes the subscription; disconnect cancels reconnect timers.
- [ ] QoS 1 consumers tolerate duplicate messages; control commands use backend APIs and idempotency keys.

## 6. Build gate

```bash
npm run typecheck
npm run build
```

Record browser, screen size, result and any failure in the release notes. Do not add a test directory unless the project owner changes this convention.
