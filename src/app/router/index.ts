import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store'
import type { Permission } from '@/shared/auth/permission'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/command-center',
    name: 'command-center',
    component: () => import('@/modules/visualization/views/CommandCenterView.vue'),
    meta: {
      title: '可视化大屏',
      permission: 'dashboard:read',
      fullscreen: true,
    },
  },
  {
    path: '/',
    component: () => import('@/shared/layout/AppLayout.vue'),
    children: [
      { path: '', redirect: '/dashboard' },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/modules/dashboard/views/DashboardView.vue'),
        meta: { title: '运行总览', permission: 'dashboard:read' },
      },
      {
        path: 'devices',
        name: 'devices',
        component: () => import('@/modules/devices/views/DeviceListView.vue'),
        meta: { title: '设备管理', permission: 'device:read' },
      },
      {
        path: 'maps',
        name: 'maps',
        component: () => import('@/modules/maps/views/MapWorkspaceView.vue'),
        meta: { title: '地图与路网', permission: 'map:read' },
      },
      {
        path: 'tasks',
        name: 'tasks',
        component: () => import('@/modules/tasks/views/TaskListView.vue'),
        meta: { title: '任务管理', permission: 'task:read' },
      },
      {
        path: 'logs',
        name: 'logs',
        component: () => import('@/modules/logs/views/LogListView.vue'),
        meta: { title: '日志管理', permission: 'log:read' },
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    if (to.name === 'login' && auth.isAuthenticated) return '/dashboard'
    return true
  }

  if (!auth.isAuthenticated) await auth.restoreSession()
  if (!auth.isAuthenticated) return { name: 'login', query: { redirect: to.fullPath } }

  const permission = to.meta.permission as Permission | undefined
  if (permission && !auth.hasPermission(permission)) return '/dashboard'

  return true
})
