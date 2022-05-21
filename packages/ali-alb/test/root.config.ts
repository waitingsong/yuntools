import assert from 'node:assert/strict'

import { EcsClient } from '@yuntools/ali-ecs'

import { AlbClient } from '../src/index.js'


const aid = process.env.ALI_ECS_AID
const secret = process.env.ALI_ECS_ASECRET
const endpointEcs = process.env.ALI_ECS_ENDPOINT ?? 'ecs-cn-hangzhou.aliyuncs.com'
const endpoint = process.env.ALI_ALB_ENDPOINT ?? 'alb.cn-hangzhou.aliyuncs.com'
export const groupId = process.env.ALI_ALB_GROUPID ?? ''
export const CI = process.env.CI

assert(aid, 'ALI_ECS_AID should be set')
assert(secret, 'ALI_ECS_ASECRET should be set')

export const ips = process.env.ALI_ALB_IPS?.split(',').map(ip => ip.trim()) ?? []
// export const serverIds = process.env.ALI_ECS_IDS?.split(',').map(id => id.trim()) ?? []

assert(ips.length > 0, 'ALI_ECS_IPS should be set')
// assert(ips?.length === serverIds?.length, 'ips.length !== serverIds.length')


export const ecsClient = new EcsClient(aid, secret, endpointEcs)
export const client = new AlbClient(aid, secret, endpoint, ecsClient)
export const clientWoEcs = new AlbClient(aid, secret, endpoint)

