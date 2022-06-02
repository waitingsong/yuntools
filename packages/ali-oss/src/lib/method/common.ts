import assert from 'node:assert'

import { undefined } from '../config.js'
import { commonProcessInputMap } from '../helper.js'
import {
  BaseOptions,
  Config,
  ParamMap,
  PlaceholderKey,
} from '../types.js'


export const initBaseOptions: BaseOptions = {
  accessKeyId: undefined,
  accessKeySecret: undefined,
  bucket: '',
  connectTimeoutSec: undefined,
  encodeSource: false,
  encodeTarget: true,
  readTimeoutSec: undefined,
  stsToken: undefined,
  endpoint: undefined,
  loglevel: undefined,
}

export const initOptions: BaseOptions & { target: string } = {
  ...initBaseOptions,
  target: '',
}

/**
 * src will be delete
 */
export async function processInputWoSrc<T extends BaseOptions & { target: string}>(
  input: T,
  initOptionsInput: T,
  globalConfig: Config | undefined,
): Promise<ParamMap> {

  const map = commonProcessInputMap(input, initOptionsInput, globalConfig)
  assert(map.get(PlaceholderKey.dest), 'dest is required')
  map.delete(PlaceholderKey.src)

  return map
}
