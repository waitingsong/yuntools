import assert from 'node:assert'

import { commonProcessInputMap } from '../helper.js'
import {
  BaseOptions,
  Config,
  ParamMap,
  PlaceholderKey,
} from '../types.js'

import { initOptions as mvOptions } from './mv.js'


/**
 * @link https://help.aliyun.com/document_detail/120057.html
 */
export interface LinkOptions extends BaseOptions {
  /** cloudurl 源路径，不包括 bucket */
  src: string
  /** cloudurl 目的路径，不包括 bucket */
  target: string
}

export const initOptions: LinkOptions = {
  ...mvOptions,
  target: '',
  src: '',
  encodeSource: true,
}


export async function processInput(
  input: LinkOptions,
  globalConfig: Config | undefined,
): Promise<ParamMap> {

  const map = commonProcessInputMap(input, initOptions, globalConfig)
  assert(map.get(PlaceholderKey.dest), 'dest is required')

  const bucket = map.get(PlaceholderKey.bucket)
  assert(bucket, 'bucket is required')
  assert(typeof bucket === 'string', 'bucket must be string')

  const src = map.get(PlaceholderKey.src)
  assert(src, 'src is required')
  assert(typeof src === 'string')
  assert(src.startsWith('oss://'), 'src must start with oss://')

  const dest = map.get(PlaceholderKey.dest)
  assert(dest, 'dest is required')

  // 命令行参数是目标在前，源在后!!
  map.set(PlaceholderKey.src, dest)
  map.set(PlaceholderKey.dest, src)

  return map
}

