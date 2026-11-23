import { describe, expect, it } from 'vitest'
import { parseMapYaml } from '../src/modules/maps/yaml-metadata'

const valid = `image: warehouse.pgm
resolution: 0.05
origin: [-1.2, 3.4, 1.570796]
negate: 0
occupied_thresh: 0.65
free_thresh: 0.196
`

describe('parseMapYaml', () => {
  it('parses ROS map_server metric metadata', () => {
    expect(parseMapYaml(valid)).toMatchObject({
      resolution: 0.05,
      origin: { x: -1.2, y: 3.4, yaw: 1.570796 },
      negate: false,
      frameId: 'map',
      imagePath: 'warehouse.pgm',
    })
  })

  it('supports explicit negate and frame metadata', () => {
    const result = parseMapYaml(`${valid}frame_id: map_floor_1\nnegate: 1\n`)
    expect(result.negate).toBe(true)
    expect(result.frameId).toBe('map_floor_1')
  })

  it('rejects missing or invalid coordinate metadata', () => {
    expect(() => parseMapYaml('resolution: 0.05\n')).toThrow()
    expect(() => parseMapYaml(valid.replace('resolution: 0.05', 'resolution: -1'))).toThrow()
    expect(() => parseMapYaml(valid.replace('origin: [-1.2, 3.4, 1.570796]', 'origin: [0, 0]'))).toThrow()
    expect(() => parseMapYaml(valid.replace('origin: [-1.2, 3.4, 1.570796]', 'origin: [0, , 1]'))).toThrow()
  })

  it('rejects invalid occupancy thresholds', () => {
    expect(() => parseMapYaml(valid.replace('free_thresh: 0.196', 'free_thresh: 0.9'))).toThrow()
  })
})
