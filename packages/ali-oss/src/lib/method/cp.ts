import assert from 'node:assert'

import { undefined } from '../config.js'
import { commonProcessInputMap } from '../helper.js'
import {
  ACLKey,
  Config,
  DataBase,
  DataKey,
  ParamMap,
  PlaceholderKey,
} from '../types.js'

import { initOptions as mvOptions, MvOptions } from './mv.js'


/**
 * @link https://help.aliyun.com/document_detail/120057.html
 */
export interface CpOptions extends MvOptions {
  /** 目的 cloudurl 路径，不包括 bucket */
  target: string
  /** 源路径，可以是本地文件或 cloudurl */
  src: string

  /**
   * 设置断点续传文件的大小阈值，单位为字节
   * @default 100 * 1024 * 1024 (100MB)
   */
  bigfileThreshold?: number

  /** 指定断点续传记录信息所在的目录 */
  checkpointDir?: string

  /**
   * 上传链接子目录，默认不上传
   * @default false
   * */
  enableSymlinkDir?: boolean

  /**
   * 表示上传文件时不为目录生成Object
   * @default false
   */
  disableCrc64?: boolean

  /** 批量操作时不忽略错误 */
  disableIgnoreError?: boolean

  /** 仅上传当前目录下的文件，忽略子目录及子目录下的文件 */
  onlyCurrentDir?: boolean

  /** 设置分片大小，单位为字节 */
  partSize?: number

  /** 指定保存上传文件时的快照信息所在的目录。在下一次上传文件时，ossutil会读取指定目录下的快照信息进行增量上传 */
  snapshotPath?: string

  /**
   * @default ACLKey.default
   */
  acl?: ACLKey

  /** 不包含任何符合指定条件的文件 */
  exclude?: string

  /** 包含符合指定条件的所有文件 */
  include?: string

  /**
   * 多文件操作时的并发任务数
   * @default 3
   */
  jobs?: number

  /**
   * 最大上传速度，单位为 KB/s
   * @default 0 不限制上传速度
   */
  maxupspeed?: number

  /** 文件的元信息。包括部分HTTP标准属性（HTTP Header）以及以x-oss-meta-开头的用户自定义元数据 */
  meta?: string

  /** 请求的支付方式。如果希望访问指定路径下的资源产生的流量、请求次数等费用由请求者支付，请将此选项的值设置为requester */
  payer?: string

  /** 单文件操作时的并发任务数，取值范围为 1~10000 */
  parallel?: number

  /**
   * 上传文件时设置标签信息，格式为 `TagkeyA=TagvalueA&TagkeyB=TagvalueB....`
   */
  tagging?: string

  /** 只有当目标文件不存在，或源文件的最后修改时间晚于目标文件时，才会执行上传操作 */
  update?: boolean
}

export const initOptions: CpOptions = {
  ...mvOptions,

  bigfileThreshold: undefined,
  checkpointDir: undefined,
  disableCrc64: undefined,
  disableIgnoreError: undefined,
  enableSymlinkDir: undefined,
  onlyCurrentDir: undefined,
  partSize: undefined,
  snapshotPath: undefined,
  acl: undefined,
  exclude: undefined,
  force: false,
  jobs: undefined,
  include: undefined,
  maxupspeed: 0,
  meta: undefined,
  parallel: undefined,
  payer: undefined,
  recursive: false,
  tagging: undefined,
  update: false,
}

export interface DataCp extends DataBase {
  /** byte/s */
  [DataKey.averageSpeed]: number | undefined
  [DataKey.succeedTotalNumber]: number | undefined
  [DataKey.succeedTotalSize]: string | undefined
  [DataKey.uploadDirs]: number
  [DataKey.uploadFiles]: number
  /** sync between cloud */
  [DataKey.copyObjects]: number
}


export async function processInput(
  input: CpOptions,
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

  return map
}

