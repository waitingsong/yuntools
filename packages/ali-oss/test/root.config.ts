import assert from 'assert/strict'


export const endpoint = process.env.ALI_OSS_ENDPOINT ?? ''
export const accessKeyID = process.env.ALI_OSS_ID ?? ''
export const accessKeySecret = process.env.ALI_OSS_SECRET ?? ''
export const bucket = process.env.ALI_OSS_BUCKET ?? ''

assert(endpoint, 'endpoint is required')
assert(accessKeyID, 'accessKeyID is required')
assert(accessKeySecret, 'accessKeySecret is required')
assert(bucket, 'bucket is required')

