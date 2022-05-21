import { initBaseOptions, undefined } from './config.js'
import {
  BaseOptions,
  DataBase,
  DataKey,
} from './types.js'


export const initSignOptions: SignOptions = {
  ...initBaseOptions,
  disableEncodeSlash: false,
  timeoutSec: 60,
  trafficLimit: undefined,
  versionId: undefined,
}

export interface SignOptions extends BaseOptions {
  /**
   * 不对cloud_url中携带的正斜线（/）进行编码
   * @default false
   */
  disableEncodeSlash?: boolean

  /**
   * 签名 URL 过期时间，单位秒
   * @default 60
   */
  timeoutSec?: number

  /**
   * 限定HTTP的访问速度，单位为bit/s。缺省值为0，表示不受限制。
   * 取值范围为 245760~838860800
   */
  trafficLimit?: number

  /** Object 的指定版本ID。仅适用于已开启或暂停版本控制状态 Bucket下的 Object */
  versionId?: string
}

export interface DataSign extends DataBase {
  /** 不带有 token 认证信息的文件路径 */
  [DataKey.link]: string | undefined
  /** 不带有 token 认证信息的链接 */
  [DataKey.httpUrl]: string | undefined
  /** 带有 token 认证信息的链接 */
  [DataKey.httpShareUrl]: string | undefined
}
