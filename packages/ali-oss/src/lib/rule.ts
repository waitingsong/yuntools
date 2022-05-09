import { DataKey } from './types'


export const rules = {
  [DataKey.elapsed]: /(\d+\.\d+)\(s\)\s+elapsed(?=\s|\n|\r\n|$)/u,
}

export const PickData = {
  [DataKey.elapsed]: pickElapsed,
}

export function pickElapsed(input: string, debug = false): string | undefined {
  // '0.312022(s) elapsed\n'
  debug && console.log({ pickElapsedInput: input })
  const found = input.match(rules[DataKey.elapsed])
  if (found && found.length >= 1) {
    debug && console.log({ pickElapsedFound: found })
    return found[1]
  }
}

