import assert from 'node:assert/strict'

import { EcsClient } from '../src/index.js'


const aid = process.env.ALI_ECS_AID
const secret = process.env.ALI_ECS_ASECRET
const endpoint = process.env.ALI_ECS_ENDPOINT ?? 'ecs-cn-hangzhou.aliyuncs.com'
export const CI = !! process.env['CI']

assert(aid, 'ALI_ECS_AID should be set')
assert(secret, 'ALI_ECS_ASECRET should be set')
assert(endpoint, 'ALI_ECS_ENDPOINT should be set')

export const ips = process.env.ALI_ECS_IPS?.split(',').map(ip => ip.trim()) ?? []
export const serverIds = process.env.ALI_ECS_IDS?.split(',').map(id => id.trim()) ?? []

assert(ips.length > 0, 'ALI_ECS_IPS should be set')
assert(ips?.length === serverIds?.length, 'ips.length !== serverIds.length')


export const client = new EcsClient(aid, secret, endpoint)

