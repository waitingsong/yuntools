import assert from 'node:assert'

import { commonProcessInputMap } from '../helper.js'
import { Config, ParamMap, PlaceholderKey } from '../types.js'

import { initOptions as rmOptions, RmOptions } from './rm.js'


/**
 * @link https://help.aliyun.com/document_detail/120053.html
 */
export interface RmrfOptions extends Omit<RmOptions, 'recursive'> {
  /** cloudurl 目的路径，不包括 bucket */
  target: string
}

export const initOptions: RmrfOptions = {
  ...rmOptions,
  target: '',
}

export async function processInput(
  input: RmrfOptions,
  globalConfig: Config | undefined,
): Promise<ParamMap> {

  const map = commonProcessInputMap(input, initOptions, globalConfig)
  assert(map.get(PlaceholderKey.dest), 'dest is required')
  map.delete(PlaceholderKey.src)

  map.set('force', true)
  map.set('recursive', true)

  return map
}

