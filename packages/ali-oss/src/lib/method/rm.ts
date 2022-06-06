import { undefined } from '../config.js'
import { Config, ParamMap } from '../types.js'

import { processInputWoSrc } from './common.js'
import { initOptions as mvOptions, MvOptions } from './mv.js'


/**
 * @link https://help.aliyun.com/document_detail/120053.html
 */
export interface RmOptions extends Omit<MvOptions, 'force' | 'src'> {
  /** cloudurl 目的路径，不包括 bucket */
  target: string

  /**
   * Object 的所有版本。
   * 仅适用于已开启或暂停版本控制状态 Bucket 下的 Object，
   * 且同一个删除示例中仅允许选择--version-id或--all-versions其中一个选项
   */
  allVersions?: boolean

  /** Object 的指定版本。仅适用于已开启或暂停版本控制状态 Bucket下的 Object */
  versionId?: string

  /** 仅在删除 Bucket 时使用此选项 */
  // bucket?: string

  /** 不包含任何符合指定条件的 Object */
  exclude?: string

  /** 包含符合指定条件的所有 Object */
  include?: string

  /** 指定操作的对象为 Bucket 中未完成的 Multipart 事件 */
  multipart?: boolean
}

export const initOptions: RmOptions = {
  ...mvOptions,
  target: '',

  allVersions: undefined,
  versionId: undefined,
  exclude: undefined,
  include: undefined,
  multipart: undefined,
}

export async function processInput(
  input: RmOptions,
  globalConfig: Config | undefined,
): Promise<ParamMap> {

  const map = await processInputWoSrc(input, initOptions, globalConfig)
  map.set('force', true)

  return map
}
