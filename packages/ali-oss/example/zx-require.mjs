#!/usr/bin/env zx
import assert from 'node:assert/strict'

const { OssClient, MkdirOptions } = require('@yuntools/ali-oss')

const endpoint = process.env.ALI_OSS_ENDPOINT ?? ''
const accessKeyId = process.env.ALI_OSS_ID ?? ''
const accessKeySecret = process.env.ALI_OSS_SECRET ?? ''
const bucket = process.env.ALI_OSS_BUCKET ?? ''
const cloudUrlPrefix = `oss://${bucket}/mobileFile/debug`
const CI = process.env.CI

const config = {
  endpoint,
  accessKeyId,
  accessKeySecret,
}
const service = new OssClient(CI ? config : void 0)

const target = `${cloudUrlPrefix}/${Math.random().toString()}`
const opts = {
  bucket,
  target,
}
const res = await service.mkdir(opts)
console.log({ res })
assert(! res.exitCode)
assert(res.data, 'mkdir failed')

const rmRes = await service.rmrf(opts)
assert(! rmRes.exitCode, 'rm failed')
assert(rmRes.data, 'rm failed')
console.log({ rmRes })

