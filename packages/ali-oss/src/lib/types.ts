
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

export enum ACLKey {
  /** 继承Bucket的读写权限 */
  default = 'default',
  /** 有该Bucket的拥有者可以对该Bucket内的文件进行读写操作，其他人无法访问该Bucket内的文件 */
  private = 'private',
  /**
   * 只有Bucket拥有者可以对该Bucket内的文件进行写操作，其他用户（包括匿名访问者）都可以对该Bucket中的文件进行读操作。
   * 这有可能造成您数据的外泄以及费用激增，如果被人恶意写入违法信息还可能会侵害您的合法权益。
   * 除特殊场景外，不建议您配置此权限
   */
  publicRead = 'public-read',
  /**
   * 任何人（包括匿名访问者）都可以对该Bucket内文件进行读写操作。
   * 这有可能造成您数据的外泄以及费用激增，
   * \*\*请谨慎操作\*\*
   */
  publicReadWrite = 'public-read-write',
}


export interface ProcessResp {
  /**
   * 0: success, others: error
   */
  readonly exitCode: number
  readonly exitSignal: string
  readonly stdout: string
  readonly stderr: string
}

export interface ProcessRet<T extends DataBase = DataBase> {
  readonly data: T | undefined
  readonly stdout: string
  readonly stderr: string
  /**
   * 0: success, others: error
   */
  readonly exitCode: number
  readonly exitSignal: string
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

  link = 'link',
  httpUrl = 'httpUrl',
  httpShareUrl = 'httpShareUrl',
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

export interface DataSign extends DataBase {
  /** 不带有 token 认证信息的文件路径 */
  [DataKey.link]: string | undefined
  /** 不带有 token 认证信息的链接 */
  [DataKey.httpUrl]: string | undefined
  /** 带有 token 认证信息的链接 */
  [DataKey.httpShareUrl]: string | undefined
}

export type PickFunc = (input: string, rule: RegExp, debug: boolean) => string | number | undefined


/** 扁担参数名映射 */
export enum MKey {
  /** 设置分片大小，单位为字节 */
  partSize = 'part-size',
  /** 文件名称的编码方式。取值为url。如果不指定该选项，则表示文件名称未经过编码 */
  encodingType = 'encoding-type',
  /** 上传链接子目录，默认不上传 */
  enableSymlinkDir = 'enable-symlink-dir',
  /** 批量操作时不忽略错误 */
  disableIgnoreError = 'disable-ignore-error',
  /** 仅上传当前目录下的文件，忽略子目录及子目录下的文件 */
  onlyCurrentDir = 'only-current-dir',
  /** 设置断点续传文件的大小阈值，单位为字节 */
  bigfileThreshold = 'bigfile-threshold',
  /** 指定断点续传记录信息所在的目录 */
  checkpointDir = 'checkpoint-dir',
  /** 指定保存上传文件时的快照信息所在的目录。在下一次上传文件时，ossutil会读取指定目录下的快照信息进行增量上传 */
  snapshotPath = 'snapshot-path',
  /** 表示上传文件时不为目录生成Object */
  disableCrc64 = 'disable-crc64',
  /** Object 的指定版本。仅适用于已开启或暂停版本控制状态 Bucket下的 Object */
  versionId = 'version-id',
  /**
   * Object 的所有版本。
   * 仅适用于已开启或暂停版本控制状态 Bucket 下的 Object，
   * 且同一个删除示例中仅允许选择--version-id或--all-versions其中一个选项
   */
  allVersions = 'all-versions',

  /** 客户端读超时的时间，单位为秒，默认值为1200 */
  readTimeoutSec = 'read-timeout',
  /** 客户端连接超时的时间，单位为秒，默认值为120 */
  connectTimeoutSec = 'connect-timeout',
  /** 超时秒 */
  timeoutSec = 'timeout',
  traficLimit = 'trafic-limit',
  /* 不对cloud_url中携带的正斜线（/）进行编码 */
  disableEncodeSlash = 'disable-encode-slash',
}

/**
 * ossutil 的通用选项，可以在大部分命令中使用
 * @link https://help.aliyun.com/document_detail/50455.htm
 */
export interface BaseOptions {
  endpoint?: string
  accessKeyId?: string
  accessKeySecret?: string
  stsToken?: string
  /** 在当前工作目录下输出ossutil日志文件ossutil.log。该选项默认为空，表示不输出日志文件 */
  loglevel?: 'info' | 'debug'
  /**
   * 客户端读超时的时间，单位为秒，
   * @default 1200
   */
  [MKey.readTimeoutSec]?: number
  /**
   * 客户端连接超时的时间，单位为秒，
   * @default 120
   */
  [MKey.connectTimeoutSec]?: number
}

/**
 * @link https://help.aliyun.com/document_detail/120057.html
 */
export interface CpOptions extends BaseOptions {
  /** 递归操作。
   * 当指定该选项时，ossutil 会对 Bucket下所有符合条件的 Object 进行操作，
   * 否则只对指定的单个 Object 进行操作
   */
  recursive?: boolean

  /** 强制操作，不进行询问提示 */
  force?: boolean

  /** 只有当目标文件不存在，或源文件的最后修改时间晚于目标文件时，才会执行上传操作 */
  update?: boolean

  /** 设置分片大小，单位为字节 */
  [MKey.partSize]?: number

  /** 文件名称的编码方式。取值为url。如果不指定该选项，则表示文件名称未经过编码 */
  [MKey.encodingType]?: string

  /**
   * 最大上传速度，单位为 KB/s
   * @default 0 不限制上传速度
   */
  maxupspeed?: number

  /**
   * 上传链接子目录，默认不上传
   * @default false
   * */
  [MKey.enableSymlinkDir]?: boolean

  /** 批量操作时不忽略错误 */
  [MKey.disableIgnoreError]?: boolean

  /** 仅上传当前目录下的文件，忽略子目录及子目录下的文件 */
  [MKey.onlyCurrentDir]?: boolean

  /**
   * 设置断点续传文件的大小阈值，单位为字节
   * @default 100 * 1024 * 1024 (100MB)
   */
  [MKey.bigfileThreshold]?: number

  /** 指定断点续传记录信息所在的目录 */
  [MKey.checkpointDir]?: string

  /** 包含符合指定条件的所有文件 */
  include?: string

  /** 不包含任何符合指定条件的文件 */
  exclude?: string

  /** 文件的元信息。包括部分HTTP标准属性（HTTP Header）以及以x-oss-meta-开头的用户自定义元数据 */
  meta?: string

  /**
   * @default ACLKey.default
   */
  acl?: ACLKey

  /** 指定保存上传文件时的快照信息所在的目录。在下一次上传文件时，ossutil会读取指定目录下的快照信息进行增量上传 */
  [MKey.snapshotPath]?: string

  /**
   * 表示上传文件时不为目录生成Object
   * @default false
   */
  [MKey.disableCrc64]?: boolean

  /** 请求的支付方式。如果希望访问指定路径下的资源产生的流量、请求次数等费用由请求者支付，请将此选项的值设置为requester */
  payer?: string

  /**
   * 上传文件时设置标签信息，格式为 `TagkeyA=TagvalueA&TagkeyB=TagvalueB....`
   */
  tagging?: string

  /**
   * 多文件操作时的并发任务数
   * @default 3
   */
  jobs?: number

  /** 单文件操作时的并发任务数，取值范围为 1~10000 */
  parallel?: number
}


/**
 * @link https://help.aliyun.com/document_detail/120053.html
 */
export interface RmOptions extends BaseOptions {
  /**
   * 删除 Bucket 下所有符合 prefix 条件的 Object
   * 如果不指定该选项，则ossutil只删除指定Object
   */
  recursive?: boolean

  /** 仅在删除 Bucket 时使用此选项 */
  bucket?: string

  /** 指定操作的对象为 Bucket 中未完成的 Multipart 事件 */
  multipart?: boolean

  /** 包含符合指定条件的所有 Object */
  include?: string

  /** 不包含任何符合指定条件的 Object */
  exclude?: string

  /** Object 的指定版本。仅适用于已开启或暂停版本控制状态 Bucket下的 Object */
  [MKey.versionId]?: string

  /**
   * Object 的所有版本。
   * 仅适用于已开启或暂停版本控制状态 Bucket 下的 Object，
   * 且同一个删除示例中仅允许选择--version-id或--all-versions其中一个选项
   */
  [MKey.allVersions]?: boolean

  /**
   * 对 `oss://bucket_name` 之后的 prefix 进行编码，取值为url
   * 如果不指定该选项，则表示 prefix 未经过编码
   */
  [MKey.encodingType]?: string
}

export interface MvOptions extends BaseOptions {
  /** 强制操作，不进行询问提示 */
  force?: boolean
}

export interface SignOptions extends BaseOptions {
  /**
   * 签名 URL 过期时间，单位秒
   * @default 60
   */
  [MKey.timeoutSec]?: number
  /** Object 的指定版本ID。仅适用于已开启或暂停版本控制状态 Bucket下的 Object */
  [MKey.versionId]?: string
  /**
   * 限定HTTP的访问速度，单位为bit/s。缺省值为0，表示不受限制。
   * 取值范围为 819200~838860800
   */
  [MKey.traficLimit]?: number
  /**
   * 不对cloud_url中携带的正斜线（/）进行编码
   * @default false
   */
  [MKey.disableEncodeSlash]?: boolean
}

export enum Msg {
  cloudFileAlreadyExists = 'Cloud file already exists',
}

