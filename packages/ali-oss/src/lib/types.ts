
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
