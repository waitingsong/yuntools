import { DataKey } from './types'


export const pickRegxMap = new Map<DataKey, RegExp>([
  [DataKey.elapsed, /(\d+\.\d+)\(s\)\s+elapsed(?=\s|\n|\r\n|$)/u],
  /** average speed 1628000(byte/s)' */
  [DataKey.averageSpeed, /average\s+speed\s+(\d+)/u],
])


export type PickFunc = (input: string, rule: RegExp, debug: boolean) => string | number | undefined
export const pickFuncMap = new Map<DataKey, PickFunc>([
  [DataKey.elapsed, pickString],
  [DataKey.averageSpeed, pickNumber],
])


function pickString(input: string, rule: RegExp, debug = false): string | undefined {
  debug && console.log({ pickStringInput: input })
  const found = input.match(rule)
  if (found && found.length >= 1) {
    debug && console.log({ pickStringFound: found })
    return found[1]
  }
}

function pickNumber(input: string, rule: RegExp, debug = false): number | undefined {
  debug && console.log({ pickAvgerageSpeedInput: input })
  const found = input.match(rule)
  if (found && found.length >= 1) {
    debug && console.log({ pickNumberFound: found })
    const str = found[1]
    return str ? parseInt(str, 10) : void 0
  }
}

