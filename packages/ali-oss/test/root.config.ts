import assert from 'assert/strict'

import { Config, OSSService } from '~/index'


export const endpoint = process.env.ALI_OSS_ENDPOINT ?? ''
export const accessKeyId = process.env.ALI_OSS_ID ?? ''
export const accessKeySecret = process.env.ALI_OSS_SECRET ?? ''
export const bucket = process.env.ALI_OSS_BUCKET ?? ''

assert(endpoint, 'ALI_OSS_ENDPOINT is required')
assert(accessKeyId, 'ALI_OSS_ID is required')
assert(accessKeySecret, 'ALI_OSS_SECRET is required')
assert(bucket, 'ALI_OSS_BUCKET is required')

export const pathPrefix = `oss://${bucket}/mobileFile`

const config: Config = {
  // language: 'EN',
  endpoint,
  accessKeyId,
  accessKeySecret,
}
export const service = new OSSService(config)

