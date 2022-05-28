#!/usr/bin/env zx
import assert from 'assert/strict'
import { OSSService, MkdirOptions } from '@yuntools/ali-oss'

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
const service = new OSSService(CI ? config : void 0)

const target = `${cloudUrlPrefix}/${Math.random().toString()}`
const opts: MkdirOptions = {
  bucket,
  target,
}
const res = await service.mkdir(opts)
console.log({ res })
assert(res, 'mkdir failed')
assert(res.data, 'mkdir failed')


const { OSSService: Oss3 } = await import('@yuntools/ali-oss')
const service3 = new Oss3(CI ? config : void 0)
const rmRes3 = await service3.rm(opts)
console.log({ rmRes3 })

