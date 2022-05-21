import { initBaseOptions, undefined } from './config'
import {
  BaseOptions,
  DataBase,
  DataKey,
} from './types'


export const initStatOptions: StatOptions = {
  ...initBaseOptions,
  encodingType: undefined,
  versionId: undefined,
  payer: undefined,
}


export interface StatOptions extends BaseOptions {
  encodingType?: 'url' | undefined
  versionId?: string | undefined
  payer?: string | undefined
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

