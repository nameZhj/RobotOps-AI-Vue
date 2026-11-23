export type TaskState = 'draft' | 'queued' | 'running' | 'paused' | 'succeeded' | 'failed' | 'canceled'
export interface TaskSummary {
  id: string; name: string; deviceId: string | null; state: TaskState
  progress: number; createdAt: string; updatedAt: string
}
