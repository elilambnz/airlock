import { Cooldown, Meta } from './Meta'

export type ListShipsResponse = {
  data: Ship[]
  meta: Meta
}

export type ShipResponse = {
  data: Ship
}

export type Ship = {
  symbol: string
  crew?: any
  officers?: any
  fuel: number
  frame: Frame
  reactor: Reactor
  engine: Engine
  modules: Module[]
  mounts: Mount[]
  registration: Registration
  integrity: Integrity
  status: ShipStatus
  location: string
  cargo: Cargo[]
}

export enum Frame {
  'FRAME_DRONE',
}

export enum Reactor {
  'REACTOR_SOLAR_I',
}

export enum Engine {
  'ENGINE_SOLAR_PROPULSION',
}

export enum Module {
  'MODULE_CARGO_HOLD',
}

export enum Mount {
  'MOUNT_MINING_LASER_I',
}

export type Registration = {
  factionSymbol: string
  agentSymbol: string
  fee: number
  role: RegistrationRole
}

export enum RegistrationRole {
  'EXCAVATOR',
}

export type Integrity = {
  frame: number
  reactor: number
  engine: number
}

export enum ShipStatus {
  'DOCKED',
}

export type Cargo = {
  tradeSymbol: string
  units: number
}

export type ScanResponse = {
  data: {
    cooldown: Cooldown
    ships: Ship[]
  }
}

export type ScanCooldownResponse = {
  data: {
    cooldown: Cooldown
  }
}

export type JettisonCargoResponse = {
  data: Cargo
}
