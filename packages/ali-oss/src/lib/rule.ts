import { DataKey } from './types'


export const rules = {
  [DataKey.elapsed]: /(\d+\.\d+)\(s\)\s+elapsed(?=\s|\n|\r\n|$)/u,
  /** average speed 1628000(byte/s)' */
  [DataKey.averageSpeed]: /average\s+speed\s+(\d+)/u,
}

export const pickData = {
  [DataKey.elapsed]: pickElapsed,
  [DataKey.averageSpeed]: pickAverageSpeed,
} as const

function pickElapsed(input: string, debug = false): string | undefined {
  // '0.312022(s) elapsed\n'
  debug && console.log({ pickElapsedInput: input })
  const found = input.match(rules[DataKey.elapsed])
  if (found && found.length >= 1) {
    debug && console.log({ pickElapsedFound: found })
    return found[1]
  }
}

function pickAverageSpeed(input: string, debug = false): number | undefined {
  // 'average speed 1628000(byte/s)'
  debug && console.log({ pickAvgerageSpeedInput: input })
  const found = input.match(rules[DataKey.averageSpeed])
  if (found && found.length >= 1) {
    debug && console.log({ pickAvgerageSpeedFound: found })
    const str = found[1]
    return str ? parseInt(str, 10) : void 0
  }
}

