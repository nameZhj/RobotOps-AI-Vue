# Task State Contract

Allowed states: `draft -> queued -> running -> paused -> running -> succeeded | failed | canceled`.

- `draft`: editable and not submitted.
- `queued`: accepted by scheduler, waiting for resources.
- `running`: execution acknowledged by device/gateway.
- `paused`: scheduler/device confirms pause; UI button click alone is not confirmation.
- `succeeded`, `failed`, `canceled`: terminal states.

Every command carries `taskId`, `deviceId`, `commandId` (idempotency key), `requestedBy`, `requestedAt` and optional reason. Server validates state transition, user permission, device readiness and control authority. Terminal state must not transition back without creating a new task or explicit recovery workflow.
