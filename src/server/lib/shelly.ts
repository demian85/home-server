const baseRgbState = {
  mode: 'color' /* "color" or "white" */,
  white: 0 /* white brightness, 0..255, applies in mode="color" */,
  effect: 0 /* applies an effect when set */,
  turn: 'on' /* "on", "off" or "toggle" */,
  transition: 500 /* One-shot transition, `0..5000` [ms] */,
  red: 255 /* red brightness, 0..255, applies in mode="color" */,
  green: 255 /* green brightness, 0..255, applies in mode="color" */,
  blue: 255 /* blue brightness, 0..255, applies in mode="color" */,
  gain: 100 /* gain for all channels, 0..100, applies in mode="color" */,
}

const rgbStates = [
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

export const getRgbState = (index: number) => rgbStates[index]
