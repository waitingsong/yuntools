import assert from 'node:assert'

import { commonProcessInputMap, encodeInputPath } from '../helper.js'
import {
  Config,
  ParamMap,
  PlaceholderKey,
} from '../types.js'

import { initOptions as uploadOptions, UploadOptions } from './upload.js'


/**
 * @link https://help.aliyun.com/document_detail/193394.html
 */
export interface SyncOptions extends Omit<UploadOptions, 'recursive'> {
  /** 目的 cloudurl 路径 */
  target: string
  /** 源路径，可以是本地文件或 cloudurl */
  src: string

  /**
   * 删除目的端指定路径下的其他文件，仅保留本次同步的文件,
   * **警告: 建议启用本选项前开启版本控制，防止数据误删除**
   *
   * @default false
   */
  delete?: boolean
}

export const initOptions: SyncOptions = {
  ...uploadOptions,

  delete: false,
  force: true,
}


export async function processInputCloud(
  input: SyncOptions,
  globalConfig: Config | undefined,
): Promise<ParamMap> {

  const { src, encodeSource } = input
  assert(src, 'src is required')

  const srcNew = typeof encodeSource === 'undefined' || encodeSource === true
    ? encodeInputPath(src, true)
    : src
  const opts: SyncOptions = {
    ...input,
    src: srcNew,
    encodeSource: false,
  }

  const map = commonProcessInputMap(opts, initOptions, globalConfig)
  assert(map.get(PlaceholderKey.dest), 'dest is required')

  const bucket = map.get(PlaceholderKey.bucket)
  assert(bucket, 'bucket is required')
  assert(typeof bucket === 'string', 'bucket must be string')

  return map
}


export async function processInputLocal(
  input: SyncOptions,
  globalConfig: Config | undefined,
): Promise<ParamMap> {

  const { target: dst, encodeSource, encodeTarget } = input
  assert(dst, 'target is required')

  const encode2 = !! (typeof encodeTarget === 'undefined' || encodeTarget === true)
  const dstNew = encode2
    ? encodeInputPath(dst, true)
    : dst
  const opts: SyncOptions = {
    ...input,
    target: dstNew,
    encodeSource: encodeSource ?? true,
    encodeTarget: false,
  }

  const map = commonProcessInputMap(opts, initOptions, globalConfig)
  assert(map.get(PlaceholderKey.dest), 'dest is required')
  assert(map.get(PlaceholderKey.src), 'src is required')

  const bucket = map.get(PlaceholderKey.bucket)
  assert(bucket, 'bucket is required')
  assert(typeof bucket === 'string', 'bucket must be string')

  map.set('encodeTarget', encode2)

  return map
}
