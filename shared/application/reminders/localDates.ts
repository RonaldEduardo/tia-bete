const localDate = (now: string, timeZone: string) => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date(now)).filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

export const todayAndTomorrow = (now: string, timeZone: string) => {
  const today = localDate(now, timeZone)
  const [year, month, day] = today.split('-').map(Number)
  const tomorrow = new Date(Date.UTC(year!, month! - 1, day! + 1)).toISOString().slice(0, 10)
  return [today, tomorrow]
}
