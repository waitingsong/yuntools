import assert from 'assert'

import Ecs, { DescribeInstancesRequest } from '@alicloud/ecs20140526'
import { Config as ApiConfig } from '@alicloud/openapi-client'

import { _Client } from './client'
import {
  Action,
  EcsStatusKey,
  EcsNodeDetail,
  EcsNodeStatus,
  EcsNodeInfo,
  EcsInfoKey,
} from './types'


/**
 * 阿里云 ECS 服务接口
 * 最多支持 100 个实例
 */
export class ECSService {

  client: Ecs
  debug = false
  nextToken = ''
  /** ip -> instanceId */
  nodeIp2IdCache = new Map<string, string>()
  instancesCache: EcsNodeDetail[] = []
  cacheTime: number
  cacheTTLSec: 30

  constructor(
    protected id: string,
    protected key: string,
    public endpoint = 'ecs-cn-hangzhou.aliyuncs.com',
  ) {
    this.client = this.createClient(id, key)
  }


  /** 根据公网 IP 数组获取 Ecs 实例状态信息 */
  async getNodeStatusByIps(
    ips: string[],
    regionId = 'cn-hangzhou',
  ): Promise<Map<string, EcsNodeStatus>> {

    const ret = new Map<string, EcsNodeStatus>()
    const nodes = await this.getInstancesByIps(ips, regionId)
    nodes.forEach((row, ip) => {
      if (typeof row === 'undefined') { return }
      const info = {} as EcsNodeStatus
      Object.values(EcsStatusKey).forEach((key) => {
        const val = row[key]
        if (typeof val === 'undefined') {
          return
        }
        // @ts-expect-error
        info[key] = val
      })
      if (! Object.keys(info).length) {
        return
      }

      ret.set(ip, info)
    })

    return ret
  }

  /** 根据公网 IP 数组获取 Ecs 实例信息 */
  async getNodeInfoByIps(
    ips: string[],
    regionId = 'cn-hangzhou',
  ): Promise<Map<string, EcsNodeInfo>> {

    const ret = new Map<string, EcsNodeInfo>()
    const nodes = await this.getInstancesByIps(ips, regionId)
    nodes.forEach((row, ip) => {
      if (typeof row === 'undefined') { return }
      const info = {} as EcsNodeInfo
      Object.values(EcsInfoKey).forEach((key) => {
        const val = row[key]
        if (typeof val === 'undefined') {
          return
        }
        // @ts-expect-error
        info[key] = val
      })
      if (! Object.keys(info).length) {
        return
      }

      ret.set(ip, info)
    })

    return ret
  }


  /** 根据公网 IP 获取 Ecs 实例 ID */
  async getInstanceIdByIp(ip: string): Promise<string | undefined> {
    assert(ip, 'ip is required')

    this.cleanCache()

    const nodeId = this.nodeIp2IdCache.get(ip)
    if (nodeId) {
      this.debug && console.info(`getInstanceIdByIp from cache: ${ip} -> ${nodeId}`)
      return nodeId
    }

    const inst = await this.getInstanceByIp(ip)
    const id = inst?.instanceId
    if (id?.length) {
      this.nodeIp2IdCache.set(ip, id)
      return id
    }
  }

  /** 根据公网 IP 数组获取 Ecs 实例信息 */
  async getInstancesByIps(
    ips: string[],
    regionId = 'cn-hangzhou',
  ): Promise<Map<string, EcsNodeDetail>> {

    assert(Array.isArray(ips), 'ips must be an array')

    this.cleanCache()

    const ret = new Map<string, EcsNodeDetail>()
    for await (const ip of ips) {
      if (! ip || typeof ip !== 'string') {
        continue
      }
      const inst = await this.getInstanceByIp(ip, regionId)
      if (! inst) {
        continue
      }
      ret.set(ip, inst)
    }
    return ret
  }


  /** 根据公网 IP 获取 Ecs 实例信息 */
  async getInstanceByIp(
    ip: string,
    regionId = 'cn-hangzhou',
  ): Promise<EcsNodeDetail | undefined> {

    assert(typeof ip === 'string', 'ip must be a string')

    this.cleanCache()
    const node = this._getInstanceByIpFromCache(ip)
    if (node) {
      this.debug && console.log(`getInstanceByIp from cache: ${ip}`)
      return node
    }

    const opts = {
      action: Action.DescribeInstances,
      nextToken: this.nextToken,
      regionId,
      publicIpAddresses: [ip],
      eipAddresses: [ip],
      // pageNumber: 0,
      pageSize: 100,
      totalCount: 100,
    }

    const req = new DescribeInstancesRequest(opts)
    this.debug && console.info({ req })

    const resp = await this.client.describeInstances(req)
    if (resp.body.nextToken) {
      this.nextToken = resp.body.nextToken
    }

    const insts = resp.body.instances?.instance
    if (! insts) {
      return
    }
    this.debug && console.log(`${ip} found ${insts.length}`)
    this.updateInstancedCache(insts)
    this.debug && console.info({ insts })

    for (const inst of insts) {
      const ips = inst.publicIpAddress?.ipAddress
      if (ips?.includes(ip)) {
        return inst
      }
    }
  }


  cleanCache(): void {
    const now = Date.now()
    if (this.cacheTime && (now - this.cacheTime > this.cacheTTLSec * 1000)) {
      console.log('cache expired')
      this.nodeIp2IdCache.clear()
      this.instancesCache = []
      this.cacheTime = 0
    }
  }

  updateInstancedCache(instances: EcsNodeDetail[]): void {
    this.instancesCache = instances
    this.cacheTime = Date.now()
  }

  private _getInstanceByIpFromCache(
    ip: string,
  ): EcsNodeDetail | undefined {

    if (! ip.length) {
      console.warn('_getInstanceByIpFromCache: ip is empty')
      return
    }

    const instances = this.instancesCache
    if (! instances.length) {
      return
    }

    for (const inst of instances) {
      const ips = inst.publicIpAddress?.ipAddress
      if (ips?.includes(ip)) {
        return inst
      }
    }
  }

  private createClient(accessKeyId: string, accessKeySecret: string): Ecs {
    const config = new ApiConfig({ accessKeyId, accessKeySecret })
    config.endpoint = this.endpoint
    const client = new _Client(config)
    this.debug && console.info({ client })
    return client
  }

}

