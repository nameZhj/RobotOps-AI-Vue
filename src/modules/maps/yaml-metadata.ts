import type { MapOrigin } from './types'

export interface MapYamlMetadata {
  resolution: number
  origin: MapOrigin
  negate: boolean
  occupiedThreshold: number
  freeThreshold: number
  frameId: string
  imagePath: string | null
}

function scalar(source: string, key: string): string | undefined {
  const line = source.split(/\r?\n/).find(item => new RegExp(`^\\s*${key}\\s*:`).test(item))
  if (!line) return undefined
  return line.slice(line.indexOf(':') + 1).split('#', 1)[0].trim()
}

/** Parse the scalar subset of ROS map_server YAML; anchors and arbitrary YAML are intentionally unsupported. */
export function parseMapYaml(source: string): MapYamlMetadata {
  const resolutionValue = scalar(source, 'resolution')
  const originValue = scalar(source, 'origin')
  if (!resolutionValue || !originValue) throw new Error('YAML 必须包含 resolution 和 origin 字段')
  const resolution = Number(resolutionValue)
  const rawOriginParts = originValue.replace(/^\[/, '').replace(/\]$/, '').split(',').map(value => value.trim())
  if (rawOriginParts.some(value => !value)) throw new Error('YAML origin 包含空坐标值')
  const originParts = rawOriginParts.map(Number)
  if (!Number.isFinite(resolution) || resolution <= 0) throw new Error('YAML resolution 必须是大于 0 的数字')
  if (originParts.length !== 3 || originParts.some(value => !Number.isFinite(value))) {
    throw new Error('YAML origin 必须是 [x, y, yaw] 三个有限数字')
  }
  const negateValue = scalar(source, 'negate') ?? '0'
  const negate = negateValue === '1' || negateValue.toLowerCase() === 'true'
  if (!['0', '1', 'true', 'false'].includes(negateValue.toLowerCase())) throw new Error('YAML negate 只支持 0/1/true/false')
  const occupiedThreshold = Number(scalar(source, 'occupied_thresh') ?? '0.65')
  const freeThreshold = Number(scalar(source, 'free_thresh') ?? '0.196')
  if (![occupiedThreshold, freeThreshold].every(value => Number.isFinite(value) && value >= 0 && value <= 1)) {
    throw new Error('YAML occupied_thresh/free_thresh 必须在 0 到 1 之间')
  }
  if (freeThreshold >= occupiedThreshold) throw new Error('YAML free_thresh 必须小于 occupied_thresh')
  return {
    resolution,
    origin: { x: originParts[0], y: originParts[1], yaw: originParts[2] },
    negate,
    occupiedThreshold,
    freeThreshold,
    frameId: scalar(source, 'frame_id') || 'map',
    imagePath: scalar(source, 'image') || null,
  }
}
