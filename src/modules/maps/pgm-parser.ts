import type { OccupancyGrid, MapOrigin } from './types'

function readHeader(bytes: Uint8Array) {
  let offset = 0
  const nextToken = (): string => {
    while (offset < bytes.length) {
      const ch = bytes[offset]
      if (ch === 35) { while (offset < bytes.length && bytes[offset] !== 10) offset++; continue }
      if (ch === 9 || ch === 10 || ch === 11 || ch === 12 || ch === 13 || ch === 32) { offset++; continue }
      break
    }
    const start = offset
    while (offset < bytes.length) {
      const ch = bytes[offset]
      if (ch === 35 || ch === 9 || ch === 10 || ch === 11 || ch === 12 || ch === 13 || ch === 32) break
      offset++
    }
    if (start === offset) throw new Error('PGM 文件头不完整')
    return new TextDecoder('ascii').decode(bytes.subarray(start, offset))
  }
  const magic = nextToken()
  const width = Number(nextToken())
  const height = Number(nextToken())
  const maxValue = Number(nextToken())
  // Consume only the one delimiter (or CRLF pair) after maxValue. Binary data may itself start with whitespace.
  if (bytes[offset] === 13 && bytes[offset + 1] === 10) offset += 2
  else if ([9, 10, 11, 12, 13, 32].includes(bytes[offset])) offset++
  else throw new Error('PGM 最大灰度值后缺少分隔符')
  return { magic, width, height, maxValue, rasterOffset: offset }
}

function readAsciiSamples(bytes: Uint8Array): number[] {
  const text = new TextDecoder('ascii').decode(bytes)
  const tokens: string[] = []
  let i = 0
  while (i < text.length) {
    while (i < text.length && /\s/.test(text[i])) i++
    if (text[i] === '#') { while (i < text.length && text[i] !== '\n') i++; continue }
    if (i >= text.length) break
    const start = i
    while (i < text.length && !/\s/.test(text[i]) && text[i] !== '#') i++
    tokens.push(text.slice(start, i))
  }
  return tokens.map(Number)
}

/** Parse P2/P5 PGM to normalized 8-bit grayscale data. */
export function parsePgm(buffer: ArrayBuffer): Pick<OccupancyGrid, 'width' | 'height' | 'pixels'> {
  const bytes = new Uint8Array(buffer)
  const header = readHeader(bytes)
  const { magic, width, height, maxValue, rasterOffset } = header
  if (!['P2', 'P5'].includes(magic)) throw new Error('仅支持 P2/P5 PGM 文件')
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || width * height > 16_000_000) throw new Error('PGM 尺寸无效或超过限制')
  if (!Number.isInteger(maxValue) || maxValue < 1 || maxValue > 65535) throw new Error('PGM 最大灰度值无效')
  const pixels = new Uint8Array(width * height)
  if (magic === 'P2') {
    const values = readAsciiSamples(bytes.subarray(rasterOffset))
    if (values.length !== pixels.length || values.some(v => !Number.isInteger(v) || v < 0 || v > maxValue)) throw new Error('P2 像素数据长度或取值异常')
    values.forEach((value, i) => { pixels[i] = Math.round(value * 255 / maxValue) })
    return { width, height, pixels }
  }
  const bytesPerSample = maxValue > 255 ? 2 : 1
  const expectedBytes = width * height * bytesPerSample
  if (bytes.length - rasterOffset < expectedBytes) throw new Error('PGM 像素数据不完整')
  for (let i = 0; i < width * height; i++) {
    const value = bytesPerSample === 1 ? bytes[rasterOffset + i] : (bytes[rasterOffset + i * 2] << 8) | bytes[rasterOffset + i * 2 + 1]
    if (value > maxValue) throw new Error('PGM 像素值超出最大灰度范围')
    pixels[i] = Math.round(value * 255 / maxValue)
  }
  return { width, height, pixels }
}

export function createGrid(
  parsed: ReturnType<typeof parsePgm>,
  resolution: number,
  origin: MapOrigin,
  options: { negate?: boolean; frameId?: string } = {},
): OccupancyGrid {
  if (!Number.isFinite(resolution) || resolution <= 0) throw new Error('地图分辨率必须大于 0')
  if (![origin.x, origin.y, origin.yaw].every(Number.isFinite)) throw new Error('地图原点必须包含有效的 x、y、yaw')
  return { ...parsed, resolution, origin, negate: options.negate ?? false, frameId: options.frameId ?? 'map' }
}
