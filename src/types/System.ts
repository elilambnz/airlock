import { Meta } from './Meta'

export type ListSystemsResponse = {
  data: System[]
  meta: Meta
}

export type SystemResponse = {
  data: System
}

export type System = {
  symbol: string
  sector: string
  type: SystemType
  x: number
  y: number
  waypoints: string[]
  factions: string[]
  charted: boolean
  chartedBy?: string
}

export enum SystemType {
  'RED_STAR',
  'BLUE_STAR',
}

export type ChartWaypointResponse = {}

export type ListWaypointsResponse = {}

export type WaypointResponse = {}
