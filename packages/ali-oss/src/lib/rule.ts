import { DataKey, PickFunc } from './types'


export const regxStat = new Map<DataKey, RegExp>([
  [DataKey.acl, new RegExp(`${DataKey.acl}\\s+:\\s+(\\w+)`, 'u')],
  [DataKey.acceptRanges, new RegExp(`${DataKey.acceptRanges}\\s+:\\s+(\\d+)`, 'u')],
  [DataKey.contentLength, new RegExp(`${DataKey.contentLength}\\s+:\\s+(\\d+)`, 'u')],
  [DataKey.contentMd5, new RegExp(`${DataKey.contentMd5}\\s+:\\s+(\\S+)`, 'u')],
  [DataKey.contentType, new RegExp(`${DataKey.contentType}\\s+:\\s+(\\S+)`, 'u')],
  [DataKey.etag, new RegExp(`${DataKey.etag}\\s+:\\s+(\\S+)`, 'u')],
  [DataKey.lastModified, new RegExp(`${DataKey.lastModified}\\s+:\\s+(\\d+.+)`, 'u')],
  [DataKey.owner, new RegExp(`${DataKey.owner}\\s+:\\s+(\\d+)`, 'u')],
  [DataKey.xOssHashCrc64ecma, new RegExp(`${DataKey.xOssHashCrc64ecma}\\s+:\\s+(\\S+)`, 'u')],
  [DataKey.xOssObjectType, new RegExp(`${DataKey.xOssObjectType}\\s+:\\s+(\\w+)`, 'u')],
  [DataKey.xOssStorageClass, new RegExp(`${DataKey.xOssStorageClass}\\s+:\\s+(\\w+)`, 'u')],
])

export const regxCommon = new Map<DataKey, RegExp>([
  [DataKey.elapsed, /(\d+\.\d+)\(s\)\s+elapsed(?=\s|\n|\r\n|$)/u],
  /** average speed 1628000(byte/s)' */
  [DataKey.averageSpeed, /average\s+speed\s+(\d+)/u],
])

export const pickRegxMap = new Map<DataKey, RegExp>([
  ...regxCommon,
  ...regxStat,
])


export const pickFuncMap = new Map<DataKey, PickFunc>([
  [DataKey.elapsed, pickString],
  [DataKey.averageSpeed, pickNumber],
  [DataKey.acl, pickString],
  [DataKey.acceptRanges, pickNumber],
  [DataKey.contentLength, pickNumber],
  [DataKey.contentMd5, pickString],
  [DataKey.contentType, pickString],
  [DataKey.etag, pickString],
  [DataKey.lastModified, pickString],
  [DataKey.owner, pickString],
  [DataKey.xOssHashCrc64ecma, pickString],
  [DataKey.xOssObjectType, pickString],
  [DataKey.xOssStorageClass, pickString],
])


function pickString(input: string, rule: RegExp, debug = false): string | undefined {
  return pick(input, rule, debug)
}
function pickNumber(input: string, rule: RegExp, debug = false): number | undefined {
  const found = pick(input, rule, debug)
  return found ? parseInt(found, 10) : void 0
}
function pick(input: string, rule: RegExp, debug = false): string | undefined {
  debug && console.log({ pickInput: input })
  const found = input.match(rule)
  if (found && found.length >= 1) {
    debug && console.log({ pickFound: found })
    return found[1]
  }
}
