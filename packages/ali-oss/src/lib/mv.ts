import { initBaseOptions } from './config.js'
import { BaseOptions } from './types.js'


export const initMvOptions: MvOptions = {
  ...initBaseOptions,
  force: false,
  recursive: false,
}


export interface MvOptions extends BaseOptions {
  /** 强制操作，不进行询问提示 */
  force?: boolean
  /** 递归操作。
   * 当指定该选项时，ossutil 会对 Bucket下所有符合条件的 Object 进行操作，
   * 否则只对指定的单个 Object 进行操作
   */
  recursive?: boolean
}
