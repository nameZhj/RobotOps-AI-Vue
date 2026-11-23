export interface MapOrigin { x: number; y: number; yaw: number }
export interface OccupancyGrid {
  width: number; height: number; resolution: number; origin: MapOrigin
  /** 0..255 grayscale samples, row-major, top-left origin. */
  pixels: Uint8Array
  /** ROS map_server image polarity; false means black=occupied and white=free. */
  negate?: boolean
  frameId?: string
}
export interface RouteNode { id: string; x: number; y: number; yaw?: number; name?: string }
export interface RouteEdge { id: string; from: string; to: string; bidirectional: boolean; speedLimit?: number }
export interface RouteGraph { nodes: RouteNode[]; edges: RouteEdge[] }
export interface MapDocument { id: string; name: string; grid: OccupancyGrid; routes: RouteGraph }
