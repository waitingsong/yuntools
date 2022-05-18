import assert from 'assert/strict'
import { createHash } from 'crypto'
import { statSync, writeFileSync } from 'fs'
import { rm } from 'fs/promises'
import { tmpdir, homedir } from 'os'
import { join } from 'path'

import { run } from 'rxrunscript'

import { combineProcessRet, genParams, parseRespStdout, processResp } from './helper'
import { regxStat } from './rule'
import {
  Config,
  ConfigPath,
  CpOptions,
  DataBase,
  DataCp,
  DataKey,
  DataSign,
  DataStat,
  Msg,
  MvOptions,
  ProcessRet,
  RmOptions,
  SignOptions,
} from './types'


/**
 * 阿里云 OSS 服务接口，
 * 基于命令行工具 ossutil 封装
 */
export class OssClient {

  debug = false
  configHash: string
  config: string

  constructor(
    /**
     * 配置参数或者配置文件路径
     * @default ~/.ossutilconfig
     */
    protected readonly _config: Config | ConfigPath = join(homedir(), '.ossutilconfig'),
    public cmd = 'ossutil',
  ) {

    this.validateConfig(_config)
    if (typeof _config === 'string') {
      this.config = _config
    }
    else {
      const { path, hash } = this.init(_config)
      this.configHash = hash
      this.config = path
      this.validateConfig(this.config)
    }
  }

  /**
   * 删除OSS配置文件
   */
  async destroy(): Promise<void> {
    const { config } = this
    if (config && typeof config === 'string') {
      await rm(config)
    }
  }

  /**
   * 创建目录
   * @link https://help.aliyun.com/document_detail/120062.html
   */
  async mkdir(
    /**
     * 包含 bucket 和 object 的路径
     * @example oss://bucket/foo
     */
    dir: string,
  ): Promise<ProcessRet> {

    assert(typeof this.config === 'string')

    // const ps = this.genCliParams(config)
    const ps: string[] = []
    const resp$ = run(`${this.cmd} mkdir -c ${this.config} ${ps.join(' ')} ${dir}`)
    const res = await processResp(resp$, this.debug)

    const keys: DataKey[] = [DataKey.elapsed]
    const data = parseRespStdout<DataStat>(res, keys, this.debug)
    const ret = combineProcessRet(res, data)

    return ret
  }

  /**
   * 拷贝文件
   * @link https://help.aliyun.com/document_detail/120057.html
   */
  async cp(
    src: string,
    dst: string,
    options?: CpOptions,
  ): Promise<ProcessRet<DataCp>> {

    assert(src, 'src is required')
    assert(dst, 'dst is required')

    const ps = genParams(this.config, options)

    if (! options || ! options.force) {
      const stat = await this.stat(dst)
      if (! stat.exitCode) {
        const ret: ProcessRet<DataCp> = {
          exitCode: 1,
          exitSignal: '',
          stdout: '',
          stderr: `${Msg.cloudFileAlreadyExists}: "${dst}"`,
          data: void 0,
        }
        return ret
      }
    }

    const resp$ = run(`${this.cmd} cp ${src} ${dst} ${ps.join(' ')} `)
    const res = await processResp(resp$, this.debug)

    const keys = [DataKey.elapsed, DataKey.averageSpeed]
    const data = parseRespStdout<DataCp>(res, keys, this.debug)
    const ret = combineProcessRet(res, data)
    return ret
  }

  /**
   * 创建软链接
   * @link https://help.aliyun.com/document_detail/120059.html
   */
  async createSymlink(
    src: string,
    dst: string,
  ): Promise<ProcessRet> {

    assert(src, 'src is required')
    assert(dst, 'dst is required')

    const ps = this.genCliParams()
    const resp$ = run(`${this.cmd} create-symlink ${ps.join(' ')} ${dst} ${src}`)
    const res = await processResp(resp$, this.debug)

    const data = parseRespStdout(res, [DataKey.elapsed], this.debug)
    const ret = combineProcessRet(res, data)
    return ret
  }

  /**
   * 删除
   * @link https://help.aliyun.com/document_detail/120053.html
   */
  async rm(
    path: string,
    options?: RmOptions,
  ): Promise<ProcessRet> {

    assert(path, 'src is required')

    const ps = genParams(this.config, options)
    const resp$ = run(`${this.cmd} rm -f ${ps.join(' ')} ${path} `)
    const res = await processResp(resp$, this.debug)

    const data = parseRespStdout(res, [DataKey.elapsed], this.debug)
    const ret = combineProcessRet(res, data)
    return ret
  }

  /**
   * 递归删除，相当于 `rm -rf`
   * @link https://help.aliyun.com/document_detail/120053.html
   */
  async rmrf(
    path: string,
    options?: Omit<RmOptions, 'recursive'>,
  ): Promise<ProcessRet> {

    const ret = await this.rm(path, { ...options, recursive: true })
    return ret
  }

  /**
   * 探测上传状态
   * @link https://help.aliyun.com/document_detail/120061.html
   */
  async probeUpload(
    bucket: string,
  ): Promise<ProcessRet> {

    assert(bucket, 'bucket is required')
    const ps = this.genCliParams()
    // const resp = await firstValueFrom(run(`${this.cmd} probe ${ps.join(' ')} --upload --bucketname ${bucket}`))
    const resp$ = run(`${this.cmd} probe ${ps.join(' ')} --upload --bucketname ${bucket}`)
    const res = await processResp(resp$, this.debug)

    const data = parseRespStdout(res, [DataKey.elapsed], this.debug)
    const ret = combineProcessRet(res, data)
    return ret
  }

  /**
   * 查看Bucket和Object信息
   * @link https://help.aliyun.com/document_detail/120054.html
   */
  async stat(
    path: string,
  ): Promise<ProcessRet<DataStat>> {

    assert(path, 'path is required')

    const ps = this.genCliParams()
    const resp$ = run(`${this.cmd} stat ${ps.join(' ')} ${path} `)
    const res = await processResp(resp$, this.debug)

    const keys: DataKey[] = [DataKey.elapsed].concat(Array.from(regxStat.keys()))
    const data = parseRespStdout<DataStat>(res, keys, this.debug)
    const ret = combineProcessRet(res, data)
    return ret
  }


  /**
   * OSS 远程路径是否存在
   */
  async pathExists(
    path: string,
  ): Promise<boolean> {

    assert(path, 'path is required')

    const stat = await this.stat(path)
    const exists = !! (stat.exitCode === 0 && stat.data)
    return exists
  }


  /**
   * 移动 OSS 对象
   * 流程为先 `cp()` 然后 `rm()`
   */
  async mv(
    src: string,
    dst: string,
    options?: MvOptions,
  ): Promise<ProcessRet<DataStat | DataBase>> {

    assert(src, 'src is required')
    assert(dst, 'dst is required')
    assert(src !== dst, 'src and dst must not be the same')

    const cp = await this.cp(src, dst, options)
    if (cp.exitCode) {
      return cp
    }

    const remove = await this.rm(src, options)
    if (remove.exitCode) {
      return remove
    }

    const stat = await this.stat(dst)
    return stat
  }


  /**
   * sign（生成签名URL）
   * @link https://help.aliyun.com/document_detail/120064.html
   */
  async sign(
    src: string,
    options?: SignOptions,
  ): Promise<ProcessRet<DataSign>> {

    assert(src, 'src is required')

    const opts: SignOptions = {
      timeout: 60,
      'disable-encode-slash': false,
      ...options,
    }

    const ps = genParams(this.config, opts)
    const resp$ = run(`${this.cmd} sign ${ps.join(' ')} ${src} `)
    const res = await processResp(resp$, this.debug)

    const keys = [DataKey.elapsed, DataKey.httpUrl, DataKey.httpShareUrl]
    const data = parseRespStdout<DataSign>(res, keys, this.debug)
    const ret = combineProcessRet(res, data)
    return ret
  }


  validateConfig(config: Config | ConfigPath): void {
    if (typeof config === 'string') {
      assert(config, 'config file path is empty')
      // assert(fs.pathExistsSync(config), `config file ${config} not exists`)
      const exists = statSync(config).isFile()
      assert(exists, `config file ${config} not exists`)
      return
    }

    const { language, endpoint, accessKeyId, accessKeySecret } = config

    if (typeof language !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      assert(language === 'CH' || language === 'EN', 'language must be CH or EN')
    }
    assert(endpoint, 'endpoint is required')
    assert(accessKeyId, 'accessKeyID is required')
    assert(accessKeySecret, 'accessKeySecret is required')
  }


  genCliParams(config?: Config | ConfigPath): string[] {
    const conf = config ?? this.config
    this.validateConfig(conf)

    if (typeof conf === 'string') {
      return ['-c', conf]
    }

    const { language, endpoint, accessKeyId, accessKeySecret, stsToken } = conf
    const ps: string[] = []

    language && ps.push('-L', language)
    accessKeyId && ps.push('-i', accessKeyId)
    accessKeySecret && ps.push('-k', accessKeySecret)
    endpoint && ps.push('-e', endpoint)
    stsToken && ps.push('-t', stsToken)

    return ps
  }


  private init(config: Config): { path: ConfigPath, hash: string } {
    this.validateConfig(config)

    const sha1 = createHash('sha1')
    const hash = sha1.update(JSON.stringify(config)).digest('hex')
    const path = join(tmpdir(), `${hash}.tmp`)
    // console.info({ hash, path })
    try {
      const exists = statSync(path).isFile()
      if (exists) {
        return { path, hash }
      }
    }
    catch (ex) {
      void ex
    }

    const arr: string[] = ['[Credentials]']
    const { language, endpoint, accessKeyId, accessKeySecret, stsToken } = config
    arr.push(`language = ${language ?? 'EN'}`)
    arr.push(`endpoint = ${endpoint}`)
    arr.push(`accessKeyID = ${accessKeyId}`)
    arr.push(`accessKeySecret = ${accessKeySecret}`)
    stsToken && arr.push(`stsToken = ${stsToken}`)

    writeFileSync(path, arr.join('\n'))
    return { path, hash }
  }

}

