// eslint-disable-next-line import/no-extraneous-dependencies
import https from 'https'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { stat, writeFile } from 'node:fs/promises'
import { homedir, platform, tmpdir } from 'node:os'
import { join } from 'node:path'

// eslint-disable-next-line import/no-extraneous-dependencies
import { firstValueFrom, Observable, reduce, map } from 'rxjs'
import { OutputRow, run } from 'rxrunscript'

import { pickFuncMap, pickRegxMap } from './rule.js'
import {
  BaseOptions,
  Config,
  ConfigPath,
  DataBase,
  DataKey,
  MKey,
  ParamMap,
  PlaceholderKey,
  ProcessResp,
  ProcessRet,
} from './types.js'


export async function processResp(
  input$: Observable<OutputRow>,
  debug = false,
): Promise<ProcessResp> {

  let exitCode
  let exitSignal

  const buf$ = input$.pipe(
    reduce((acc: Buffer[], curr: OutputRow) => {
      if (typeof curr.exitCode === 'undefined') {
        debug && console.log({ processResp: curr.data.toString('utf-8') })
        acc.push(curr.data)
      }
      else { // last value
        exitCode = curr.exitCode
        exitSignal = curr.exitSignal
      }
      return acc
    }, [] as Buffer[]),
    map(arr => Buffer.concat(arr)),
  )

  if (typeof exitCode === 'undefined') {
    exitCode = 0
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof exitSignal === 'undefined' || exitSignal === null) {
    exitSignal = ''
  }

  const res = await firstValueFrom(buf$)
  const content = res.toString('utf-8').trim()

  const ret: ProcessResp = {
    exitCode,
    exitSignal,
    stdout: exitCode === 0 ? content : '',
    stderr: exitCode === 0 ? '' : content,
  }
  return ret
}

export function parseRespStdout<T extends DataBase = DataBase>(
  input: ProcessResp,
  dataKeys: DataKey[] = [DataKey.elapsed],
  debug = false,
  output?: T,
): T | undefined {

  if (input.exitCode !== 0) {
    return void 0
  }

  const ret = output ?? {} as T

  const keys = [...new Set(dataKeys)]
  keys.forEach((key) => {
    const rule = pickRegxMap.get(key)

    /* c8 ignore next 4 */
    if (! rule) {
      console.warn(`rule not found for ${key}`)
      return
    }

    const func = pickFuncMap.get(key)
    /* c8 ignore next 4 */
    if (! func) {
      console.warn(`func not found for ${key}`)
      return
    }

    const value = func(input.stdout, rule, debug)
    Object.defineProperty(ret, key, {
      enumerable: true,
      value,
    })
  })

  return ret
}


export function combineProcessRet<T extends DataBase = DataBase>(
  resp: ProcessResp,
  data: T | undefined,
): ProcessRet<T> {

  const ret = {
    ...resp,
    data,
  }
  return ret
}

export function genParams(
  configPath: string,
  paramMap: ParamMap,
): string[] {

  const ps: string[] = configPath
    ? ['-c', configPath]
    : []

  if (! paramMap.size) {
    return ps
  }

  const pp = preGenParams(paramMap)
  pp.forEach((value, key) => {
    if (key === PlaceholderKey.src) {
      return
    }
    else if (key === PlaceholderKey.dest) {
      return
    }

    switch (typeof value) {
      /* c8 ignore next 2 */
      case 'undefined':
        return

      case 'boolean': {
        if (value === true) {
          ps.push(`--${key}`)
        }
        break
      }

      case 'number':
        ps.push(`--${key} ${value.toString()}`)
        break

      case 'string':
        ps.push(`--${key} ${value}`)
        break

      /* c8 ignore next 2 */
      default:
        throw new TypeError(`unexpected typeof ${key}: ${typeof value}`)
    }
  })

  const src = pp.get(PlaceholderKey.src)
  const dest = pp.get(PlaceholderKey.dest)
  if (src && typeof src === 'string') {
    ps.push(src)
  }
  if (dest && typeof dest === 'string') {
    ps.push(dest)
  }

  return ps
}

export function preGenParams(
  paramMap: ParamMap,
): ParamMap {

  paramMap.delete(PlaceholderKey.encodeSource)

  const encode = paramMap.get(PlaceholderKey.encodeTarget)
  paramMap.delete(PlaceholderKey.encodeTarget)
  if (encode) {
    paramMap.set(MKey.encodingType, 'url')
  }

  paramMap.delete(PlaceholderKey.bucket) // ensure bucket is not in the params
  paramMap.delete('src')
  paramMap.delete('dest')
  paramMap.delete('target')

  return paramMap
}


export function mergeParams<T extends BaseOptions>(
  inputOptions: T | undefined,
  initOptions: T | undefined,
  config: Config | undefined,
): Map<string, string | number | boolean> {

  const ret = new Map<string, string | number | boolean>()

  const ps1 = inputOptions ?? {} as T
  const ps2 = initOptions ?? {} as T
  const ps3 = config ?? {} as Config;

  [ps3, ps2, ps1].forEach((obj) => {
    Object.entries(obj).forEach(([key, value]) => {
      if (! Object.hasOwn(ps2, key) && ! Object.hasOwn(ps3, key)) {
        return
      }

      let kk = key
      // 参数名转换
      if (Object.hasOwn(MKey, key)) {
        // @ts-ignore
        const mkey = MKey[key] as unknown
        if (typeof mkey === 'string' && mkey) {
          kk = mkey
        }
      }

      const vv = value as unknown as string | number | boolean | undefined
      if (typeof vv === 'undefined') {
        return
      }

      if (typeof vv === 'number') {
        ret.set(kk, vv)
      }
      else if (typeof vv === 'string') {
        vv && ret.set(kk, vv)
      }
      else if (typeof vv === 'boolean') {
        ret.set(kk, vv)
      }
      // void else
    })
  })

  return ret
}


export async function writeConfigFile(
  config: Config,
  filePath?: string,
): Promise<{ path: ConfigPath, hash: string }> {

  const sha1 = createHash('sha1')
  const hash = sha1.update(JSON.stringify(config)).digest('hex')
  const path = filePath ?? join(tmpdir(), `${hash}.tmp`)
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

export async function validateConfigPath(config: ConfigPath): Promise<void> {
  assert(config, 'config file path is empty')
  const exists = (await stat(config)).isFile()
  assert(exists, `config file ${config} not exists`)
}

export async function downloadOssutil(
  srcLink: string,
  targetPath = join(homedir(), 'ossutil'),
): Promise<string> {

  assert(srcLink, 'srcLink is empty')

  const file = createWriteStream(targetPath)
  await new Promise<void>((done, reject) => {
    https.get(srcLink, (resp) => {
      resp.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log('Download Completed')
        done()
      })
    })
      .on('error', (err: Error) => {
        /* c8 ignore next */
        reject(err)
      })
  })

  if (platform() !== 'win32') {
    await setBinExecutable(targetPath)
  }

  return targetPath
}

export async function setBinExecutable(
  file: string,
): Promise<OutputRow> {

  const ret = await firstValueFrom(run(`chmod +x ${file}`))
  return ret
}

export function encodeInputPath(input: string, encode = false): string {
  const ret = encode === true ? encodeURIComponent(input).replace(/'/ug, '%27') : input
  return ret
}


export function commonProcessInputMap<T extends BaseOptions>(
  input: T & { src?: string, target?: string},
  initOptions: T & { src?: string, target?: string},
  globalConfig: Config | undefined,
): ParamMap {

  assert(input, 'input is required')

  const ret = mergeParams(input, initOptions, globalConfig)

  const encodeSrc = ret.get(PlaceholderKey.encodeSource) as boolean
  const encodeTarget = ret.get(PlaceholderKey.encodeTarget) as boolean

  const src = processInputAsEncodedCloudUrl(input.src, input.bucket, encodeSrc)
  const dest = processInputAsEncodedCloudUrl(input.target, input.bucket, encodeTarget)

  ret.set(PlaceholderKey.src, src)
  ret.set(PlaceholderKey.dest, dest)

  return ret
}

export function processInputAsEncodedCloudUrl(
  input: string | undefined,
  bucket: string | undefined,
  needEncode: boolean,
): string {

  if (! input) {
    return ''
  }

  assert(bucket, 'bucket is required')

  const ossPrefix = 'oss://'

  let ret = encodeInputPath(input, needEncode)
  if (needEncode && ret && ! ret.startsWith(ossPrefix)) {
    const str = ret.replace(/^\/+/ug, '')
    ret = `${ossPrefix}${bucket}/${str}`
  }
  return ret
}
