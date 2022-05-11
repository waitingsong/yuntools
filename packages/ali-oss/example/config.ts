import assert from 'assert/strict'

import { Config, OSSService } from '@yuntools/ali-oss'


export const endpoint = process.env.ALI_OSS_ENDPOINT ?? ''
export const accessKeyId = process.env.ALI_OSS_ID ?? ''
export const accessKeySecret = process.env.ALI_OSS_SECRET ?? ''
export const bucket = process.env.ALI_OSS_BUCKET ?? ''
export const CI = process.env.CI

assert(bucket, 'ALI_OSS_BUCKET is required')
export const cloudUrlPrefix = `oss://${bucket}/mobileFile/debug`

let config: Config | undefined
if (CI) {
  assert(endpoint, 'ALI_OSS_ENDPOINT is required')
  assert(accessKeyId, 'ALI_OSS_ID is required')
  assert(accessKeySecret, 'ALI_OSS_SECRET is required')
  config = {
    endpoint,
    accessKeyId,
    accessKeySecret,
  }
}
// void else: using `~/.ossutilconfig`

export const service = new OSSService(config)

