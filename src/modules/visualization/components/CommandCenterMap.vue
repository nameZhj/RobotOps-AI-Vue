<script setup lang="ts">
import { ref } from 'vue'
import MapViewport from '@/modules/maps/components/MapViewport.vue'
import { createGrid, parsePgm } from '@/modules/maps/pgm-parser'
import type { MapEventMarker, MapRobotMarker, OccupancyGrid, RouteGraph } from '@/modules/maps/types'
import { parseMapYaml, type MapYamlMetadata } from '@/modules/maps/yaml-metadata'

function createDemoGrid(): OccupancyGrid {
  const width = 240
  const height = 160
  const pixels = new Uint8Array(width * height).fill(232)
  const wall = (x1: number, y1: number, x2: number, y2: number) => {
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) pixels[y * width + x] = 18
      }
    }
  }
  wall(0, 0, width - 1, 4); wall(0, height - 5, width - 1, height - 1)
  wall(0, 0, 4, height - 1); wall(width - 5, 0, width - 1, height - 1)
  wall(78, 5, 81, 57); wall(78, 72, 81, 155)
  wall(5, 78, 57, 81); wall(72, 78, 155, 81); wall(170, 78, 235, 81)
  wall(26, 22, 61, 25); wall(26, 25, 29, 48); wall(26, 56, 61, 59)
  wall(100, 20, 104, 54); wall(125, 20, 129, 54)
  wall(100, 20, 129, 23); wall(100, 51, 129, 54)
  wall(178, 100, 232, 104); wall(178, 104, 182, 139); wall(205, 104, 209, 139); wall(178, 139, 232, 143)
  wall(20, 112, 55, 116); wall(20, 116, 24, 142); wall(51, 116, 55, 142)
  return createGrid({ width, height, pixels }, 0.1, { x: 0, y: 0, yaw: 0 }, { frameId: 'map-demo' })
}

const demoRoutes: RouteGraph = {
  nodes: [
    { id: 'R1', x: 2.2, y: 2.1 }, { id: 'R2', x: 7.4, y: 2.1 },
    { id: 'R3', x: 7.4, y: 7.3 }, { id: 'R4', x: 16.2, y: 7.3 },
    { id: 'R5', x: 16.2, y: 12.5 }, { id: 'R6', x: 22, y: 12.5 },
  ],
  edges: [
    { id: 'E1', from: 'R1', to: 'R2', bidirectional: true },
    { id: 'E2', from: 'R2', to: 'R3', bidirectional: true },
    { id: 'E3', from: 'R3', to: 'R4', bidirectional: true },
    { id: 'E4', from: 'R4', to: 'R5', bidirectional: true },
    { id: 'E5', from: 'R5', to: 'R6', bidirectional: true },
  ],
}
const demoRobots: MapRobotMarker[] = [
  { id: 'AGV-014', label: 'AGV-014', x: 3.2, y: 2.3, heading: 0.2, state: 'online' },
  { id: 'DOG-003', label: 'DOG-003', x: 13.3, y: 11.1, heading: 1.1, state: 'online' },
  { id: 'G1-002', label: 'G1-002', x: 21.4, y: 5.3, heading: 2.2, state: 'degraded' },
]
const demoEvents: MapEventMarker[] = [
  { id: 'EV-0912', label: 'P-08', x: 18.7, y: 12.1, severity: 'critical' },
  { id: 'EV-0911', label: 'P-14', x: 5.8, y: 13.1, severity: 'warning' },
]

const grid = ref<OccupancyGrid | null>(createDemoGrid())
const routes = ref<RouteGraph>(demoRoutes)
const robotMarkers = ref<MapRobotMarker[]>(demoRobots)
const eventMarkers = ref<MapEventMarker[]>(demoEvents)
const pointCloudBuffer = ref<ArrayBuffer | null>(null)
const isDemo = ref(true)
const mapName = ref('园区 A 区 · 演示 PGM 地图')
const mapHint = ref('演示定位与路线 · 导入真实地图后，等待机器人定位数据')
const error = ref('')
const parsedPgm = ref<ReturnType<typeof parsePgm> | null>(null)
const yamlMetadata = ref<MapYamlMetadata | null>(null)
const pgmInput = ref<HTMLInputElement | null>(null)
const yamlInput = ref<HTMLInputElement | null>(null)
const pcdInput = ref<HTMLInputElement | null>(null)

function clearDemoOverlays() {
  isDemo.value = false
  routes.value = { nodes: [], edges: [] }
  robotMarkers.value = []
  eventMarkers.value = []
}
function applyMapPackage() {
  if (!parsedPgm.value || !yamlMetadata.value) {
    grid.value = null
    mapHint.value = parsedPgm.value
      ? 'PGM 已解析，请导入对应 YAML 获取准确分辨率和地图原点'
      : '请先导入 PGM 地图，再导入配套 YAML 文件'
    return
  }
  const expectedImage = yamlMetadata.value.imagePath?.replace(/\\/g, '/').split('/').pop()
  if (expectedImage && expectedImage !== mapName.value) {
    grid.value = null
    mapHint.value = `YAML 指向 ${expectedImage}，当前文件为 ${mapName.value}，请确认文件配对`
    return
  }
  grid.value = createGrid(parsedPgm.value, yamlMetadata.value.resolution, yamlMetadata.value.origin, {
    negate: yamlMetadata.value.negate,
    frameId: yamlMetadata.value.frameId,
  })
  mapHint.value = `已加载真实 PGM · ${yamlMetadata.value.frameId} · ${yamlMetadata.value.resolution} m/px · 定位与任务路线待接入`
}
async function onPgm(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  clearDemoOverlays()
  pointCloudBuffer.value = null
  yamlMetadata.value = null
  parsedPgm.value = null
  grid.value = null
  mapName.value = file.name
  try {
    if (file.size > 64 * 1024 * 1024) throw new Error('PGM 文件超过 64MB 限制')
    parsedPgm.value = parsePgm(await file.arrayBuffer())
    mapHint.value = 'PGM 已解析，请继续导入与它对应的 YAML'
    applyMapPackage()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'PGM 地图加载失败'
  } finally {
    input.value = ''
  }
}
async function onYaml(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  clearDemoOverlays()
  try {
    yamlMetadata.value = parseMapYaml(await file.text())
    applyMapPackage()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'YAML 元数据解析失败'
  } finally {
    input.value = ''
  }
}
async function onPcd(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  try {
    if (file.size > 128 * 1024 * 1024) throw new Error('PCD 文件超过 128MB 限制，请先降采样')
    if (isDemo.value) {
      grid.value = null
      clearDemoOverlays()
    }
    pointCloudBuffer.value = await file.arrayBuffer()
    mapName.value = file.name
    mapHint.value = 'PCD 点云已加载 · 机器人定位和任务路线待接入对应坐标系数据'
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'PCD 点云加载失败'
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <section class="screen-panel command-map-panel">
    <div class="map-panel-head">
      <div class="map-heading-copy">
        <div class="panel-heading">
          <h2>园区数字孪生地图</h2>
          <span class="map-source-tag" :class="{ demo: isDemo }">{{ isDemo ? '演示场景' : '自定义地图' }}</span>
        </div>
        <small>{{ mapName }} · {{ mapHint }}</small>
      </div>
      <div class="map-import-actions">
        <label class="map-import-button">PGM<input ref="pgmInput" type="file" accept=".pgm" @change="onPgm"></label>
        <label class="map-import-button">YAML<input ref="yamlInput" type="file" accept=".yaml,.yml" @change="onYaml"></label>
        <label class="map-import-button">PCD<input ref="pcdInput" type="file" accept=".pcd" @change="onPcd"></label>
      </div>
    </div>
    <div class="map-render-area">
      <MapViewport
        :grid="grid"
        :routes="routes"
        :point-cloud-buffer="pointCloudBuffer"
        :robot-markers="robotMarkers"
        :event-markers="eventMarkers"
        palette="command"
        fill
        @load-error="error = $event"
      />
      <div class="map-orientation">+Y ↑ <span>MAP FRAME</span></div>
      <div class="map-legend">
        <span><i class="legend-robot"></i>机器人位置</span>
        <span><i class="legend-route"></i>任务路线</span>
        <span><i class="legend-event"></i>事件点位</span>
      </div>
      <div v-if="!isDemo" class="map-live-note">真实定位数据尚未接入</div>
      <div v-if="error" class="map-error">{{ error }}</div>
    </div>
    <div class="map-panel-foot">
      <span><i class="connection-dot"></i>{{ isDemo ? '定位演示数据' : '地图已加载 / 定位未连接' }}</span>
      <span>单位：m · 坐标系：{{ grid?.frameId || '待确认' }}</span>
    </div>
  </section>
</template>