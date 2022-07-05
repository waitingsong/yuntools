
export type ConfigPath = string

export enum PlaceholderKey {
  src = '__src__',
  dest = '__dest__',
  target = '__target__',
  bucket = 'bucket',
  bucketName = 'bucketname',
  /**
   * 对于远程目录进行编码，并且添加 `oss://` 前缀
   * 不适用于本地目录
   */
  encodeSource = 'encodeSource',
  /**
   * 对于远程目录进行编码，并且添加 `oss://` 前缀
   */
  encodeTarget = 'encodeTarget',
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

  succeedTotalNumber = 'succeedTotalNumber',
  succeedTotalSize = 'succeedTotalSize',
  uploadDirs = 'uploadDirs',
  uploadFiles = 'uploadFiles',
  /** sync between cloud */
  copyObjects = 'copyObjects',
}


export type PickFunc = (input: string, rule: RegExp, debug: boolean) => string | number | undefined

export enum FnKey {
  cp = 'cp',
  link = 'createSymlink',
  mkdir = 'mkdir',
  mv = 'mv',
  pathExists = 'pathExists',
  probeUpload = 'probeUpload',
  rm = 'rm',
  rmrf = 'rmrf',
  sign = 'sign',
  stat = 'stat',
  syncCloud = 'syncCloud',
  syncLocal = 'syncLocal',
  syncRemote = 'syncRemote',
  upload = 'upload',
}

export enum CmdKey {
  cp = 'cp',
  link = 'create-symlink',
  createSymlink = 'create-symlink',
  mkdir = 'mkdir',
  mv = 'mv',
  probeUpload = 'probe',
  rm = 'rm',
  rmrf = 'rm',
  sign = 'sign',
  stat = 'stat',
  syncCloud = 'sync',
  syncLocal = 'sync',
  syncRemote = 'sync',
  upload = 'cp',
}


/** 扁担参数名映射 */
export enum MKey {
  accessKeyId = 'access-key-id',
  accessKeySecret = 'access-key-secret',
  stsToken = 'sts-token',

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
  /** 参数名typo */
  trafficLimit = 'trafic-limit',
  /* 不对cloud_url中携带的正斜线（/）进行编码 */
  disableEncodeSlash = 'disable-encode-slash',
}

export interface Config {
  accessKeyId?: string
  accessKeySecret?: string
  stsToken?: string
  endpoint?: string
}

export enum Msg {
  accessDenied = 'AccessDenied',
  cloudFileAlreadyExists = 'Cloud file already exists',
  cloudConfigFileNotExists = 'Cloud config file not exists',
  noSuchBucket = 'NoSuchBucket',
}


export type DownLinks = {
  [key in NodeJS.Platform]?: string
}


/**
 * ossutil 的通用选项，可以在大部分命令中使用
 * @link https://help.aliyun.com/document_detail/50455.htm
 */
export interface BaseOptions extends Config {
  /**
   * 是否对 `oss://bucket_name` 后面的key（目录名称）进行编码。
   * - 若输入参数已经被编码（比如从操作结果中获取），则需要显示设置为 false
   * - 若为本地目录，则不能设置为 true
   * @default false
   */
  [PlaceholderKey.encodeSource]?: boolean | undefined
  /**
   * 是否对 `oss://bucket_name` 后面的key（目录名称）进行编码。
   * 若输入参数已经被编码（比如从操作结果中获取），则需要显示设置为 false
   * @default true
   */
  [PlaceholderKey.encodeTarget]?: boolean | undefined
  /** `oss://bucket_name` */
  [PlaceholderKey.bucket]?: string | undefined

  /**
   * 客户端连接超时的时间，单位为秒，
   * @default 120
   */
  connectTimeoutSec?: number | undefined
  /**
   * 客户端读超时的时间，单位为秒，
   * @default 1200
   */
  readTimeoutSec?: number | undefined
  /** 在当前工作目录下输出ossutil日志文件ossutil.log。该选项默认为空，表示不输出日志文件 */
  loglevel?: 'info' | 'debug' | undefined
}


export interface DataBase {
  /**
   * @example 0.303190
   */
  [DataKey.elapsed]: string | undefined
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

export type ParamMap = Map<string, string | number | boolean>

export type ProcessInputFn = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: any | undefined,
  globalConfig: Config | undefined,
) => Promise<ParamMap>
