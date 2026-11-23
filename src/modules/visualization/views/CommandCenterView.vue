<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import './command-center.css'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

const viewport = ref<HTMLElement | null>(null)
const scale = ref(1)
const router = useRouter()
let resizeObserver: ResizeObserver | null = null

const stats = [
  { name: '在线设备', value: '21', unit: '/ 24' },
  { name: '今日任务', value: '57', unit: '条' },
  { name: '任务成功率', value: '96.4', unit: '%' },
  { name: '活动告警', value: '02', unit: '条' },
]

const fleet = [
  { id: 'AGV-014', kind: 'AGV', status: '运行中', area: '一号仓库' },
  { id: 'DOG-003', kind: '四足', status: '巡检中', area: '园区 B 区' },
  { id: 'G1-002', kind: '人形', status: '待机', area: '实验室' },
  { id: 'AGV-008', kind: 'AGV', status: '离线', area: '二号仓库' },
]

function updateScale() {
  if (!viewport.value) return

  const width = viewport.value.clientWidth
  const height = viewport.value.clientHeight
  if (width <= 0 || height <= 0) return

  scale.value = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT)
}


function exitCommandCenter() {
  void router.replace({ name: 'dashboard' })
}

onMounted(() => {
  document.documentElement.classList.add('visualization-mode')
  document.body.classList.add('visualization-mode')

  if (!viewport.value) return
  resizeObserver = new ResizeObserver(updateScale)
  resizeObserver.observe(viewport.value)
  updateScale()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  document.documentElement.classList.remove('visualization-mode')
  document.body.classList.remove('visualization-mode')
})
</script>

<template>
  <main ref="viewport" class="command-viewport" aria-label="机器人集群可视化大屏">
    <div
      class="command-stage"
      :style="{
        transform: `translate(-50%, -50%) scale(${scale})`,
      }"
    >
      <header class="screen-header">
        <div class="screen-brand">
          <b>ROBOTOPS</b>
          <span>智能机器人集群指挥中心</span>
        </div>
        <div class="screen-header-actions">
          <small>演示数据 · 非实时控制状态</small>
          <button type="button" class="exit-button" @click="exitCommandCenter">
            返回平台
          </button>
        </div>
      </header>

      <section class="screen-stats" aria-label="运行指标">
        <article v-for="item in stats" :key="item.name" class="stat-card">
          <small>{{ item.name }}</small>
          <strong>{{ item.value }}<i>{{ item.unit }}</i></strong>
        </article>
      </section>

      <div class="screen-body">
        <section class="screen-panel map-panel">
          <h2>园区数字孪生视图</h2>
          <div class="map-placeholder">
            <div class="grid-bg"></div>
            <span class="robot r1">AGV-014</span>
            <span class="robot r2">DOG-003</span>
            <span class="robot r3">G1-002</span>
            <span class="robot r4">AGV-008</span>
            <div class="route"></div>
          </div>
        </section>

        <section class="screen-panel fleet-panel">
          <h2>设备状态</h2>
          <div v-for="device in fleet" :key="device.id" class="fleet-row">
            <div class="fleet-info">
              <b>{{ device.id }}</b>
              <small>{{ device.kind }} · {{ device.area }}</small>
            </div>
            <span class="status-tag" :class="device.status === '离线' ? 'offline' : 'online'">
              {{ device.status }}
            </span>
          </div>
          <div class="panel-footnote">设备状态需接入后端遥测服务</div>
        </section>

        <section class="screen-panel task-panel">
          <h2>任务执行态势</h2>
          <div class="big-number">
            08
            <small>运行中任务</small>
          </div>
          <div class="progress-row">
            <span>执行中</span>
            <div class="progress-track"><i style="width: 42%"></i></div>
            <b>08</b>
          </div>
          <div class="progress-row">
            <span>排队中</span>
            <div class="progress-track queued"><i style="width: 16%"></i></div>
            <b>03</b>
          </div>
          <div class="progress-row">
            <span>已完成</span>
            <div class="progress-track completed"><i style="width: 75%"></i></div>
            <b>46</b>
          </div>
          <div class="panel-footnote">任务数据需接入后端调度服务</div>
        </section>
      </div>

      <footer class="screen-footer">
        RobotOps AI · 当前为前端演示数据 · 不代表真实设备运行状态
      </footer>
    </div>
  </main>
</template>
