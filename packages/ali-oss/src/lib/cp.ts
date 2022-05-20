import { undefined } from './config'
import { initMvOptions, MvOptions } from './mv'
import {
  ACLKey,
  DataBase,
  DataKey,
  MKey,
} from './types'


export const initCpOptions: CpOptions = {
  ...initMvOptions,
  [MKey.bigfileThreshold]: undefined,
  [MKey.checkpointDir]: undefined,
  [MKey.disableCrc64]: undefined,
  [MKey.disableIgnoreError]: undefined,
  [MKey.enableSymlinkDir]: undefined,
  [MKey.encodingType]: undefined,
  [MKey.onlyCurrentDir]: undefined,
  [MKey.partSize]: undefined,
  [MKey.snapshotPath]: undefined,
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


/**
 * @link https://help.aliyun.com/document_detail/120057.html
 */
export interface CpOptions extends MvOptions {
  /**
   * 设置断点续传文件的大小阈值，单位为字节
   * @default 100 * 1024 * 1024 (100MB)
   */
  [MKey.bigfileThreshold]?: number

  /** 指定断点续传记录信息所在的目录 */
  [MKey.checkpointDir]?: string

  /** 文件名称的编码方式。取值为url。如果不指定该选项，则表示文件名称未经过编码 */
  [MKey.encodingType]?: 'url'

  /**
   * 上传链接子目录，默认不上传
   * @default false
   * */
  [MKey.enableSymlinkDir]?: boolean

  /**
   * 表示上传文件时不为目录生成Object
   * @default false
   */
  [MKey.disableCrc64]?: boolean

  /** 批量操作时不忽略错误 */
  [MKey.disableIgnoreError]?: boolean

  /** 仅上传当前目录下的文件，忽略子目录及子目录下的文件 */
  [MKey.onlyCurrentDir]?: boolean

  /** 设置分片大小，单位为字节 */
  [MKey.partSize]?: number

  /** 指定保存上传文件时的快照信息所在的目录。在下一次上传文件时，ossutil会读取指定目录下的快照信息进行增量上传 */
  [MKey.snapshotPath]?: string

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

export interface DataCp extends DataBase {
  /** byte/s */
  [DataKey.averageSpeed]: number | undefined
}
