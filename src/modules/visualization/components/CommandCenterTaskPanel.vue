<script setup lang="ts">
import { computed } from 'vue'
import type { TaskSummary, TaskState } from '@/modules/tasks/types'

const props = defineProps<{ tasks: TaskSummary[]; loading: boolean; demo: boolean }>()
const activeTasks = computed(() => props.tasks.filter(task => ['running', 'paused', 'queued', 'draft'].includes(task.state)))
const completedTasks = computed(() => props.tasks.filter(task => task.state === 'succeeded'))
const attentionTasks = computed(() => props.tasks.filter(task => ['failed', 'canceled'].includes(task.state)))

function stateLabel(state: TaskState) {
  return ({
    draft: '草稿', queued: '等待调度', running: '执行中', paused: '已暂停',
    succeeded: '已完成', failed: '执行失败', canceled: '已取消',
  })[state]
}
function progressValue(progress: number) {
  return Math.min(100, Math.max(0, Math.round(progress)))
}
</script>

<template>
  <section class="screen-panel task-panel">
    <div class="panel-heading">
      <h2>任务执行</h2>
      <span class="panel-counter">{{ activeTasks.length }} 项进行中 / 等待</span>
    </div>
    <div v-if="loading && tasks.length === 0" class="panel-empty">正在读取任务队列…</div>
    <div v-else-if="tasks.length === 0" class="panel-empty">暂无任务数据</div>
    <template v-else>
      <div class="task-section-title">
        <span>进行中与待执行</span>
        <b>{{ activeTasks.length }}</b>
      </div>
      <article v-for="task in activeTasks.slice(0, 3)" :key="task.id" class="task-card">
        <div class="task-card-head">
          <b>{{ task.id }}</b>
          <span class="task-state" :class="task.state">{{ stateLabel(task.state) }}</span>
        </div>
        <p>{{ task.name }}</p>
        <div class="task-device">{{ task.deviceId || '未分配设备' }}</div>
        <div class="task-progress-meta">
          <span>已完成 {{ progressValue(task.progress) }}%</span>
          <span>剩余 {{ 100 - progressValue(task.progress) }}%</span>
        </div>
        <div class="task-progress"><i :class="task.state" :style="{ width: `${progressValue(task.progress)}%` }"></i></div>
      </article>

      <div class="task-section-title completed-title">
        <span>已完成任务</span>
        <b>{{ completedTasks.length }}</b>
      </div>
      <div v-if="completedTasks.length" class="completed-list">
        <div v-for="task in completedTasks.slice(0, 2)" :key="task.id" class="completed-row">
          <span class="completed-check">✓</span>
          <div><b>{{ task.id }} · {{ task.name }}</b><small>{{ task.deviceId || '未分配设备' }}</small></div>
          <strong>100%</strong>
        </div>
      </div>
      <div v-else class="task-empty-line">当前没有已完成任务</div>

      <div v-if="attentionTasks.length" class="attention-list">
        <span>异常任务</span>
        <b v-for="task in attentionTasks.slice(0, 2)" :key="task.id">{{ task.id }} · {{ stateLabel(task.state) }}</b>
      </div>
    </template>
    <span v-if="demo" class="data-caption">任务为演示数据；百分比来自任务摘要</span>
  </section>
</template>