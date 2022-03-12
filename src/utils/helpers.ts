import moment, { Moment } from 'moment'
import clamp from 'lodash/clamp'
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
} from 'unique-names-generator'

export const formatNumberCommas = (number: number): string => {
  return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const abbreviateNumber = (number: number): string => {
  if (number >= 1000000000000 || number <= -1000000000000) {
    return `${(number / 1000000000000).toFixed(1)}T`
  }
  if (number >= 1000000000 || number <= -1000000000) {
    return `${(number / 1000000000).toFixed(1)}B`
  }
  if (number >= 1000000 || number <= -1000000) {
    return `${(number / 1000000).toFixed(1)}M`
  }
  if (number >= 1000 || number <= -1000) {
    return `${(number / 1000).toFixed(1)}K`
  }
  return String(number)
}

export function capitaliseFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Get percentage between 2 moments relative to now
export const getProgress = (start: Moment, end: Moment) => {
  const p = Math.round(
    ((Number(moment().format('x')) - Number(start.format('x'))) /
      (Number(end.format('x')) - Number(start.format('x')))) *
      100
  )
  return clamp(p, 0, 100)
}

export const getCharCodeOfAllStringChars = (str: string) => {
  return parseInt([...str].map((c) => c.charCodeAt(0)).join(''))
}

export const getShortName = (seed?: number) => {
  if (seed && seed > Number.MAX_SAFE_INTEGER) {
    seed = Number.MAX_SAFE_INTEGER
    console.warn('Seed is too big, using max safe integer')
  }

  const customConfig = {
    dictionaries: [adjectives, colors],
    separator: '-',
    length: 2,
    seed,
  }
  return uniqueNamesGenerator(customConfig)
}

export const getShipName = (shipId: string) => {
  return getShortName(getCharCodeOfAllStringChars(shipId.substring(3, 8)))
}

export const getErrorMessage = (error: { code: number; message: string }) => {
  return getMessageForErrorCode(error.code) || error.message
}

// Handles error codes specific to the SpaceTraders API and returns a friendly error message
export const getMessageForErrorCode = (code: number) => {
  switch (code) {
    case 500:
      return 'Something unexpected went wrong!'
    case 42901:
      return 'Throttle limit reached. Please try again'
    case 2005:
      return 'No ships in marketplace location'
    default:
      return
  }
}
