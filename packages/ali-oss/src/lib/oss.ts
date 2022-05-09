import assert from 'assert/strict'
import { createHash } from 'crypto'
import { statSync, writeFileSync } from 'fs'
import { rm } from 'fs/promises'
import { tmpdir, homedir } from 'os'
import { join } from 'path'

// eslint-disable-next-line import/no-extraneous-dependencies
import { firstValueFrom, Observable, reduce, map } from 'rxjs'
import { ExitCodeSignal, run } from 'rxrunscript'

import { PickData } from './rule'
import {
  Config,
  ConfigPath,
  DataBase,
  ProcessRet,
} from './types'


/**
 * 阿里云 OSS 服务接口，
 * 基于命令行工具 ossutil 封装
 */
export class OSSService {

  debug = false
  configHash: string

  constructor(
    /**
     * 配置参数或者配置文件路径
     * @default ~/.ossutilconfig
     */
    protected readonly config: Config | ConfigPath = join(homedir(), '.ossutilconfig'),
    public cmd = 'ossutil',
  ) {

    this.validateConfig(config)
    if (typeof config !== 'string') {
      const { path, hash } = this.init(config)
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
    const resp = await this.processResp(resp$)
    const data = this.parseRespStdout(resp)
    const ret = this.genProcessRet(resp, data)
    return ret
  }

  private genProcessRet<T extends DataBase = DataBase>(stdout: string, data: T): ProcessRet<T> {
    const ret = {
      data,
      stdout,
    }
    return ret
  }

  async cp(
    src: string,
    dst: string,
  ): Promise<ProcessRet> {

    assert(src, 'src is required')
    assert(dst, 'dst is required')

    const ps = this.genCliParams()
    const resp$ = run(`${this.cmd} cp ${ps.join(' ')} ${src} ${dst}`)
    const resp = await this.processResp(resp$)
    const data = this.parseRespStdout(resp)
    const ret = this.genProcessRet(resp, data)
    return ret
  }

  async createSymlink(
    src: string,
    dst: string,
  ): Promise<ProcessRet> {

    assert(src, 'src is required')
    assert(dst, 'dst is required')

    const ps = this.genCliParams()
    const resp$ = run(`${this.cmd} create-symlink ${ps.join(' ')} ${dst} ${src}`)
    const resp = await this.processResp(resp$)
    const data = this.parseRespStdout(resp)
    const ret = this.genProcessRet(resp, data)
    return ret
  }


  async rm(
    path: string,
  ): Promise<ProcessRet> {

    assert(path, 'src is required')

    const ps = this.genCliParams()
    const resp$ = run(`${this.cmd} rm ${ps.join(' ')} ${path} `)
    const resp = await this.processResp(resp$)
    const data = this.parseRespStdout(resp)
    const ret = this.genProcessRet(resp, data)
    return ret
  }

  /**
   * 探测上传状态
   * @docs https://help.aliyun.com/document_detail/120061.html
   */
  async probeUpload(
    bucket: string,
  ): Promise<ProcessRet> {

    assert(bucket, 'bucket is required')
    const ps = this.genCliParams()
    // const resp = await firstValueFrom(run(`${this.cmd} probe ${ps.join(' ')} --upload --bucketname ${bucket}`))
    const resp$ = run(`${this.cmd} probe ${ps.join(' ')} --upload --bucketname ${bucket}`)
    const resp = await this.processResp(resp$)
    const data = this.parseRespStdout(resp)
    const ret = this.genProcessRet(resp, data)
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


  private async processResp(input$: Observable<Buffer | ExitCodeSignal>): Promise<string> {
    const buf$ = input$.pipe(
      reduce((acc, curr) => {
        if (Buffer.isBuffer(curr)) {
          this.debug && console.log({ processResp: curr.toString('utf-8') })
          acc.push(curr)
          return acc
        }
        else if (curr.exitCode !== 0) {
          const msg = `exitCode: ${curr.exitCode}, exitSignal: "${curr.exitSignal ?? ''}"\n${Buffer.concat(acc).toString('utf-8')}`
          throw new Error(msg)
        }
        return acc
      }, [] as Buffer[]),
      map(arr => Buffer.concat(arr)),
    )
    const resp = await firstValueFrom(buf$)
    const ret = resp.toString('utf-8').trim()
    return ret
  }

  private parseRespStdout<T extends DataBase = DataBase>(
    input: string,
    output?: T,
  ): T {

    const ret = output ?? {} as T
    const els = PickData.elapsed(input, this.debug)
    ret.elapsed = els

    return ret
  }


}

