import assert from 'assert/strict'
import { statSync } from 'fs'

import { firstValueFrom } from 'rxjs'
import { run } from 'rxrunscript'

import { Config, ConfigPath } from './types'


/**
 * 阿里云 OSS 服务接口，
 * 基于命令行工具 ossutil 封装
 */
export class OSSService {

  debug = false

  constructor(
    /** 配置参数或者配置文件路径 */
    protected readonly config: Config | ConfigPath,
  ) {
    this.validateConfig(config)
  }

  validateConfig(config: Config | ConfigPath): void {
    if (typeof config === 'string') {
      assert(config, 'config file path is empty')
      // assert(fs.pathExistsSync(config), `config file ${config} not exists`)
      const exists = statSync(config).isFile()
      assert(exists, `config file ${config} not exists`)
      return
    }

    const { language, endpoint, accessKeyID, accessKeySecret } = config

    if (typeof language !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      assert(language === 'CH' || language === 'EN', 'language must be CH or EN')
    }
    assert(endpoint, 'endpoint is required')
    assert(accessKeyID, 'accessKeyID is required')
    assert(accessKeySecret, 'accessKeySecret is required')
  }

  genCliParams(config?: Config | ConfigPath): string[] {
    const conf = config ?? this.config
    this.validateConfig(conf)

    if (typeof conf === 'string') {
      return ['-c', conf]
    }

    const { language, endpoint, accessKeyID, accessKeySecret, stsToken } = conf
    const ps: string[] = []

    language && ps.push('-L', language)
    accessKeyID && ps.push('-i', accessKeyID)
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

    const ps = this.genCliParams(config)
    const resp = await firstValueFrom(run(`ossutil mkdir  ${ps.join(' ')} ${dir}`))
    const txt = resp.toString('utf-8')
    this.debug && console.log({ resp, txt })
  }

  async cp(
    src: string,
    dst: string,
    config?: Config | ConfigPath,
  ): Promise<void> {

    const ps = this.genCliParams(config)
    const resp = await firstValueFrom(run(`ossutil cp ${ps.join(' ')} ${src} ${dst}`))
    const txt = resp.toString('utf-8')
    this.debug && console.log({ resp, txt })
  }

  // private async genconfigFile(config: Config): Promise<ConfigPath> {
  //   this.validateConfig(config)
  //   const { language, endpoint, accessKeyID, accessKeySecret, stsToken } = config
  //   const path = join(tmpdir(), Math.random().toString() + 'oss.conf')
  //   const ps = [
  //     '-c', path,

  //   ]
  //   await quiet($`ossutil config `)
  // }

}

