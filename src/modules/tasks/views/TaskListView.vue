<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { taskApi } from '../api'
import type { TaskSummary, TaskState } from '../types'

const rows = ref<TaskSummary[]>([])
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await taskApi.list()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '任务加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const stateLabels: Record<TaskState, string> = {
  draft: '草稿',
  queued: '排队中',
  running: '执行中',
  paused: '已暂停',
  succeeded: '成功',
  failed: '失败',
  canceled: '已取消',
}

function stateLabel(value: unknown): string {
  if (typeof value !== 'string' || !(value in stateLabels)) return '未知状态'
  return stateLabels[value as TaskState]
}

function stateTagType(state: TaskState) {
  if (state === 'running' || state === 'paused') return 'warning'
  if (state === 'succeeded') return 'success'
  if (state === 'failed') return 'danger'
  return 'info'
}
</script>

<template>
  <div class="page">
    <div class="page-heading">
      <div>
        <h1>任务管理</h1>
        <p>查看任务队列、执行进度与运行结果</p>
      </div>
      <el-button type="primary" disabled>新建任务（待接 API）</el-button>
    </div>

    <el-alert v-if="error" :title="error" type="error" :closable="false" />

    <section class="panel">
      <div class="table-scroll">
        <el-table v-loading="loading" :data="rows" style="width: 100%">
          <el-table-column prop="id" label="任务 ID" width="110" />
          <el-table-column prop="name" label="任务名称" min-width="220" />
          <el-table-column prop="deviceId" label="目标设备" width="120" />
          <el-table-column label="状态" width="110">
            <template #default="scope">
              <el-tag :type="stateTagType(scope.row.state)">
                {{ stateLabel(scope.row.state) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="进度" width="180">
            <template #default="scope">
              <el-progress
                :percentage="scope.row.progress"
                :status="scope.row.state === 'failed' ? 'exception' : undefined"
              />
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="170" />
        </el-table>
      </div>
    </section>
  </div>
</template>
