export function getHeatIndex(celsius: number, humidity: number) {
  const F = toFahrenheit(celsius)
  return toCelsius(
    -42.379 +
      2.04901523 * F +
      10.14333127 * humidity -
      0.22475541 * F * humidity -
      6.83783 * 10 ** -3 * F ** 2 -
      5.481717 * 10 ** -2 * humidity ** 2 +
      1.22874 * 10 ** -3 * F ** 2 * humidity +
      8.5282 * 10 ** -4 * F * humidity ** 2 -
      1.99 * 10 ** -6 * F ** 2 * humidity ** 2
  )
}

function toCelsius(f: number) {
  return ((f - 32) * 5) / 9
}

function toFahrenheit(c: number) {
  return (c * 9) / 5 + 32
}

console.log(getHeatIndex(20, 30))
console.log(getHeatIndex(20, 60))
console.log(getHeatIndex(20, 90))
console.log(getHeatIndex(20, 100))
