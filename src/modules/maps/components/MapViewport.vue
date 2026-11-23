<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch, ref } from 'vue'
import * as THREE from 'three'
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js'
import type { OccupancyGrid, RouteGraph } from '../types'

const props = defineProps<{ grid: OccupancyGrid | null; routes?: RouteGraph; pointCloudBuffer?: ArrayBuffer | null }>()
const emit = defineEmits<{ loadError: [message: string] }>()
const host = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.OrthographicCamera | null = null
let mapTexture: THREE.DataTexture | null = null
let mapMesh: THREE.Mesh | null = null
let routeGroup: THREE.Group | null = null
let pointCloud: THREE.Points | null = null
let resizeObserver: ResizeObserver | null = null
let mapBounds: { minX: number; maxX: number; minY: number; maxY: number } | null = null

function disposeObject(object: THREE.Object3D) {
  object.traverse(child => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Points) {
      child.geometry.dispose()
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach(material => material.dispose())
    }
  })
}

function removeObject(object: THREE.Object3D | null) {
  if (!object || !scene) return
  scene.remove(object)
  disposeObject(object)
}

function gridPoint(grid: OccupancyGrid, x: number, y: number) {
  const c = Math.cos(grid.origin.yaw), s = Math.sin(grid.origin.yaw)
  return { x: grid.origin.x + c * x - s * y, y: grid.origin.y + s * x + c * y }
}

function fitCamera() {
  if (!camera || !mapBounds || !host.value) return
  const { minX, maxX, minY, maxY } = mapBounds
  const width = Math.max(maxX - minX, 0.1)
  const height = Math.max(maxY - minY, 0.1)
  const aspect = Math.max(host.value.clientWidth, 1) / Math.max(host.value.clientHeight, 1)
  const padding = Math.max(width, height) * 0.08
  const halfHeight = Math.max(height / 2 + padding, (width / 2 + padding) / aspect)
  const halfWidth = halfHeight * aspect
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  camera.left = centerX - halfWidth
  camera.right = centerX + halfWidth
  camera.bottom = centerY - halfHeight
  camera.top = centerY + halfHeight
  camera.position.set(centerX, centerY, 30)
  camera.up.set(0, 1, 0)
  camera.lookAt(centerX, centerY, 0)
  camera.updateProjectionMatrix()
}

function renderScene() {
  if (renderer && scene && camera) renderer.render(scene, camera)
}

function drawMap() {
  removeObject(mapMesh)
  mapMesh = null
  mapTexture?.dispose()
  mapTexture = null
  mapBounds = null
  const grid = props.grid
  if (!scene || !grid) { renderScene(); return }
  if (grid.pixels.length !== grid.width * grid.height) {
    emit('loadError', '地图像素数量与宽高不一致')
    return
  }
  const maxTextureSize = renderer?.capabilities.maxTextureSize ?? 16384
  if (grid.width > maxTextureSize || grid.height > maxTextureSize) {
    emit('loadError', `地图尺寸超过当前显卡纹理上限 ${maxTextureSize}px`)
    return
  }
  const rgba = new Uint8Array(grid.width * grid.height * 4)
  for (let i = 0; i < grid.pixels.length; i++) {
    const value = grid.negate ? 255 - grid.pixels[i] : grid.pixels[i]
    const offset = i * 4
    rgba[offset] = value; rgba[offset + 1] = value; rgba[offset + 2] = value; rgba[offset + 3] = 255
  }
  mapTexture = new THREE.DataTexture(rgba, grid.width, grid.height, THREE.RGBAFormat)
  mapTexture.colorSpace = THREE.SRGBColorSpace
  mapTexture.flipY = true
  mapTexture.needsUpdate = true
  mapMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(grid.width * grid.resolution, grid.height * grid.resolution),
    new THREE.MeshBasicMaterial({ map: mapTexture, side: THREE.DoubleSide }),
  )
  const mapWidth = grid.width * grid.resolution
  const mapHeight = grid.height * grid.resolution
  const center = gridPoint(grid, mapWidth / 2, mapHeight / 2)
  mapMesh.position.set(center.x, center.y, 0)
  mapMesh.rotation.z = grid.origin.yaw
  scene.add(mapMesh)
  const corners = [gridPoint(grid, 0, 0), gridPoint(grid, mapWidth, 0), gridPoint(grid, 0, mapHeight), gridPoint(grid, mapWidth, mapHeight)]
  mapBounds = {
    minX: Math.min(...corners.map(p => p.x)), maxX: Math.max(...corners.map(p => p.x)),
    minY: Math.min(...corners.map(p => p.y)), maxY: Math.max(...corners.map(p => p.y)),
  }
  fitCamera()
  renderScene()
}

function drawRoutes() {
  removeObject(routeGroup)
  routeGroup = null
  if (!scene) return
  const group = new THREE.Group()
  const nodes = new Map((props.routes?.nodes || []).map(node => [node.id, node]))
  for (const edge of props.routes?.edges || []) {
    const from = nodes.get(edge.from), to = nodes.get(edge.to)
    if (!from || !to) continue
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(from.x, from.y, .025), new THREE.Vector3(to.x, to.y, .025)])
    group.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#33c7a5' })))
  }
  for (const node of nodes.values()) {
    const dot = new THREE.Mesh(new THREE.CircleGeometry(.07, 12), new THREE.MeshBasicMaterial({ color: '#58a6ff' }))
    dot.position.set(node.x, node.y, .04)
    group.add(dot)
  }
  routeGroup = group
  scene.add(group)
  renderScene()
}

function drawPointCloud(buffer: ArrayBuffer | null | undefined) {
  removeObject(pointCloud)
  pointCloud = null
  if (!scene || !buffer) { renderScene(); return }
  try {
    pointCloud = new PCDLoader().parse(buffer)
    pointCloud.position.z = .05
    const materials = Array.isArray(pointCloud.material) ? pointCloud.material : [pointCloud.material]
    for (const material of materials) if (material instanceof THREE.PointsMaterial) material.size = .035
    scene.add(pointCloud)
    if (!mapBounds) {
      const bounds = new THREE.Box3().setFromObject(pointCloud)
      if (Number.isFinite(bounds.min.x) && Number.isFinite(bounds.max.x)) {
        mapBounds = { minX: bounds.min.x, maxX: bounds.max.x, minY: bounds.min.y, maxY: bounds.max.y }
        fitCamera()
      }
    }
    renderScene()
  } catch (error) {
    emit('loadError', error instanceof Error ? `PCD 解析失败：${error.message}` : 'PCD 解析失败')
  }
}

watch(() => props.grid, drawMap)
watch(() => props.routes, drawRoutes, { deep: true })
watch(() => props.pointCloudBuffer, drawPointCloud)

onMounted(() => {
  if (!host.value) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#0a1220')
  camera = new THREE.OrthographicCamera(-10, 10, 8, -8, .1, 1000)
  camera.position.set(0, 0, 30)
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  } catch {
    emit('loadError', '当前浏览器或设备无法创建 WebGL 渲染上下文')
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(host.value.clientWidth, host.value.clientHeight)
  host.value.appendChild(renderer.domElement)
  resizeObserver = new ResizeObserver(() => {
    if (!host.value || !renderer) return
    renderer.setSize(host.value.clientWidth, host.value.clientHeight)
    fitCamera()
    renderScene()
  })
  resizeObserver.observe(host.value)
  drawMap(); drawRoutes(); drawPointCloud(props.pointCloudBuffer)
  renderScene()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  removeObject(mapMesh); removeObject(routeGroup); removeObject(pointCloud)
  mapTexture?.dispose()
  renderer?.dispose()
  renderer?.forceContextLoss()
  renderer?.domElement.remove()
  scene = null; camera = null; renderer = null
})
</script>

<template>
  <div ref="host" class="viewport">
    <div v-if="!grid && !pointCloudBuffer" class="empty">导入 PGM 地图或 PCD 点云后在此查看</div>
  </div>
</template>

<style scoped>
.viewport{width:100%;height:clamp(280px,58vh,720px);min-height:280px;position:relative;overflow:hidden;border-radius:8px;background:#0a1220}
.viewport canvas{display:block;width:100%;height:100%}
.empty{position:absolute;inset:0;display:grid;place-items:center;padding:16px;color:#c6d4e6;font-size:13px;text-align:center;line-height:1.5;pointer-events:none}
@media(max-width:760px){.viewport{height:clamp(260px,48vh,460px);min-height:260px}}
</style>
