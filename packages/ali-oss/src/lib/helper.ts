// eslint-disable-next-line import/no-extraneous-dependencies
import { firstValueFrom, Observable, reduce, map } from 'rxjs'
import { OutputRow } from 'rxrunscript'

import { pickFuncMap, pickRegxMap } from './rule.js'
import {
  BaseOptions,
  Config,
  DataBase,
  DataKey,
  MKey,
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
    if (! rule) {
      console.warn(`rule not found for ${key}`)
      return
    }

    const func = pickFuncMap.get(key)
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


export function genParams<T extends BaseOptions>(
  configPath: string,
  config: Config | undefined,
  options: T | undefined,
  initOptions?: T,
): string[] {

  const ps: string[] = configPath
    ? ['-c', configPath]
    : []

  const opts = new Map<string, unknown>();

  [config, initOptions, options].forEach((obj) => {
    obj && Object.entries(obj).forEach(([key, value]) => {
      let kk = key
      if (Object.hasOwn(MKey, key)) {
        // @ts-ignore
        const mkey = MKey[key] as unknown
        if (typeof mkey === 'string' && mkey) {
          kk = mkey
        }
      }

      if (['number', 'string'].includes(typeof value)) {
        opts.set(kk, value)
      }
      else if (value === true) {
        opts.set(kk, value)
      }
      // void else
    })
  })

  opts.forEach((value, key) => {
    switch (typeof value) {
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

      default:
        throw new TypeError(`unexpected typeof ${key}: ${typeof value}`)
    }

  })

  return ps
}

