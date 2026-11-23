<script setup lang="ts">
import { ref } from 'vue'
import { parsePgm, createGrid } from '../pgm-parser'
import { parseMapYaml, type MapYamlMetadata } from '../yaml-metadata'
import type { OccupancyGrid, RouteGraph } from '../types'
import MapViewport from '../components/MapViewport.vue'
const grid = ref<OccupancyGrid | null>(null)
const error = ref('')
const mapName = ref('尚未加载地图')
const routes = ref<RouteGraph>({ nodes: [], edges: [] })
const pointCloudBuffer = ref<ArrayBuffer | null>(null)
const pointCloudName = ref('')
const parsedPgm = ref<ReturnType<typeof parsePgm> | null>(null)
const yamlMetadata = ref<MapYamlMetadata | null>(null)
const metadataHint = ref('请同时导入配套 YAML，避免使用猜测的地图分辨率和原点。')
function applyMapPackage(): 'waiting' | 'mismatch' | 'applied' {
  if (!parsedPgm.value || !yamlMetadata.value) return 'waiting'
  const meta = yamlMetadata.value
  const expectedImage = meta.imagePath?.replace(/\\/g, '/').split('/').pop()
  if (expectedImage && mapName.value && expectedImage !== mapName.value) {
    grid.value = null
    metadataHint.value = `YAML 指向 ${expectedImage}，当前文件是 ${mapName.value}，请确认地图文件配对。`
    return 'mismatch'
  }
  grid.value = createGrid(parsedPgm.value, meta.resolution, meta.origin, { negate: meta.negate, frameId: meta.frameId })
  metadataHint.value = `坐标系 ${meta.frameId} · ${meta.resolution} m/px`
  return 'applied'
}
async function onPcd(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  try {
    if (file.size > 128 * 1024 * 1024) throw new Error('PCD 文件超过 128MB 限制，请先降采样；大文件 Worker/LOD 尚未接入')
    pointCloudBuffer.value = await file.arrayBuffer()
    pointCloudName.value = file.name
  } catch (e) { error.value = e instanceof Error ? e.message : 'PCD 加载失败' }
  finally { input.value = '' }
}
async function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  try {
    if (file.size > 64 * 1024 * 1024) throw new Error('PGM 文件超过 64MB 限制')
    grid.value = null
    parsedPgm.value = null
    yamlMetadata.value = null
    metadataHint.value = 'PGM 已选择，请重新导入与它对应的 YAML 文件。'
    mapName.value = file.name
    parsedPgm.value = parsePgm(await file.arrayBuffer())
    metadataHint.value = 'PGM 已解析，请继续导入对应 YAML 获取准确分辨率和原点。'
  } catch (e) { error.value = e instanceof Error ? e.message : '地图解析失败' }
  finally { input.value = '' }
}
async function onYaml(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  try {
    grid.value = null
    yamlMetadata.value = parseMapYaml(await file.text())
    const result = applyMapPackage()
    if (result === 'applied') metadataHint.value = `已加载 ${file.name} · ${yamlMetadata.value.resolution} m/px`
    else if (result === 'waiting') metadataHint.value = `已加载 ${file.name}，等待导入 PGM。`
  } catch (e) { error.value = e instanceof Error ? e.message : 'YAML 解析失败' }
  finally { input.value = '' }
}
</script>

<template>
  <div class="page">
    <div class="page-heading"><div><h1>地图与路网</h1><p>PGM 栅格地图预览、路网节点与边管理</p></div><div class="upload-actions"><label class="upload">导入 PGM<input type="file" accept=".pgm,image/x-portable-graymap" @change="onFile" /></label><label class="upload secondary">导入 YAML<input type="file" accept=".yaml,.yml" @change="onYaml" /></label><label class="upload secondary">导入 PCD<input type="file" accept=".pcd" @change="onPcd" /></label></div></div>
    <el-alert v-if="error" :title="error" type="error" :closable="false" />
    <section class="panel"><div class="map-head"><b>{{ mapName }}</b><span v-if="grid" class="muted">{{ grid.width }} × {{ grid.height }} px · {{ grid.resolution }} m/px</span></div><MapViewport :grid="grid" :routes="routes" :point-cloud-buffer="pointCloudBuffer" @load-error="error = $event" />
      <p class="muted cloud-name">{{ metadataHint }}</p><p v-if="pointCloudName" class="muted cloud-name">点云：{{ pointCloudName }}（当前在主线程解析；大地图生产环境应迁移到 Worker）</p></section>
    <section class="panel"><div class="section-title">路网编辑契约</div><p class="muted">路网使用独立节点（RouteNode）与边（RouteEdge）模型，边通过 from/to 引用节点 ID。实际地图编辑器需补充点选、拖拽、吸附、碰撞校验、撤销/重做和保存 API。</p><el-empty v-if="routes.nodes.length===0" description="当前地图尚无路网数据" :image-size="60" /></section>
  </div>
</template>

<style scoped>
.upload-actions{display:flex;gap:8px;flex-wrap:wrap}.upload{display:inline-flex;padding:9px 15px;border-radius:7px;background:#287bd7;color:#fff;font-size:12px;cursor:pointer}.upload.secondary{background:#263b59}.upload input{display:none}.cloud-name{font-size:11px;margin-bottom:0}.map-head{display:flex;justify-content:space-between;margin-bottom:14px;font-size:13px}.section-title{font-size:14px;font-weight:600}.panel p{font-size:12px;line-height:1.7}
</style>
