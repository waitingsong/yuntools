// eslint-disable-next-line import/no-extraneous-dependencies
import { firstValueFrom, Observable, reduce, map } from 'rxjs'
import { ExitCodeSignal } from 'rxrunscript'

import { pickFuncMap, pickRegxMap } from './rule'
import {
  BaseOptions,
  DataBase,
  DataKey,
  ProcessRet,
} from './types'


export async function processResp(
  input$: Observable<Buffer | ExitCodeSignal>,
  debug = false,
): Promise<string> {

  const buf$ = input$.pipe(
    reduce((acc, curr) => {
      if (Buffer.isBuffer(curr)) {
        debug && console.log({ processResp: curr.toString('utf-8') })
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

export function parseRespStdout<T extends DataBase = DataBase>(
  input: string,
  dataKeys: DataKey[] = [DataKey.elapsed],
  debug = false,
  output?: T,
): T {

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

    const value = func(input, rule, debug)
    Object.defineProperty(ret, key, {
      enumerable: true,
      value,
    })
  })

  return ret
}


export function combineProcessRet<T extends DataBase = DataBase>(stdout: string, data: T): ProcessRet <T> {
  const ret = {
    data,
    stdout,
  }
  return ret
}


export function genParams<T extends BaseOptions>(
  config: string,
  options?: T,
): string[] {

  const ps: string[] = ['-c', config]

  if (typeof options === 'undefined') {
    return ps
  }

  Object.entries(options).forEach(([key, value]) => {
    if (typeof value === 'undefined') {
      return
    }
    else if (typeof value === 'boolean') {
      if (value === true) {
        ps.push(`--${key}`)
      }
    }
    else {
      ps.push(`--${key} ${value.toString()}`)
    }
  })

  return ps
}
