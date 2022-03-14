import { Cooldown } from './Meta'

export type ExtractResourcesResponse = {
  data: {
    extraction: Extraction
    cooldown: Cooldown
  }
}

export type Extraction = {
  shipSymbol: string
  yield: {
    tradeSymbol: string
    units: number
  }
}

export type ExtractCooldownResponse = {
  data: {
    cooldown: Cooldown
  }
}

export type SurveyWaypointResponse = {
  data: {
    cooldown: Cooldown
    surveys: Survey[]
  }
}

export type Survey = {
  signature: string
  deposits: Deposit[]
  expiration: string
}

export enum Deposit {
  'SILICON',
  'ALUMINUM_ORE',
  'COPPER_ORE',
  'IRON_ORE',
  'QUARTZ',
}

export type SurveyCooldownResponse = {
  data: {
    cooldown: Cooldown
  }
}
