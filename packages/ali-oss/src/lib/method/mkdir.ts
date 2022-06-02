import { BaseOptions, Config, ParamMap } from '../types.js'

import { initBaseOptions, processInputWoSrc } from './common.js'


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

  const map = await processInputWoSrc(input, initOptions, globalConfig)
  return map
}


