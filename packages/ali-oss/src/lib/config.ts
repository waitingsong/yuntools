import { BaseOptions, MKey } from './types'

// eslint-disable-next-line no-shadow-restricted-names
export const undefined = void 0

export const initBaseOptions: BaseOptions = {
  [MKey.accessKeyId]: undefined,
  [MKey.accessKeySecret]: undefined,
  [MKey.connectTimeoutSec]: undefined,
  [MKey.readTimeoutSec]: undefined,
  [MKey.stsToken]: undefined,
  endpoint: undefined,
  loglevel: undefined,
}
