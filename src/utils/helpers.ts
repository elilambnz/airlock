export const formatThousands = (credits: number): string => {
  return String(credits).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function capitaliseFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
