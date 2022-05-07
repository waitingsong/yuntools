
export type ConfigPath = string

export interface Config {
  /**
   * @default CH
   */
  language?: 'CH' | 'EN'
  endpoint: string
  accessKeyID: string
  accessKeySecret: string
  stsToken?: string
}
