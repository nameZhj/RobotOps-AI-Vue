import { describe, expect, it } from 'vitest'
import { createGrid, parsePgm } from '../src/modules/maps/pgm-parser'

const buffer = (text: string) => new TextEncoder().encode(text).buffer as ArrayBuffer

describe('parsePgm', () => {
  it('parses P2 and normalizes pixels to 8-bit grayscale', () => {
    const result = parsePgm(buffer('P2\n# demo\n2 2\n15\n0 5 10 15\n'))
    expect([result.width, result.height]).toEqual([2, 2])
    expect([...result.pixels]).toEqual([0, 85, 170, 255])
  })

  it('parses P5 binary raster', () => {
    const header = new TextEncoder().encode('P5\n2 1\n255\n')
    const raster = new Uint8Array([10, 240])
    const bytes = new Uint8Array(header.length + raster.length)
    bytes.set(header); bytes.set(raster, header.length)
    expect([...parsePgm(bytes.buffer).pixels]).toEqual([10, 240])
  })

  it('does not consume a whitespace-valued first binary pixel', () => {
    const header = new TextEncoder().encode('P5\n# max note 255 is in a comment\n1 1\n255\n')
    const bytes = new Uint8Array(header.length + 1)
    bytes.set(header); bytes[header.length] = 10
    expect([...parsePgm(bytes.buffer).pixels]).toEqual([10])
  })

  it('parses 16-bit P5 samples in network byte order', () => {
    const header = new TextEncoder().encode('P5\n2 1\n1023\n')
    const raster = new Uint8Array([0x00, 0x00, 0x03, 0xff])
    const bytes = new Uint8Array(header.length + raster.length)
    bytes.set(header); bytes.set(raster, header.length)
    expect([...parsePgm(bytes.buffer).pixels]).toEqual([0, 255])
  })

  it('rejects unsupported magic, invalid maximum and truncated binary data', () => {
    expect(() => parsePgm(buffer('P6\n1 1\n255\n'))).toThrow()
    expect(() => parsePgm(buffer('P2\n1 1\n0\n0\n'))).toThrow()
    expect(() => parsePgm(buffer('P5\n2 1\n255\n\x01'))).toThrow()
  })

  it('enforces the pixel budget before allocating a raster', () => {
    expect(() => parsePgm(buffer('P2\n5000 5000\n255\n'))).toThrow('尺寸无效或超过限制')
  })

  it('creates a grid only with a valid metric resolution', () => {
    const parsed = parsePgm(buffer('P2\n1 1\n255\n255'))
    expect(createGrid(parsed, 0.05, { x: 1, y: 2, yaw: 0.5 }, { negate: true }).negate).toBe(true)
    expect(() => createGrid(parsed, 0, { x: 0, y: 0, yaw: 0 })).toThrow()
  })
})
