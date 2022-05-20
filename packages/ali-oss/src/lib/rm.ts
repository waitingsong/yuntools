import { undefined } from './config'
import { initMvOptions, MvOptions } from './mv'
import { MKey } from './types'


export const initRmOptions: RmOptions = {
  ...initMvOptions,
  [MKey.allVersions]: undefined,
  [MKey.encodingType]: undefined,
  [MKey.versionId]: undefined,
  bucket: undefined,
  exclude: undefined,
  include: undefined,
  multipart: undefined,
}


/**
 * @link https://help.aliyun.com/document_detail/120053.html
 */
export interface RmOptions extends MvOptions {
  /**
   * Object 的所有版本。
   * 仅适用于已开启或暂停版本控制状态 Bucket 下的 Object，
   * 且同一个删除示例中仅允许选择--version-id或--all-versions其中一个选项
   */
  [MKey.allVersions]?: boolean

  /**
   * 对 `oss://bucket_name` 之后的 prefix 进行编码，取值为url
   * 如果不指定该选项，则表示 prefix 未经过编码
   */
  [MKey.encodingType]?: string

  /** Object 的指定版本。仅适用于已开启或暂停版本控制状态 Bucket下的 Object */
  [MKey.versionId]?: string

  /** 仅在删除 Bucket 时使用此选项 */
  bucket?: string

  /** 不包含任何符合指定条件的 Object */
  exclude?: string

  /** 包含符合指定条件的所有 Object */
  include?: string

  /** 指定操作的对象为 Bucket 中未完成的 Multipart 事件 */
  multipart?: boolean
}
