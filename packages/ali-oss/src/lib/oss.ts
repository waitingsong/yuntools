import assert from 'node:assert/strict'
import { statSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { run } from 'rxrunscript'

import { cpKeys } from './config.js'
import {
  combineProcessRet,
  genParams,
  parseRespStdout,
  processResp,
} from './helper.js'
import {
  CpOptions,
  DataCp,
  DataSign,
  DataStat,
  LinkOptions,
  MkdirOptions,
  MvOptions,
  ProbUpOptions,
  RmOptions,
  RmrfOptions,
  SignOptions,
  StatOptions,
  UploadOptions,
} from './method/index.js'
import { SyncOptions } from './method/sync.js'
import { processInputFnMap } from './process-input.js'
import { regxStat } from './rule.js'
import {
  BaseOptions,
  CmdKey,
  Config,
  ConfigPath,
  DataBase,
  DataKey,
  FnKey,
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
      const pathExists = statSync(this.configPath).isFile()
      assert(pathExists, `${Msg.cloudConfigFileNotExists}: ${this.configPath}`)
    }
    else if (typeof configInput === 'object') {
      this.config = configInput
    }
    else {
      this.configPath = join(homedir(), '.ossutilconfig')
      const pathExists = statSync(this.configPath).isFile()
      assert(pathExists, `${Msg.cloudConfigFileNotExists}: ${this.configPath}`)
    }
  }

  /**
   * 删除 OSS 配置文件
   */
  async destroy(): Promise<void> {
    const { configPath } = this
    await rm(configPath)
  }

  /**
   * 在远程拷贝文件
   * 若 force 为空或者 false，且目标文件存在时会卡在命令行提示输入阶段（无显示）最后导致超时异常
   * @link https://help.aliyun.com/document_detail/120057.html
   */
  async cp(options: CpOptions): Promise<ProcessRet<DataCp>> {
    if (! options.force) {
      const statRet = await this.stat(options as StatOptions)
      if (! statRet.exitCode) {
        const ret: ProcessRet<DataCp> = {
          exitCode: 1,
          exitSignal: '',
          stdout: '',
          stderr: `${Msg.cloudFileAlreadyExists}: "${options.target}"`,
          data: void 0,
        }
        return ret
      }
    }

    const ret = await this.runner<CpOptions, DataCp>(options, FnKey.cp, cpKeys)
    return ret
  }

  /**
   * 创建软链接
   * @link https://help.aliyun.com/document_detail/120059.html
   */
  async createSymlink(options: LinkOptions): Promise<ProcessRet> {
    const keys = [DataKey.elapsed]
    const ret = await this.runner<CpOptions, DataCp>(options, FnKey.link, keys)
    return ret
  }

  /**
   * 创建目录
   * @link https://help.aliyun.com/document_detail/120062.html
   */
  async mkdir(options: MkdirOptions): Promise<ProcessRet> {
    const keys: DataKey[] = [DataKey.elapsed]
    const ret = await this.runner<MkdirOptions>(options, FnKey.mkdir, keys)
    return ret
  }

  /**
   * 移动云端的 OSS 对象
   * 流程为先 `cp()` 然后 `rm()`
   */
  async mv(options: MvOptions): Promise<ProcessRet<DataStat | DataBase>> {
    const opts: MvOptions = {
      ...options,
      encodeSource: true,
    }
    const cp = await this.cp(opts)
    if (cp.exitCode) {
      return cp
    }

    const opts2: RmOptions = {
      ...options,
      target: options.src,
    }
    const remove = await this.rm(opts2)
    if (remove.exitCode) {
      return remove
    }

    const statRet = await this.stat(opts)
    return statRet
  }

  /**
   * OSS 远程路径是否存在
   */
  async pathExists(options: StatOptions): Promise<boolean> {
    const statRet = await this.stat(options)
    const exists = !! (statRet.exitCode === 0 && statRet.data)
    return exists
  }

  /**
   * 探测上传状态
   * @link https://help.aliyun.com/document_detail/120061.html
   */
  async probeUpload(options: ProbUpOptions): Promise<ProcessRet> {
    const keys = [DataKey.elapsed]
    const ret = await this.runner<ProbUpOptions>(options, FnKey.probeUpload, keys)
    return ret
  }

  /**
   * 删除云对象，不支持删除 bucket 本身
   * 如果在 recusive 为 false 时删除目录，则目录参数值必须以 '/' 结尾，否则不会删除成功
   * @link https://help.aliyun.com/document_detail/120053.html
   */
  async rm(options: RmOptions): Promise<ProcessRet> {
    const keys = [DataKey.elapsed, DataKey.averageSpeed]
    const ret = await this.runner<RmOptions>(options, FnKey.rm, keys)
    return ret
  }

  /**
   * 递归删除，相当于 `rm -rf`
   * @link https://help.aliyun.com/document_detail/120053.html
   */
  async rmrf(options: RmrfOptions): Promise<ProcessRet> {
    const keys = [DataKey.elapsed, DataKey.averageSpeed]
    const ret = await this.runner<RmrfOptions>(options, FnKey.rmrf, keys)
    return ret
  }

  /**
   * sign（生成签名URL）
   * @link https://help.aliyun.com/document_detail/120064.html
   */
  async sign(options: SignOptions): Promise<ProcessRet<DataSign>> {
    const keys = [DataKey.elapsed, DataKey.httpUrl, DataKey.httpShareUrl]
    const ret = await this.runner<SignOptions, DataSign>(options, FnKey.sign, keys)

    if (ret.data?.httpUrl) {
      ret.data.link = options.disableEncodeSlash
        ? ret.data.httpUrl
        : decodeURIComponent(ret.data.httpUrl)
    }
    return ret
  }

  /**
   * 查看 Bucket 和 Object 信息
   * @link https://help.aliyun.com/document_detail/120054.html
   */
  async stat(options: StatOptions): Promise<ProcessRet<DataStat>> {
    const keys: DataKey[] = [DataKey.elapsed].concat(Array.from(regxStat.keys()))
    const ret = await this.runner<StatOptions, DataStat>(options, FnKey.stat, keys)
    return ret
  }

  /**
   * 同步 OSS 文件到本地
   * - force 参数默认 true
   * - 若 force 为 false，且目标文件存在时会卡在命令行提示输入阶段（无显示）最后导致超时异常
   * @link https://help.aliyun.com/document_detail/256352.html
   */
  async syncLocal(options: SyncOptions): Promise<ProcessRet<DataCp>> {
    const ret = await this.runner<SyncOptions, DataCp>(options, FnKey.syncLocal, cpKeys)
    return ret
  }

  /**
   * 同步本地文件到 OSS
   * - force 参数默认 true
   * - 若 force 为 false，且目标文件存在时会卡在命令行提示输入阶段（无显示）最后导致超时异常
   * @link https://help.aliyun.com/document_detail/193394.html
   */
  async syncRemote(options: SyncOptions): Promise<ProcessRet<DataCp>> {
    const ret = await this.runner<SyncOptions, DataCp>(options, FnKey.syncRemote, cpKeys)
    return ret
  }

  /**
   * 上传本地文件到 OSS
   * 若 force 为空或者 false，且目标文件存在时会卡在命令行提示输入阶段（无显示）最后导致超时异常
   * @link https://help.aliyun.com/document_detail/120057.html
   */
  async upload(options: UploadOptions): Promise<ProcessRet<DataCp>> {
    if (! options.force) {
      const statRet = await this.stat(options as StatOptions)
      if (! statRet.exitCode) {
        const ret: ProcessRet<DataCp> = {
          exitCode: 1,
          exitSignal: '',
          stdout: '',
          stderr: `${Msg.cloudFileAlreadyExists}: "${options.target}"`,
          data: void 0,
        }
        return ret
      }
    }

    const ret = await this.runner<UploadOptions, DataCp>(options, FnKey.upload, cpKeys)
    return ret
  }



  private async runner<T extends BaseOptions, R extends DataBase = DataBase>(
    options: T,
    fnKey: FnKey,
    retKeys: DataKey[],
  ): Promise<ProcessRet<R>> {

    assert(fnKey, 'fnKey is required')
    assert(retKeys, 'retKeys is required')
    assert(retKeys.length, 'retKeys must be an array')
    // @ts-ignore
    const cmdKey = CmdKey[fnKey] as CmdKey
    assert(cmdKey, 'cmdKey is required')

    const ps = await this.genCliParams(fnKey, options)
    const resp$ = run(`${this.cmd} ${cmdKey} ${ps.join(' ')} `)
    const res = await processResp(resp$, this.debug)

    const data = parseRespStdout<R>(res, retKeys, this.debug)
    const ret = combineProcessRet<R>(res, data)
    return ret
  }


  private async genCliParams<T extends BaseOptions>(
    fnKey: FnKey,
    options: T,
  ): Promise<string[]> {

    const func = processInputFnMap.get(fnKey)
    assert(typeof func === 'function', `${fnKey} is not a function`)

    const map = await func(options, this.config)
    assert(map)
    const ret = genParams(this.configPath, map)
    return ret
  }

}

