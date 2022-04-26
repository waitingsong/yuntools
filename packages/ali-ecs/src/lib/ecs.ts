import assert from 'assert/strict'

import Ecs, {
  DescribeInstancesRequest,
  DescribeInstancesResponseBodyInstancesInstance,
} from '@alicloud/ecs20140526'
import { Config as ApiConfig } from '@alicloud/openapi-client'

import { _Client } from './client'
import { Action } from './types'


/** 阿里云 ECS 服务接口 */
export class ECSService {

  client: Ecs
  debug = false
  nextToken = ''
  /** ip -> instanceId */
  nodeIp2IdCache = new Map<string, string>()
  instancesCache: DescribeInstancesResponseBodyInstancesInstance[] = []

  constructor(
    protected id: string,
    protected key: string,
    public endpoint = 'ecs-cn-hangzhou.aliyuncs.com',
  ) {
    this.client = this.createClient(id, key)
  }

  /** 根据公网 IP 获取 Ecs 实例 ID */
  async getInstanceIdByIp(ip: string): Promise<string | undefined> {
    assert(ip, 'ip is required')
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

  /** 根据公网 IP 获取 Ecs 实例信息 */
  async getInstanceByIp(
    ip: string,
    regionId = 'cn-hangzhou',
  ): Promise<DescribeInstancesResponseBodyInstancesInstance | undefined> {

    const node = this._getInstanceByIp(ip, this.instancesCache)
    if (node) {
      return node
    }

    const opts = {
      action: Action.DescribeInstances,
      nextToken: this.nextToken,
      regionId,
      publicIpAddresses: [ip],
      eipAddresses: [ip],
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
    this.instancesCache = insts
    this.debug && console.info({ insts })

    for (const inst of insts) {
      const ips = inst.publicIpAddress?.ipAddress
      if (ips?.includes(ip)) {
        return inst
      }
    }
  }


  private _getInstanceByIp(
    ip: string,
    instances: DescribeInstancesResponseBodyInstancesInstance[],
  ): DescribeInstancesResponseBodyInstancesInstance | undefined {

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


