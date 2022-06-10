import { DataKey, DownLinks } from './types.js'

// eslint-disable-next-line no-shadow-restricted-names
export const undefined = void 0

/**
 * @link https://help.aliyun.com/document_detail/120075.html
 */
export const configDownLinks: DownLinks = {
  darwin: 'https://gosspublic.alicdn.com/ossutil/1.7.12/ossutilmac64',
  linux: 'https://gosspublic.alicdn.com/ossutil/1.7.12/ossutil64',
  win32: 'https://gosspublic.alicdn.com/ossutil/1.7.12/ossutil64.zip',
}

export const cpKeys: DataKey[] = [
  DataKey.elapsed,
  DataKey.averageSpeed,
  DataKey.succeedTotalNumber,
  DataKey.succeedTotalSize,
  DataKey.uploadDirs,
  DataKey.uploadFiles,
  DataKey.copyObjects,
]
