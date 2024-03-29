import assert from 'node:assert/strict'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { genCurrentDirname } from '@waiting/shared-core'

import {
  Config,
  OssClient,
  validateConfigPath,
  writeConfigFile,
} from '../src/index.js'


export const accessKeyId = process.env.ALI_OSS_AID ?? ''
export const accessKeySecret = process.env.ALI_OSS_ASECRET ?? ''
export const endpoint = process.env.ALI_OSS_ENDPOINT ?? ''
export const bucket = process.env.ALI_OSS_BUCKET ?? ''
export const CI = process.env.CI

assert(bucket, 'ALI_OSS_BUCKET is required')
export const cloudUrlPrefix = 'mobileFile/debug/' + Math.random().toString()

export const configPath = join(homedir(), '.ossutilconfig')

// eslint-disable-next-line import/no-mutable-exports
let client2: OssClient | undefined

export const config: Config = {
  accessKeyId,
  accessKeySecret,
  endpoint,
}
if (CI) {
  assert(endpoint, 'ALI_OSS_ENDPOINT is required')
  assert(accessKeyId, 'ALI_OSS_ID is required')
  assert(accessKeySecret, 'ALI_OSS_SECRET is required')
  const { path } = await writeConfigFile(config)
  assert(path, 'writeConfigFile failed')
  await validateConfigPath(path)
  client2 = new OssClient(path)
}
else {
  client2 = new OssClient(configPath)
}

export const client = CI ? new OssClient(config) : new OssClient(configPath)
export { client2 }

export const nameLT = '联通€-&a\'b^c=.json'
export const testDir = genCurrentDirname(import.meta.url)
export const src = join(testDir, 'tsconfig.json')
export const srcLT = join(testDir, 'files', nameLT)
export const srcDir = join(testDir, 'files')
export const files: string[] = [
  nameLT,
  '1.txt',
  '2.txt',
  '.nycrc.json',
  'tsconfig.json',
  'subdir/1.txt',
  'subdir/2.txt',
  'subdir/.nycrc.json',
  'subdir/tsconfig.json',
]
