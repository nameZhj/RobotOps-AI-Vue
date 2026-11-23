import { onBeforeUnmount, onMounted, watch, ref } from 'vue'
import * as THREE from 'three'
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js'
import type { MapEventMarker, MapRobotMarker, OccupancyGrid, RouteGraph } from '../types'

const props = withDefaults(defineProps<{
  grid: OccupancyGrid | null
  routes?: RouteGraph
  pointCloudBuffer?: ArrayBuffer | null
  robotMarkers?: MapRobotMarker[]
  eventMarkers?: MapEventMarker[]
  palette?: 'default' | 'command'
  fill?: boolean
}>(), {
  routes: () => ({ nodes: [], edges: [] }),
  robotMarkers: () => [],
  eventMarkers: () => [],
  palette: 'default',
  fill: false,
})
const emit = defineEmits<{ loadError: [message: string] }>()
const host = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.OrthographicCamera | null = null
let mapTexture: THREE.DataTexture | null = null
let mapMesh: THREE.Mesh | null = null
let routeGroup: THREE.Group | null = null
let markerGroup: THREE.Group | null = null
let pointCloud: THREE.Points | null = null
let resizeObserver: ResizeObserver | null = null
let mapBounds: { minX: number; maxX: number; minY: number; maxY: number } | null = null

function disposeObject(object: THREE.Object3D) {
  object.traverse(child => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Points) {
      child.geometry.dispose()
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach(material => material.dispose())
    } else if (child instanceof THREE.Sprite) {
      child.material.map?.dispose()
      child.material.dispose()
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

function colorizeMap(value: number) {
  if (props.palette !== 'command') return [value, value, value]
  if (value < 65) return [87, 116, 106]
  if (value > 190) return [31, 48, 52]
  return [14, 22, 27]
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
    const color = colorizeMap(value)
    const offset = i * 4
    rgba[offset] = color[0]; rgba[offset + 1] = color[1]; rgba[offset + 2] = color[2]; rgba[offset + 3] = 255
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
  const routeColor = props.palette === 'command' ? '#62E6D0' : '#33c7a5'
  for (const edge of props.routes?.edges || []) {
    const from = nodes.get(edge.from), to = nodes.get(edge.to)
    if (!from || !to) continue
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(from.x, from.y, .025), new THREE.Vector3(to.x, to.y, .025)])
    group.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: routeColor })))
  }
  for (const node of nodes.values()) {
    const dot = new THREE.Mesh(new THREE.CircleGeometry(.07, 12), new THREE.MeshBasicMaterial({ color: routeColor }))
    dot.position.set(node.x, node.y, .04)
    group.add(dot)
  }
  routeGroup = group
  scene.add(group)
  renderScene()
}

function labelSprite(text: string, foreground: string, background: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 88
  const context = canvas.getContext('2d')
  if (!context) return null
  context.fillStyle = background
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = 'rgba(98,230,208,.45)'
  context.lineWidth = 3
  context.strokeRect(1.5, 1.5, canvas.width - 3, canvas.height - 3)
  context.font = '600 34px system-ui, sans-serif'
  context.fillStyle = foreground
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width - 24)
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(2.15, .59, 1)
  return sprite
}

function drawMarkers() {
  removeObject(markerGroup)
  markerGroup = null
  if (!scene) return
  const group = new THREE.Group()
  for (const robot of props.robotMarkers || []) {
    const color = robot.state === 'offline' ? '#FF6B5A' : robot.state === 'degraded' ? '#E5B85C' : '#62E6D0'
    const halo = new THREE.Mesh(
      new THREE.CircleGeometry(.34, 28),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .2 }),
    )
    halo.position.set(robot.x, robot.y, .075)
    group.add(halo)
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(.22, .035, 8, 28),
      new THREE.MeshBasicMaterial({ color }),
    )
    ring.position.set(robot.x, robot.y, .095)
    group.add(ring)
    const core = new THREE.Mesh(
      new THREE.CircleGeometry(.105, 20),
      new THREE.MeshBasicMaterial({ color: '#EAF8F4' }),
    )
    core.position.set(robot.x, robot.y, .11)
    group.add(core)
    const heading = robot.heading ?? 0
    const end = new THREE.Vector3(robot.x + Math.cos(heading) * .43, robot.y + Math.sin(heading) * .43, .12)
    const line = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(robot.x, robot.y, .12), end])
    group.add(new THREE.Line(line, new THREE.LineBasicMaterial({ color })))
    const label = labelSprite(robot.label, '#E8F0F2', 'rgba(9,13,18,.92)')
    if (label) {
      label.position.set(robot.x + .7, robot.y + .52, .2)
      group.add(label)
    }
  }
  for (const marker of props.eventMarkers || []) {
    const color = marker.severity === 'critical' ? '#FF6B5A' : '#C7F36D'
    const diamond = new THREE.Mesh(
      new THREE.PlaneGeometry(.3, .3),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }),
    )
    diamond.position.set(marker.x, marker.y, .16)
    diamond.rotation.z = Math.PI / 4
    group.add(diamond)
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(.25, .025, 6, 24),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9 }),
    )
    ring.position.set(marker.x, marker.y, .15)
    group.add(ring)
    const label = labelSprite(marker.label, '#111820', 'rgba(199,243,109,.96)')
    if (label) {
      label.position.set(marker.x + .56, marker.y + .4, .22)
      label.scale.set(1.35, .38, 1)
      group.add(label)
    }
  }
  markerGroup = group
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
watch(() => [props.robotMarkers, props.eventMarkers], drawMarkers, { deep: true })
watch(() => props.palette, () => { drawMap(); drawRoutes(); drawMarkers() })

onMounted(() => {
  if (!host.value) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color(props.palette === 'command' ? '#0B1216' : '#0a1220')
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
  drawMap(); drawRoutes(); drawPointCloud(props.pointCloudBuffer); drawMarkers()
  renderScene()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  removeObject(mapMesh); removeObject(routeGroup); removeObject(markerGroup); removeObject(pointCloud)
  mapTexture?.dispose()
  renderer?.dispose()
  renderer?.forceContextLoss()
  renderer?.domElement.remove()
  scene = null; camera = null; renderer = null
})
</script>

<template>
  <div ref="host" class="viewport" :class="{ fill }">
    <div v-if="!grid && !pointCloudBuffer" class="empty">导入 PGM + YAML 或 PCD 地图文件后在此查看</div>
  </div>
</template>

<style scoped>
.viewport {
  position: relative;
  width: 100%;
  height: clamp(280px, 58vh, 720px);
  min-height: 280px;
  overflow: hidden;
  border-radius: 8px;
  background: #0a1220;
}
.viewport.fill { height: 100%; min-height: 0; border-radius: 0; }
.viewport canvas { display: block; width: 100%; height: 100%; }
.empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 16px;
  color: #c6d4e6;
  font-size: 13px;
  text-align: center;
  line-height: 1.5;
  pointer-events: none;
}
@media(max-width:760px) {
  .viewport { height: clamp(260px, 48vh, 460px); min-height: 260px; }
}
</style>
