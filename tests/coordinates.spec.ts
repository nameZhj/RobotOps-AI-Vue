import { describe, expect, it } from 'vitest'
import { pixelToWorld, worldToPixel } from '../src/modules/maps/coordinates'
import type { OccupancyGrid } from '../src/modules/maps/types'

const grid: OccupancyGrid = {
  width: 100, height: 80, resolution: 0.05,
  origin: { x: -2, y: 3, yaw: Math.PI / 3 },
  pixels: new Uint8Array(8000),
}

describe('map coordinate transforms', () => {
  it('round-trips pixel centers through a rotated world frame', () => {
    const world = pixelToWorld(grid, 24, 51)
    const pixel = worldToPixel(grid, world.x, world.y)
    expect(pixel.x).toBeCloseTo(24, 8)
    expect(pixel.y).toBeCloseTo(51, 8)
  })

  it('maps the top-left pixel center inside the map bounds', () => {
    const world = pixelToWorld(grid, 0, 0)
    const pixel = worldToPixel(grid, world.x, world.y)
    expect(pixel.x).toBeCloseTo(0, 8)
    expect(pixel.y).toBeCloseTo(0, 8)
  })
})
