
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

export interface ProcessRet<T extends DataBase = DataBase> {
  readonly stdout: string
  readonly data: T
}

export enum DataKey {
  elapsed = 'elapsed',
  averageSpeed = 'averageSpeed',
  // total = 'total',
  // succeed = 'succeed',
  // removed = 'removed',
}

export interface DataBase {
  /**
   * @example 0.303190
   */
  [DataKey.elapsed]: string | undefined
}

export interface DataCp extends DataBase {
  /** byte/s */
  [DataKey.averageSpeed]: number | undefined
}

