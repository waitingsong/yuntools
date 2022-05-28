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

export async function processInput(
  input: BaseOptions & { target: string},
  globalConfig: Config | undefined,
): Promise<ParamMap> {

  const map = commonProcessInputMap(input, initOptions, globalConfig)
  assert(map.get(PlaceholderKey.dest), 'dest is required')
  map.delete(PlaceholderKey.src)

  return map
}
