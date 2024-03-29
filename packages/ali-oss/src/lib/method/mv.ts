import { BaseOptions } from '../types.js'

import { initBaseOptions } from './common.js'


export interface MvOptions extends BaseOptions {
  /** cloudurl 源路径，不包括 bucket */
  src: string
  /** cloudurl 目的路径，不包括 bucket */
  target: string
  /** 强制操作，不进行询问提示 */
  force?: boolean | undefined
  /** 递归操作。
   * 当指定该选项时，ossutil 会对 Bucket下所有符合条件的 Object 进行操作，
   * 否则只对指定的单个 Object 进行操作
   */
  recursive?: boolean | undefined
}

export const initOptions: MvOptions = {
  ...initBaseOptions,
  force: false,
  recursive: false,
  target: '',
  src: '',
}
