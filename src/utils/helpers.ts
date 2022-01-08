export const formatCredits = (credits: number): string => {
  return String(credits).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
