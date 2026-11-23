export type Permission =
  | 'dashboard:read' | 'device:read' | 'device:write'
  | 'map:read' | 'map:write' | 'task:read' | 'task:write'
  | 'log:read' | 'user:admin'

export type Role = 'admin' | 'operator' | 'viewer'

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['dashboard:read', 'device:read', 'device:write', 'map:read', 'map:write', 'task:read', 'task:write', 'log:read', 'user:admin'],
  operator: ['dashboard:read', 'device:read', 'device:write', 'map:read', 'map:write', 'task:read', 'task:write', 'log:read'],
  viewer: ['dashboard:read', 'device:read', 'map:read', 'task:read', 'log:read'],
}

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role]
}

export function can(permissions: Permission[], required: Permission): boolean {
  return permissions.includes(required)
}
