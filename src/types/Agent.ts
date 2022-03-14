import { Contract } from './Contract'
import { Ship } from './Ship'

export type RegisterAgentResponse = {
  data: {
    token: string
    agent: Agent
    faction: Faction
    contract: Contract
    ship: Ship
  }
}

export type AgentResponse = {
  data: Agent
}

export type Agent = {
  accountId: string
  symbol: string
  headquarters: string
  credits: number
}

export type Faction = {
  symbol: string
  name: string
  description: string
  headquarters: string
  traits: Trait[]
}

export enum Trait {
  'BUREAUCRATIC',
  'CAPITALISTIC',
  'GUILD',
  'ESTABLISHED',
}
