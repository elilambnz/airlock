export const formatNumberCommas = (number: number): string => {
  return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const abbreviateNumber = (number: number): string => {
  if (number >= 1000000000000) {
    return `${(number / 1000000000000).toFixed(1)}T`
  }
  if (number >= 1000000000) {
    return `${(number / 1000000000).toFixed(1)}B`
  }
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`
  }
  return String(number)
}

export function capitaliseFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
