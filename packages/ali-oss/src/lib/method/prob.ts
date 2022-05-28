import assert from 'node:assert'

import { commonProcessInputMap } from '../helper.js'
import {
  BaseOptions,
  Config,
  ParamMap,
  PlaceholderKey,
} from '../types.js'

import { initBaseOptions } from './common.js'


export type ProbUpOptions = BaseOptions

export const initOptions: ProbUpOptions = {
  ...initBaseOptions,
}

export async function processInput(
  input: ProbUpOptions,
  globalConfig: Config | undefined,
): Promise<ParamMap> {

  const map = commonProcessInputMap(input, initOptions, globalConfig)
  map.delete(PlaceholderKey.dest)
  map.delete(PlaceholderKey.src)
  map.delete(PlaceholderKey.encodeSource)
  map.delete(PlaceholderKey.encodeTarget)

  const bucketName = map.get(PlaceholderKey.bucket)
  assert(bucketName, 'bucket is required')
  map.set(PlaceholderKey.bucketName, bucketName)

  map.set('upload', true)

  return map
}

