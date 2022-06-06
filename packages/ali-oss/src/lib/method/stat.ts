import { undefined } from '../config.js'
import {
  BaseOptions,
  Config,
  DataBase,
  DataKey,
  ParamMap,
} from '../types.js'

import { initBaseOptions, processInputWoSrc } from './common.js'


export interface StatOptions extends BaseOptions {
  /** cloudurl 路径，不包括 bucket */
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

  const map = await processInputWoSrc(input, initOptions, globalConfig)
  return map
}

