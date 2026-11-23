<script setup lang="ts">
import { computed } from 'vue'
import type { DeviceSummary } from '@/modules/devices/types'

const props = defineProps<{ devices: DeviceSummary[]; demo: boolean; loading: boolean }>()
const onlineCount = computed(() => props.devices.filter(device => device.connection === 'online').length)
const patrolStats = [
  { label: '巡检点位', value: '14' },
  { label: '已完成', value: '11' },
  { label: '待复核', value: '02' },
]
const events = [
  { id: 'EV-0912', time: '09:42:18', level: 'critical', title: '设备电量低于阈值', device: 'AGV-008', point: 'P-08 · 二号仓库西侧', camera: 'CAM-08', x: '67%', y: '40%' },
  { id: 'EV-0911', time: '09:39:04', level: 'warning', title: '巡检通道存在占用', device: 'DOG-003', point: 'P-14 · 园区 B 区', camera: 'CAM-03', x: '42%', y: '63%' },
  { id: 'EV-0908', time: '09:27:51', level: 'warning', title: '设备温度异常待复核', device: 'DOG-003', point: 'P-11 · 设备间', camera: 'CAM-03', x: '28%', y: '32%' },
]

function connectionLabel(state: DeviceSummary['connection']) {
  return ({ online: '在线', degraded: '异常', offline: '离线', unknown: '未知' })[state]
}
function batteryTone(value: number | null) {
  if (value === null) return 'unknown'
  if (value <= 20) return 'critical'
  if (value <= 40) return 'warning'
  return 'normal'
}
</script>

<template>
  <div class="command-side command-side-left">
    <section class="screen-panel device-panel">
      <div class="panel-heading">
        <h2>设备状态</h2>
        <span class="panel-counter">{{ onlineCount }} / {{ devices.length }} 在线</span>
      </div>
      <div v-if="loading && devices.length === 0" class="panel-empty">正在读取设备状态…</div>
      <div v-else-if="devices.length === 0" class="panel-empty">暂无设备数据</div>
      <div v-else class="device-list">
        <div v-for="device in devices.slice(0, 4)" :key="device.id" class="device-row">
          <div class="device-main">
            <span class="device-dot" :class="device.connection"></span>
            <div class="device-name">
              <b>{{ device.id }}</b>
              <small>{{ device.name }} · {{ device.site }}</small>
            </div>
          </div>
          <div class="device-meta">
            <span class="device-state" :class="device.connection">{{ connectionLabel(device.connection) }}</span>
            <div class="battery">
              <span class="battery-track"><i :class="batteryTone(device.batteryPercent)" :style="{ width: `${device.batteryPercent ?? 0}%` }"></i></span>
              <small>{{ device.batteryPercent === null ? '--' : `${device.batteryPercent}%` }}</small>
            </div>
          </div>
        </div>
      </div>
      <span v-if="demo" class="data-caption">演示设备数据</span>
    </section>

    <section class="screen-panel patrol-panel">
      <div class="panel-heading">
        <h2>巡检统计</h2>
        <span class="data-caption">今日 · 演示</span>
      </div>
      <div class="patrol-stats">
        <div v-for="item in patrolStats" :key="item.label">
          <b>{{ item.value }}</b>
          <small>{{ item.label }}</small>
        </div>
      </div>
      <div class="patrol-progress"><i style="width: 78.6%"></i></div>
      <small class="patrol-note">完成率 78.6% · 3 个点位尚未完成</small>
    </section>

    <section class="screen-panel event-panel">
      <div class="panel-heading">
        <h2>巡检事件</h2>
        <span class="panel-counter">03 条待关注</span>
      </div>
      <div class="event-list">
        <article v-for="event in events" :key="event.id" class="event-row">
          <div class="event-thumbnail" :class="event.level">
            <span class="thumbnail-grid"></span>
            <span class="thumbnail-room room-one"></span>
            <span class="thumbnail-room room-two"></span>
            <span class="thumbnail-marker" :style="{ left: event.x, top: event.y }"></span>
            <small>{{ event.camera }}</small>
          </div>
          <div class="event-copy">
            <div class="event-topline">
              <span class="event-level" :class="event.level">{{ event.level === 'critical' ? '告警' : '待复核' }}</span>
              <time>{{ event.time }}</time>
            </div>
            <b>{{ event.title }}</b>
            <small>{{ event.device }} · {{ event.point }}</small>
          </div>
        </article>
      </div>
      <span class="data-caption event-caption">事件与点位缩略图为演示内容，待接入事件媒体 API</span>
    </section>
  </div>
</template>