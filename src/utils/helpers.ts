import moment, { Moment } from 'moment'
import clamp from "lodash/clamp";

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
    (Number((moment().format("x"))) - Number(start.format("x"))) /
      (Number(end.format("x")) - Number(start.format("x"))) *
      100
  )
  return clamp(p, 0, 100);
};