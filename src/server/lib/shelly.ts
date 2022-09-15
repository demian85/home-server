interface RgbState {
  mode: 'color' | 'white' /* "color" or "white" */
  white: number /* white brightness, 0..255, applies in mode="color" */
  effect: 0 | 1 | 2 /* applies an effect when set */
  turn: 'on' | 'off' | 'toggle' /* "on", "off" or "toggle" */
  transition: number /* One-shot transition, `0..5000` [ms] */
  red: number /* red brightness, 0..255, applies in mode="color" */
  green: number /* green brightness, 0..255, applies in mode="color" */
  blue: number /* blue brightness, 0..255, applies in mode="color" */
  gain: number /* gain for all channels, 0..100, applies in mode="color" */
}

interface BulbState {
  brightness: number /* brightness, 0..100 */
  white?: number /* white level, 0..100 */
  temp: number /* color temperature in K, 2700..6500 */
  turn: 'on' | 'off' | 'toggle' /* "on", "off" or "toggle" */
  transition: number /* One-shot transition, `0..5000` [ms] */
}

const baseRgbState: RgbState = {
  mode: 'color',
  white: 0,
  effect: 0,
  turn: 'on',
  transition: 500,
  red: 255,
  green: 255,
  blue: 255,
  gain: 100,
}

const rgbStates: RgbState[] = [
  {
    ...baseRgbState,
    red: 255,
    green: 0,
    blue: 0,
    gain: 20,
  },
  {
    ...baseRgbState,
    red: 0,
    green: 255,
    blue: 0,
    gain: 50,
  },
  {
    ...baseRgbState,
    red: 0,
    green: 0,
    blue: 255,
    gain: 60,
  },
]

const bulbStates: BulbState[] = [
  {
    brightness: 30,
    temp: 2700,
    turn: 'on',
    transition: 500,
  },
  {
    brightness: 60,
    temp: 2700,
    turn: 'on',
    transition: 500,
  },
  {
    brightness: 80,
    temp: 5000,
    turn: 'on',
    transition: 500,
  },
]

export const getRgbState = (index: number) => rgbStates[index] ?? rgbStates[0]
export const getBulbState = (index: number) =>
  bulbStates[index] ?? bulbStates[0]
export const getBulbPayload = (params: Partial<BulbState>) =>
  JSON.stringify(params)
export const getRgbPayload = (params: Partial<RgbState>) =>
  JSON.stringify(params)
