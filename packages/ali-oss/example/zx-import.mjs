#!/usr/bin/env zx
import assert from 'assert/strict'
import { OSSService } from '@yuntools/ali-oss'
import { OSSService as Omin } from '@yuntools/ali-oss/index.min.js'

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
const service2 = new Omin(CI ? config : void 0)

const dir = `${cloudUrlPrefix}/${Math.random().toString()}`
const res = await service.mkdir(dir)
console.log({ res })
assert(res, 'mkdir failed')
assert(res.data, 'mkdir failed')

const rmRes = await service2.rm(dir)
assert(rmRes, 'rm failed')
assert(rmRes.data, 'rm failed')
console.log({ rmRes })

const { OSSService: Oss3 } = await import('@yuntools/ali-oss')
const service3 = new Oss3(CI ? config : void 0)
const rmRes3 = await service3.rm(dir)
console.log({ rmRes3 })

