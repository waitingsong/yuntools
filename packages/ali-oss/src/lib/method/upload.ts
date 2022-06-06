import assert from 'node:assert'

import { commonProcessInputMap, encodeInputPath } from '../helper.js'
import {
  Config,
  ParamMap,
  PlaceholderKey,
} from '../types.js'

import { initOptions as cpOptions, CpOptions } from './cp.js'


/**
 * @link https://help.aliyun.com/document_detail/120057.html
 */
export interface UploadOptions extends CpOptions {
  /** 目的 cloudurl 路径，不包括 bucket */
  target: string
  /** 源路径，必须是本地文件 */
  src: string
}

export const initOptions: UploadOptions = {
  ...cpOptions,
  encodeSource: true,
}

export async function processInput(
  input: UploadOptions,
  globalConfig: Config | undefined,
): Promise<ParamMap> {

  const { src, encodeSource } = input
  assert(src, 'src is required')

  const path = typeof encodeSource === 'undefined' || encodeSource === true
    ? encodeInputPath(src, true)
    : src
  const opts: UploadOptions = {
    ...input,
    src: path,
    encodeSource: false,
  }

  const map = commonProcessInputMap(opts, initOptions, globalConfig)
  assert(map.get(PlaceholderKey.dest), 'dest is required')

  const bucket = map.get(PlaceholderKey.bucket)
  assert(bucket, 'bucket is required')
  assert(typeof bucket === 'string', 'bucket must be string')

  return map
}

