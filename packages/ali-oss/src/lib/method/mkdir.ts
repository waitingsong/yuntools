import assert from 'node:assert'

import { commonProcessInputMap } from '../helper.js'
import {
  BaseOptions,
  Config,
  ParamMap,
  PlaceholderKey,
} from '../types.js'

import { initBaseOptions } from './common.js'


/**
 * @link https://help.aliyun.com/document_detail/120057.html
 */
export interface MkdirOptions extends BaseOptions {
  target: string
}

export const initOptions: MkdirOptions = {
  ...initBaseOptions,
  target: '',
}

export async function processInput(
  input: MkdirOptions,
  globalConfig: Config | undefined,
): Promise<ParamMap> {

  const map = commonProcessInputMap(input, initOptions, globalConfig)
  assert(map.get(PlaceholderKey.dest), 'dest is required')

  return map
}

