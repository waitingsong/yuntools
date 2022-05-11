#!/usr/bin/env ts-node-esm
import assert from 'assert/strict'

import {
  cloudUrlPrefix,
  service,
} from './config.js'


const dir = `${cloudUrlPrefix}/${Math.random().toString()}`
console.log(dir)

const res = await service.mkdir(dir)
assert(res)
assert(res, 'resp is invalid')
assert(res.data, 'resp.data is invalid')
console.log({ res })

await service.rm(dir)

