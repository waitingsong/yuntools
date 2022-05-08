import assert from 'assert/strict'
import { createHash } from 'crypto'
import { statSync, writeFileSync } from 'fs'
import { rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

// eslint-disable-next-line import/no-extraneous-dependencies
import { firstValueFrom, reduce } from 'rxjs'
import { run } from 'rxrunscript'

import { Config, ConfigPath } from './types'


/**
 * 阿里云 OSS 服务接口，
 * 基于命令行工具 ossutil 封装
 */
export class OSSService {

  debug = false
  configHash: string

  constructor(
    /** 配置参数或者配置文件路径 */
    protected readonly config: Config | ConfigPath,
  ) {

    this.validateConfig(config)
    if (typeof config !== 'string') {
      const { path, hash } = this.init(config)
      this.configHash = hash
      this.config = path
      this.validateConfig(this.config)
    }
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

  async mkdir(
    /**
     * 包含 bucket 和 object 的路径
     * @example oss://bucket/foo
     */
    dir: string,
    config?: Config | ConfigPath,
  ): Promise<void> {

    assert(typeof this.config === 'string')
    void config

    // const ps = this.genCliParams(config)
    const ps: string[] = []
    const resp = await firstValueFrom(run(`ossutil mkdir -c ${this.config} ${ps.join(' ')} ${dir}`))
    const txt = resp.toString('utf-8')
    this.debug && console.log({ txt })
  }

  async cp(
    src: string,
    dst: string,
    config?: Config | ConfigPath,
  ): Promise<void> {

    assert(src, 'src is required')
    assert(dst, 'dst is required')

    const ps = this.genCliParams(config)
    const resp = await firstValueFrom(run(`ossutil cp ${ps.join(' ')} ${src} ${dst}`))
    const txt = resp.toString('utf-8')
    this.debug && console.log({ txt })
  }

  async createSymlink(
    src: string,
    dst: string,
  ): Promise<void> {

    assert(src, 'src is required')
    assert(dst, 'dst is required')

    const ps = this.genCliParams()
    const resp = await firstValueFrom(run(`ossutil create-symlink ${ps.join(' ')} ${dst} ${src}`))
    const txt = resp.toString('utf-8')
    this.debug && console.log({ txt })
  }


  async rm(
    path: string,
  ): Promise<void> {

    assert(path, 'src is required')

    const ps = this.genCliParams()
    const resp = await firstValueFrom(run(`ossutil rm ${ps.join(' ')} ${path} `))
    const txt = resp.toString('utf-8')
    this.debug && console.log({ txt })
  }

  /**
   * 探测上传状态
   * @docs https://help.aliyun.com/document_detail/120061.html
   */
  async probeUpload(
    bucket: string,
  ): Promise<void> {

    assert(bucket, 'bucket is required')
    const ps = this.genCliParams()
    // const resp = await firstValueFrom(run(`ossutil probe ${ps.join(' ')} --upload --bucketname ${bucket}`))
    const stream$ = run(`ossutil probe ${ps.join(' ')} --upload --bucketname ${bucket}`)
    const resp$ = stream$.pipe(
      reduce((acc, curr) => {
        acc.push(curr.toString('utf-8'))
        return acc
      }, [] as string[]),
    )
    const buffers = await firstValueFrom(resp$)
    const txt = buffers.join('\n')
    this.debug && console.log({ txt })
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

  /**
   * 删除OSS配置文件
   */
  async destroy(): Promise<void> {
    const { config } = this
    if (config && typeof config === 'string') {
      await rm(config)
    }
  }

}

