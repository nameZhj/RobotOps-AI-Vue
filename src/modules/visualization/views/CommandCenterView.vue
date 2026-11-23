<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deviceApi } from '@/modules/devices/api'
import type { DeviceSummary } from '@/modules/devices/types'
import { taskApi } from '@/modules/tasks/api'
import type { TaskSummary } from '@/modules/tasks/types'
import CommandCenterMap from '../components/CommandCenterMap.vue'
import CommandCenterOperationsPanel from '../components/CommandCenterOperationsPanel.vue'
import CommandCenterTaskPanel from '../components/CommandCenterTaskPanel.vue'
import CommandCenterVideoPanel from '../components/CommandCenterVideoPanel.vue'
import './command-center.css'
import './command-center-panels.css'
import './command-center-map.css'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080
const viewport = ref<HTMLElement | null>(null)
const scale = ref(1)
const router = useRouter()
const devices = ref<DeviceSummary[]>([])
const tasks = ref<TaskSummary[]>([])
const loading = ref(true)
const dataWarning = ref('')
const demoMode = import.meta.env.VITE_AUTH_MODE === 'mock'
let resizeObserver: ResizeObserver | null = null

function updateScale() {
  if (!viewport.value) return
  const width = viewport.value.clientWidth
  const height = viewport.value.clientHeight
  if (width > 0 && height > 0) scale.value = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT)
}

async function loadDashboardData() {
  const [deviceResult, taskResult] = await Promise.allSettled([deviceApi.list(), taskApi.list()])
  const unavailable: string[] = []
  if (deviceResult.status === 'fulfilled') devices.value = deviceResult.value
  else unavailable.push('设备数据')
  if (taskResult.status === 'fulfilled') tasks.value = taskResult.value
  else unavailable.push('任务数据')
  dataWarning.value = unavailable.length ? `${unavailable.join('、')}暂不可用` : ''
  loading.value = false
}

function exitCommandCenter() {
  void router.replace({ name: 'dashboard' })
}

onMounted(() => {
  document.documentElement.classList.add('visualization-mode')
  document.body.classList.add('visualization-mode')
  if (viewport.value) {
    resizeObserver = new ResizeObserver(updateScale)
    resizeObserver.observe(viewport.value)
  }
  window.addEventListener('resize', updateScale, { passive: true })
  window.visualViewport?.addEventListener('resize', updateScale, { passive: true })
  document.addEventListener('fullscreenchange', updateScale)
  updateScale()
  void loadDashboardData()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', updateScale)
  window.visualViewport?.removeEventListener('resize', updateScale)
  document.removeEventListener('fullscreenchange', updateScale)
  document.documentElement.classList.remove('visualization-mode')
  document.body.classList.remove('visualization-mode')
})
</script>

<template>
  <main ref="viewport" class="command-viewport" aria-label="机器人集群可视化大屏">
    <div class="command-stage" :style="{ transform: `translate(-50%, -50%) scale(${scale})` }">
      <header class="screen-header">
        <div class="screen-brand">
          <b>ROBOTOPS</b>
          <span>智能机器人集群指挥中心</span>
        </div>
        <div class="screen-header-actions">
          <span class="header-data-state" :class="{ warning: dataWarning }">
            <i></i>{{ dataWarning || (demoMode ? '演示数据' : '后端数据') }}
          </span>
          <small>FLEET COMMAND / OVERVIEW</small>
          <button type="button" class="exit-button" @click="exitCommandCenter">返回平台</button>
        </div>
      </header>

      <div class="screen-body">
        <CommandCenterOperationsPanel :devices="devices" :demo="demoMode" :loading="loading" />
        <CommandCenterMap />
        <div class="command-side command-side-right">
          <CommandCenterVideoPanel />
          <CommandCenterTaskPanel :tasks="tasks" :loading="loading" :demo="demoMode" />
        </div>
      </div>

      <footer class="screen-footer">
        <span>ROBOTOPS AI · ROBOT FLEET INTELLIGENCE</span>
        <span>地图 / 定位 / 事件 / 任务 · 状态以服务端数据为准</span>
      </footer>
    </div>
  </main>
</template>