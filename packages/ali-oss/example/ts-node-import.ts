#!/usr/bin/env ts-node-esm
import assert from 'node:assert/strict'

import { MkdirOptions, RmrfOptions } from '@yuntools/ali-oss'

import {
  cloudUrlPrefix,
  client,
  bucket,
} from './config.js'


const target = `${cloudUrlPrefix}/${Math.random().toString()}`
const opts: MkdirOptions = {
  bucket,
  target,
}
const res = await client.mkdir(opts)
assert(! res.exitCode)
assert(res.data, 'resp.data is invalid')
console.log({ res })

const opts2: RmrfOptions = {
  bucket,
  target,
}
await client.rmrf(opts2)

