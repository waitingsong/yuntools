import assert from 'node:assert'

import { commonProcessInputMap, encodeInputPath } from '../helper.js'
import {
  Config,
  DataBase,
  DataKey,
  ParamMap,
  PlaceholderKey,
} from '../types.js'

import { initOptions as cpOptions, CpOptions } from './cp.js'


/**
 * @link https://help.aliyun.com/document_detail/120057.html
 */
export interface DownloadOptions extends CpOptions {
  /** 目的 cloudurl 路径，不包括 bucket */
  target: string
  /** 源路径，必须是本地文件 */
  src: string
}

export const initOptions: DownloadOptions = {
  ...cpOptions,
  encodeSource: true,
  encodeTarget: false,
}

export interface DataDownload extends DataBase {
  /** byte/s */
  [DataKey.averageSpeed]: number | undefined
  [DataKey.succeedTotalNumber]: number | undefined
  [DataKey.succeedTotalSize]: string | undefined
  // [DataKey.uploadDirs]: number
  // [DataKey.uploadFiles]: number
  /** sync between cloud */
  [DataKey.downloadObjects]: number
}


export async function processInput(
  input: DownloadOptions,
  globalConfig: Config | undefined,
): Promise<ParamMap> {

  const { src, target, encodeTarget } = input
  assert(src, 'src is required')
  assert(target, 'target is required')

  // const pathSrc = typeof encodeSource === 'undefined' || encodeSource === true
  //   ? encodeInputPath(src, true)
  //   : src

  const path = typeof encodeTarget === 'undefined' || encodeTarget === true
    ? encodeInputPath(target, true)
    : target

  const opts: DownloadOptions = {
    ...input,
    // src: pathSrc,
    target: path,
    // encodeSource: false,
    encodeTarget: false,
  }

  const map = commonProcessInputMap(opts, initOptions, globalConfig)
  assert(map.get(PlaceholderKey.dest), 'dest is required')

  const bucket = map.get(PlaceholderKey.bucket)
  assert(bucket, 'bucket is required')
  assert(typeof bucket === 'string', 'bucket must be string')

  return map
}

