import { initBaseOptions, undefined } from './config.js'
import { BaseOptions } from './types.js'


export const initMkdirOptions: MkdirOptions = {
  ...initBaseOptions,
  encodingType: undefined,
}

/**
 * @link https://help.aliyun.com/document_detail/120057.html
 */
export interface MkdirOptions extends BaseOptions {
  /**
   * 对 `oss://bucket_name` 后面的key（目录名称）进行编码，取值为url。
   * 如果不指定该选项，则表示目录名称未经过编码
   */
  encodingType?: 'url'
}

