import { request } from '@/shared/api/http'
import type { TaskSummary } from './types'
const demo: TaskSummary[] = [
  { id: 'T-2038', name: '一号仓库 A 区到 B 区搬运', deviceId: 'AGV-014', state: 'running', progress: 68, createdAt: '2026-11-23 09:10:00', updatedAt: '2026-11-23 09:42:18' },
  { id: 'T-2041', name: '园区 B 区设备巡检', deviceId: 'DOG-003', state: 'running', progress: 32, createdAt: '2026-11-23 09:20:00', updatedAt: '2026-11-23 09:39:04' },
  { id: 'T-2042', name: '二号仓库补料任务', deviceId: 'AGV-008', state: 'queued', progress: 0, createdAt: '2026-11-23 09:35:00', updatedAt: '2026-11-23 09:35:00' },
]
export const taskApi = { list: () => import.meta.env.VITE_AUTH_MODE === 'mock' ? Promise.resolve(demo) : request<TaskSummary[]>('/tasks') }
