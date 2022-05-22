import { BaseOptions, DownLinks } from './types.js'

// eslint-disable-next-line no-shadow-restricted-names
export const undefined = void 0

export const initBaseOptions: BaseOptions = {
  accessKeyId: undefined,
  accessKeySecret: undefined,
  connectTimeoutSec: undefined,
  readTimeoutSec: undefined,
  stsToken: undefined,
  endpoint: undefined,
  loglevel: undefined,
}


/**
 * @link https://help.aliyun.com/document_detail/120075.html
 */
export const configDownLinks: DownLinks = {
  darwin: 'https://gosspublic.alicdn.com/ossutil/1.7.12/ossutilmac64',
  linux: 'https://gosspublic.alicdn.com/ossutil/1.7.12/ossutil64',
  win32: 'https://gosspublic.alicdn.com/ossutil/1.7.12/ossutil64.zip',
}

