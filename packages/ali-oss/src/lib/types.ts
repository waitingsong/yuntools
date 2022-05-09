
export type ConfigPath = string

export interface Config {
  /**
   * @default CH
   */
  language?: 'CH' | 'EN'
  endpoint: string
  accessKeyId: string
  accessKeySecret: string
  stsToken?: string
}

export interface ProcessRet<T extends RespDataBase = RespDataBase> {
  readonly stdout: string
  readonly data: T
}

export enum RespDataKey {
  elapsed = 'elapsed',
  averageSpeed = 'averageSpeed',
  total = 'total',
  succeed = 'succeed',
  removed = 'removed',
}

export interface RespDataBase {
  /**
   * @example 0.303190
   */
  elapsed: string | undefined
}
