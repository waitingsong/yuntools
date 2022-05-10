
export type ConfigPath = string

export interface Config {
  /**
   * @default CH
   */
  language?: 'CH' | 'EN'
  endpoint: string
  accessKeyId: string
  accessKeySecret: string
  stsToken?: string
}

export interface ProcessRet<T extends DataBase = DataBase> {
  readonly stdout: string
  readonly data: T
}

export enum DataKey {
  elapsed = 'elapsed',
  averageSpeed = 'averageSpeed',

  acl = 'ACL',
  acceptRanges = 'Accept-Ranges',
  contentLength = 'Content-Length',
  contentMd5 = 'Content-Md5',
  contentType = 'Content-Type',
  etag = 'Etag',
  lastModified = 'Last-Modified',
  owner = 'Owner',
  xOssHashCrc64ecma = 'X-Oss-Hash-Crc64ecma',
  xOssObjectType = 'X-Oss-Object-Type',
  xOssStorageClass = 'X-Oss-Storage-Class',

  // total = 'total',
  // succeed = 'succeed',
  // removed = 'removed',
}

export interface DataBase {
  /**
   * @example 0.303190
   */
  [DataKey.elapsed]: string | undefined
}

export interface DataCp extends DataBase {
  /** byte/s */
  [DataKey.averageSpeed]: number | undefined
}

export interface DataStat extends DataBase {
  [DataKey.acl]: string | undefined
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

export type PickFunc = (input: string, rule: RegExp, debug: boolean) => string | number | undefined

export interface BaseOptions {
  endpoint?: string
  accessKeyId?: string
  accessKeySecret?: string
  stsToken?: string
  [k: string]: string | number | boolean | undefined
}

/**
 * @link https://help.aliyun.com/document_detail/120057.html
 */
export interface CpOptions extends BaseOptions {
  recursive?: boolean
  force?: boolean
  update?: boolean
  'part-size'?: number
  'encoding-type'?: string
  jobs?: number
  parallel?: number
}

