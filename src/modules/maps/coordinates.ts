import type { OccupancyGrid } from './types'

/** Pixel (column,row) addresses the pixel center; image row 0 is at the top. */
export function pixelToWorld(grid: OccupancyGrid, px: number, py: number) {
  const localX = (px + 0.5) * grid.resolution
  const localY = (grid.height - py - 0.5) * grid.resolution
  const c = Math.cos(grid.origin.yaw), s = Math.sin(grid.origin.yaw)
  return { x: grid.origin.x + c * localX - s * localY, y: grid.origin.y + s * localX + c * localY }
}

/** Returns continuous pixel-center coordinates; round only when indexing an image array. */
export function worldToPixel(grid: OccupancyGrid, x: number, y: number) {
  const dx = x - grid.origin.x, dy = y - grid.origin.y
  const c = Math.cos(grid.origin.yaw), s = Math.sin(grid.origin.yaw)
  const localX = c * dx + s * dy
  const localY = -s * dx + c * dy
  return { x: localX / grid.resolution - 0.5, y: grid.height - localY / grid.resolution - 0.5 }
}
