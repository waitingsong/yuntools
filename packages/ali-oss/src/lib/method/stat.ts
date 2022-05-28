import assert from 'node:assert'

import { undefined } from '../config.js'
import { commonProcessInputMap } from '../helper.js'
import {
  BaseOptions,
  Config,
  DataBase,
  DataKey,
  ParamMap,
  PlaceholderKey,
} from '../types.js'

import { initBaseOptions } from './common.js'


export interface StatOptions extends BaseOptions {
  /** 目的 cloudurl 路径 */
  target: string

  versionId?: string | undefined
  payer?: string | undefined
}

export const initOptions: StatOptions = {
  ...initBaseOptions,
  target: '',

  versionId: undefined,
  payer: undefined,
}


export interface DataStat extends DataBase {
  [DataKey.acl]: 'default' | 'public' | 'private'
  [DataKey.acceptRanges]: string | undefined
  [DataKey.contentLength]: number | undefined
  [DataKey.contentMd5]: string | undefined
  [DataKey.contentType]: string | undefined
  [DataKey.etag]: string | undefined
  [DataKey.lastModified]: string | undefined
  [DataKey.owner]: string | undefined
  [DataKey.xOssHashCrc64ecma]: string | undefined
  [DataKey.xOssObjectType]: string | undefined
  [DataKey.xOssStorageClass]: string | undefined
}


export async function processInput(
  input: StatOptions,
  globalConfig: Config | undefined,
): Promise<ParamMap> {

  const map = commonProcessInputMap(input, initOptions, globalConfig)
  assert(map.get(PlaceholderKey.dest), 'dest is required')
  map.delete(PlaceholderKey.src)

  return map
}

