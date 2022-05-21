import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir, homedir } from 'node:os'
import { join } from 'node:path'

import { run } from 'rxrunscript'

import { DataCp, CpOptions, initCpOptions } from './cp.js'
import { combineProcessRet, genParams, parseRespStdout, processResp } from './helper.js'
import { MvOptions } from './mv.js'
import { RmOptions, initRmOptions } from './rm.js'
import { regxStat } from './rule.js'
import { DataSign, SignOptions, initSignOptions } from './sign.js'
import { DataStat, StatOptions, initStatOptions } from './stat.js'
import {
  BaseOptions,
  Config,
  ConfigPath,
  DataBase,
  DataKey,
  Msg,
  ProcessRet,
} from './types.js'


/**
 * 阿里云 OSS 服务接口，
 * 基于命令行工具 ossutil 封装
 */
export class OssClient {

  debug = false
  configPath = ''

  private readonly config: Config | undefined = void 0

  constructor(
    /**
     * 配置参数或者配置文件路径
     * @default ~/.ossutilconfig
     */
    protected readonly configInput?: Config | ConfigPath,
    public cmd = 'ossutil',
  ) {

    if (typeof configInput === 'string') {
      this.configPath = configInput
    }
    else if (typeof configInput === 'object') {
      this.config = configInput
    }
    else {
      this.configPath = join(homedir(), '.ossutilconfig')
    }
  }

  /**
   * 删除OSS配置文件
   */
  async destroy(): Promise<void> {
    const { configPath: config } = this
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

    assert(typeof this.configPath === 'string')

    const ps = this.genCliParams()
    const resp$ = run(`${this.cmd} mkdir ${ps.join(' ')} ${dir}`)
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

    const ps = this.genCliParams(options, initCpOptions)

    if (! options || ! options.force) {
      const statRet = await this.stat(dst, options as StatOptions)
      if (! statRet.exitCode) {
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

    const ps = this.genCliParams(options, initRmOptions)
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
    options?: StatOptions,
  ): Promise<ProcessRet<DataStat>> {

    assert(path, 'path is required')

    const ps = this.genCliParams(options, initStatOptions)
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

    const statRet = await this.stat(path)
    const exists = !! (statRet.exitCode === 0 && statRet.data)
    return exists
  }


  /**
   * 移动云端的 OSS 对象
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

    const statRet = await this.stat(dst, options)
    return statRet
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

    const ps = this.genCliParams(options, initSignOptions)
    const resp$ = run(`${this.cmd} sign ${ps.join(' ')} ${src} `)
    const res = await processResp(resp$, this.debug)

    const keys = [DataKey.elapsed, DataKey.httpUrl, DataKey.httpShareUrl]
    const data = parseRespStdout<DataSign>(res, keys, this.debug)

    if (data?.httpUrl) {
      data.link = options?.disableEncodeSlash
        ? data.httpUrl
        : decodeURIComponent(data.httpUrl)
    }
    const ret = combineProcessRet(res, data)
    return ret
  }


  async validateConfigPath(config: ConfigPath): Promise<void> {
    assert(config, 'config file path is empty')
    const exists = (await stat(config)).isFile()
    assert(exists, `config file ${config} not exists`)
  }


  async writeConfigFile(config: Config): Promise<{ path: ConfigPath, hash: string }> {
    const sha1 = createHash('sha1')
    const hash = sha1.update(JSON.stringify(config)).digest('hex')
    const path = join(tmpdir(), `${hash}.tmp`)
    try {
      const exists = (await stat(path)).isFile()
      if (exists) {
        return { path, hash }
      }
    }
    catch (ex) {
      void ex
    }

    const arr: string[] = ['[Credentials]']
    const { endpoint, accessKeyId, accessKeySecret, stsToken } = config
    endpoint && arr.push(`endpoint = ${endpoint}`)
    accessKeyId && arr.push(`accessKeyID = ${accessKeyId}`)
    accessKeySecret && arr.push(`accessKeySecret = ${accessKeySecret}`)
    stsToken && arr.push(`stsToken = ${stsToken}`)

    await writeFile(path, arr.join('\n'))
    return { path, hash }
  }


  private genCliParams<T extends BaseOptions>(
    options?: T | undefined,
    initOptions?: T,
  ): string[] {

    const ps = genParams(
      this.configPath,
      this.config,
      options,
      initOptions,
    )
    return ps
  }

}

