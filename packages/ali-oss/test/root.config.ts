import assert from 'node:assert/strict'
import { homedir } from 'node:os'
import { join } from 'node:path'

import {
  Config,
  OssClient,
  validateConfigPath,
  writeConfigFile,
} from '../src/index.js'


export const endpoint = process.env.ALI_OSS_ENDPOINT ?? ''
export const accessKeyId = process.env.ALI_OSS_ID ?? ''
export const accessKeySecret = process.env.ALI_OSS_SECRET ?? ''
export const bucket = process.env.ALI_OSS_BUCKET ?? ''
export const CI = process.env.CI

assert(bucket, 'ALI_OSS_BUCKET is required')
export const cloudUrlPrefix = `oss://${bucket}/mobileFile/debug`

const configPath = join(homedir(), '.ossutilconfig')

// eslint-disable-next-line import/no-mutable-exports
let client2: OssClient | undefined
let config: Config | undefined = void 0
if (CI) {
  assert(endpoint, 'ALI_OSS_ENDPOINT is required')
  assert(accessKeyId, 'ALI_OSS_ID is required')
  assert(accessKeySecret, 'ALI_OSS_SECRET is required')
  config = {
    // language: 'EN',
    endpoint,
    accessKeyId,
    accessKeySecret,
  }
  const { path } = await writeConfigFile(config)
  assert(path, 'writeConfigFile failed')
  await validateConfigPath(path)
  client2 = new OssClient(path)
}

export const client = new OssClient(config)
export { client2 }

