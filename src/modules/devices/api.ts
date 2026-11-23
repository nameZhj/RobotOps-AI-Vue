import { request } from '@/shared/api/http'
import type { DeviceSummary } from './types'

const mockDevices: DeviceSummary[] = [
  { id: 'AGV-014', name: '仓储搬运车 014', kind: 'agv', model: 'AMR-X4', site: '一号仓库', connection: 'online', batteryPercent: 86, lastSeenAt: new Date().toISOString(), activeTaskId: 'T-2038' },
  { id: 'DOG-003', name: '巡检四足 003', kind: 'quadruped', model: 'Q-Dog Pro', site: '园区 B 区', connection: 'online', batteryPercent: 72, lastSeenAt: new Date().toISOString(), activeTaskId: 'T-2041' },
  { id: 'G1-002', name: '人形机器人 002', kind: 'humanoid', model: 'G1', site: '实验室', connection: 'degraded', batteryPercent: 34, lastSeenAt: new Date(Date.now() - 180000).toISOString(), activeTaskId: null },
  { id: 'AGV-008', name: '料箱搬运车 008', kind: 'agv', model: 'AMR-S2', site: '二号仓库', connection: 'offline', batteryPercent: 16, lastSeenAt: new Date(Date.now() - 900000).toISOString(), activeTaskId: null },
]

export const deviceApi = {
  list: () => import.meta.env.VITE_AUTH_MODE === 'mock'
    ? Promise.resolve(mockDevices)
    : request<DeviceSummary[]>('/devices'),
}
