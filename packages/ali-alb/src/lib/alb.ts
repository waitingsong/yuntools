import assert from 'assert/strict'

import Alb, {
  ListAsynJobsRequest,
  UpdateServerGroupServersAttributeResponseBody,
  ListServerGroupsRequest,
  ListServerGroupsResponseBodyServerGroups,
  ListServerGroupServersRequest,
  UpdateServerGroupServersAttributeRequest,
  ListAsynJobsResponseBodyJobs,
} from '@alicloud/alb20200616'
import { Config as ApiConfig } from '@alicloud/openapi-client'
import { EcsClient } from '@yuntools/ali-ecs'
import {
  firstValueFrom,
  timer,
  takeWhile,
  map,
  mergeMap,
  skipWhile,
  take,
} from 'rxjs'

import { _Client } from './client'
import {
  Action,
  ActionRet,
  CalcuWeightOptions,
  GroupServer,
  JobId,
  JobStatus,
  ServerGroupId,
  UpdateServerWeightOptions,
  UpdateServerWeightOptionsInner,
} from './types'


/** 阿里云 ALB 负载均衡服务接口 */
export class AlbClient {

  /**
   * 是否输出日志
   * @default false
   */
  debug = false

  /**
   * 是否输出渐进日志
   * @default true
   */
  showProgressLog = true

  client: Alb
  nextToken = ''
  ecsService: EcsClient
  groupServersCache = new Map<ServerGroupId, GroupServer[]>()
  cacheTime: number
  cacheTTLSec: 5

  constructor(
    protected id: string,
    protected secret: string,
    public endpoint = 'alb.cn-hangzhou.aliyuncs.com',
    public ecsServiceInstance?: EcsClient,
  ) {

    this.client = this.createClient(id, secret)
    if (ecsServiceInstance) {
      this.ecsService = ecsServiceInstance
    }
    else {
      this.ecsService = new EcsClient(id, secret)
    }
  }

  /**
   * 获取指定服务组信息
   */
  async getGroup(serverGroupId: string): Promise<ListServerGroupsResponseBodyServerGroups | undefined> {
    const opts = {
      action: Action.ListServerGroups,
      nextToken: this.nextToken,
      serverGroupIds: [serverGroupId],
    }
    const req = new ListServerGroupsRequest(opts)
    this.debug && console.info({ req })

    const resp = await this.client.listServerGroups(req)
    if (resp.body.nextToken) {
      this.nextToken = resp.body.nextToken
    }

    const ret = resp.body.serverGroups?.[0]
    this.debug && console.info({ resp, ret })
    return ret
  }

  /**
   * 获取指定服务组指定服务器信息
   */
  async getGroupServer(
    serverGroupId: string,
    serverId: string,
  ): Promise<GroupServer | undefined> {

    assert(serverId, 'serverId is required')

    const servers = await this.listGroupServers(serverGroupId)
    if (servers) {
      return servers.find(server => server.serverId === serverId.trim())
    }
  }

  /**
   * 根据公网 IPs 获取指定服务组指定服务器信息
   */
  async getGroupServerByPublicIps(
    serverGroupId: string,
    ips: string[],
  ): Promise<Map<string, GroupServer>> {

    const ret = new Map<string, GroupServer>()
    for await (const ip of ips) {
      const server = await this.getGroupServerByPublicIp(serverGroupId, ip)
      if (server) {
        ret.set(ip, server)
      }
    }
    return ret
  }

  /**
   * 根据公网 IP 获取指定服务组指定服务器信息
   */
  async getGroupServerByPublicIp(
    serverGroupId: string,
    ip: string,
  ): Promise<GroupServer | undefined> {

    const ecsId = await this.ecsService.getInstanceIdByIp(ip)
    if (! ecsId) {
      console.error(`getGroupServerByPublicIp: ECS 服务器 ${ip} 未找到`)
      return
    }
    const id = ecsId.trim()
    const servers = await this.listGroupServers(serverGroupId)
    if (servers) {
      return servers.find((server) => {
        const flag = server.serverId?.trim() === id && id.length > 0
        return flag
      })
    }
    else {
      console.error(`getGroupServerByPublicIp: 服务器组 ${serverGroupId} 未找到`)
    }
  }

  /**
   * 列出指定服务器组的服务器列表信息
   */
  async listGroupServers(serverGroupId: string): Promise<GroupServer[] | undefined> {
    this.cleanCache()
    const cache = this.groupServersCache.get(serverGroupId)
    if (cache) {
      return cache
    }
    const opts = {
      Action: Action.ListServerGroupServers,
      NextToken: this.nextToken,
      serverGroupId,
      maxResults: 100,
    }

    const req = new ListServerGroupServersRequest(opts)
    this.debug && console.info({ req })

    const resp = await this.client.listServerGroupServers(req)
    if (resp.body.nextToken) {
      this.nextToken = resp.body.nextToken
    }

    const ret = resp.body.servers
    this.debug && console.info({ resp, ret })
    this.updateCache(serverGroupId, ret)
    return ret
  }

  /**
   * 获取异步任务信息
   */
  async getJobInfo(jobId: string): Promise<ListAsynJobsResponseBodyJobs | undefined> {
    const opts = {
      Action: Action.GetAsyncJobResult,
      NextToken: this.nextToken,
      jobIds: [jobId],
      maxResults: 10,
    }

    const req = new ListAsynJobsRequest(opts)
    this.debug && console.info({ req })

    const resp = await this.client.listAsynJobs(req)
    if (resp.body.nextToken) {
      this.nextToken = resp.body.nextToken
    }

    const ret = resp.body.jobs ? resp.body.jobs[0] : void 0
    this.debug && console.info({ resp, ret })
    return ret

  }


  /**
   * 渐进更新指定服务器的权重到指定值，
   * 直到异步任务状态为 Succeeded 或 Failed,
   * 并返回异步任务信息和服务器信息
   */
  async updateServerWeightByPublicIp(options: UpdateServerWeightOptions): Promise<ActionRet | undefined> {
    const { ip: publicIp } = options
    assert(publicIp, 'publicIp is required')

    const ecsId = await this.ecsService.getInstanceIdByIp(publicIp)

    if (! ecsId) {
      throw new Error(`no ecs found by ip ${publicIp}`)
    }
    const opts = {
      ...options,
      ecsId,
    }
    this.debug && console.info({ ecsId })
    const ret = await this.updateServerWeight(opts)
    return ret
  }


  /**
   * 渐进更新指定服务器的权重到指定值，
   * 直到异步任务状态为 Succeeded 或 Failed,
   * 并返回异步任务信息和服务器信息
   */
  async updateServerWeight(options: UpdateServerWeightOptions): Promise<ActionRet | undefined> {
    const { ecsId, serverGroupId } = options
    assert(ecsId, 'ecsId is required')

    if (typeof options.currentWeight === 'undefined') {
      this.cleanCache(true)
      const server = await this.getGroupServer(serverGroupId, ecsId)
      if (! server) {
        throw new Error(`No server found by ecsId ${ecsId} and serverGroupId ${serverGroupId}`)
      }

      if (typeof server.weight === 'number') {
        options.currentWeight = server.weight
      }
      else {
        console.warn('updateServerWeight:', { serverGroupId, server })
        throw new Error(`No weight found by ecsId ${ecsId} and serverGroupId ${serverGroupId}`)
      }
    }

    const jobId = await this.loopServerUntilWeight(options as UpdateServerWeightOptionsInner)
    const jobInfo = jobId ? await this.getJobInfo(jobId) : void 0
    this.cleanCache(true)
    const groupServer = await this.getGroupServer(serverGroupId, ecsId)
    const ret = {
      jobInfo,
      groupServer,
    }
    return ret
  }


  /**
   * 设置服务器组的权重属性
   */
  async setServersWeight(
    serverGroupId: string,
    serverIds: string[],
    weight: number,
  ): Promise<UpdateServerGroupServersAttributeResponseBody> {

    if (weight < 0) {
      throw new TypeError(`weight must be >= 0, but got ${weight}`)
    }
    let value = +weight
    if (Number.isNaN(value)) {
      throw new TypeError(`weight must be a number, but got ${weight}`)
    }
    if (value > 100) {
      value = 100
    }
    else {
      value = Math.round(value)
    }

    const servers: unknown[] = []
    const rows = await this.listGroupServers(serverGroupId)
    rows?.forEach((row) => {
      if (row.serverId && serverIds.includes(row.serverId)) {
        row.weight = value
        servers.push(row)
      }
    })
    this.debug && console.info({ servers })

    if (servers.length === 0) {
      throw new Error(`no server found in group ${serverGroupId}`)
    }

    const opts = {
      Action: Action.UpdateServerGroupServersAttribute,
      NextToken: this.nextToken,
      ServerGroupId: serverGroupId,
      servers,
    }
    const req = new UpdateServerGroupServersAttributeRequest(opts)
    req.serverGroupId = serverGroupId
    this.debug && console.info({ req })

    const resp = await this.client.updateServerGroupServersAttribute(req)
    const ret = resp.body
    this.debug && console.info({ resp, ret })
    return ret
  }


  /**
   * 查询指定任务的状态是否匹配输入的状态值
   */
  async isJobMatchStatusList<T extends JobStatus>(jobId: string, statusArray: T[]): Promise<T | false> {
    const jobInfo = await this.getJobInfo(jobId)
    this.debug && console.info({ job: jobInfo })
    if (jobInfo?.status) {
      for (const status of statusArray) {
        if (jobInfo.status === status) {
          return status
        }
      }
    }
    return false
  }


  cleanCache(force = false): void {
    const now = Date.now()
    if (force) {
      this.groupServersCache.clear()
      this.cacheTime = 0
    }
    else if (this.cacheTime && (now - this.cacheTime > this.cacheTTLSec * 1000)) {
      console.log('cache expired')
      this.groupServersCache.clear()
      this.cacheTime = 0
    }
  }

  updateCache(groupId: ServerGroupId, servers: GroupServer[] | undefined): void {
    if (servers) {
      this.groupServersCache.set(groupId, servers)
    }
    else {
      this.groupServersCache.delete(groupId)
    }
    this.cacheTime = Date.now()
  }


  private async loopServerUntilWeight(options: UpdateServerWeightOptionsInner): Promise<JobId | undefined> {
    const { serverGroupId, ecsId } = options
    assert(ecsId, 'ecsId is required')

    this.cleanCache(true)
    const groupServer = await this.getGroupServer(serverGroupId, ecsId)
    if (! groupServer) {
      throw new Error(`no server found in group ${serverGroupId} by ecs ${ecsId}`)
    }
    const startStep = typeof options.startStep === 'undefined' ? 10 : options.startStep
    const step = typeof options.step === 'undefined' ? 30 : options.step

    const opts: CalcuWeightOptions = {
      currentWeight: options.currentWeight,
      dstWeight: options.weight,
      startStep,
      step,
    }
    const range = caculateWeights(opts)
    if (! range.length) {
      return
    }

    if (this.showProgressLog || this.debug) {
      console.info({ range })
    }

    let ret
    for await (const val of range) {
      if (this.showProgressLog || this.debug) {
        console.info(`Set weight of "${ecsId}": ${val} at ${new Date().toLocaleString()}`)
      }
      const { jobId } = await this.setServersWeight(serverGroupId, [ecsId], val)
      this.cleanCache(true)
      assert(jobId, 'no jobId')
      ret = jobId
      await this.loopJobUntilStatuses(jobId, [JobStatus.Succeeded, JobStatus.Failed], 9000)
    }

    return ret
  }



  private async loopJobUntilStatuses<T extends JobStatus>(
    jobId: string,
    statusArray: T[],
    /** 单位毫秒 */
    startDue = 5000,
    /** 单位毫秒 */
    intervalDuration = 3000,
  ): Promise<JobId> {

    const intv$ = timer(startDue, intervalDuration)
    const stream$ = intv$.pipe(
      takeWhile(idx => idx < 100),
      mergeMap(() => this.isJobMatchStatusList(jobId, statusArray), 1),
      skipWhile((jobStatusMatched) => {
        this.debug && console.info({ jobStatusMatched })
        return ! jobStatusMatched
      }),
      map(() => jobId),
      take(1),
    )
    return firstValueFrom(stream$)
  }


  private createClient(accessKeyId: string, accessKeySecret: string): Alb {
    const config = new ApiConfig({ accessKeyId, accessKeySecret })
    config.endpoint = this.endpoint
    const client = new _Client(config)
    this.debug && console.info({ client })
    return client
  }

}


export function caculateWeights(options: CalcuWeightOptions): number[] {
  const { currentWeight, dstWeight, startStep, step } = options

  assert(typeof currentWeight === 'number', 'currentWeight must be a number')

  const dstWeight2 = Math.min(100, dstWeight)
  const startStep2 = typeof startStep === 'number' ? startStep : 10
  const step2 = typeof step === 'number' ? step : 20

  const range: number[] = []
  if (currentWeight > dstWeight2) { // 当前权重大于目标权重, down
    for (let i = currentWeight - startStep2; i > dstWeight2; i -= step2) {
      range.push(i)
    }
    range.push(dstWeight2)
  }
  else if (currentWeight < dstWeight2) { // 当前权重小于目标权重, up
    for (let i = currentWeight + startStep2; i < dstWeight2; i += step2) {
      range.push(i)
    }
    range.push(dstWeight2)
  }

  return range
}

// const ps: CalcuWeightOptions = {
//   currentWeight: 100,
//   dstWeight: 0,
//   step: 50,
// }
// const arr = caculateWeights(ps)


// ListAsynJobsResponseBodyJobs {
//   apiName: 'UpdateServerGroupServersAttribute',
//   createTime: 1650517200000,
//   errorCode: '',
//   errorMessage: '',
//   id: '41067037-a139-4e27-b68e-4b864f8c11cd',
//   modifyTime: 1650517200000,
//   operateType: 'Update',
//   resourceId: 'sgp-7zyucxmdnfdomor6hp',
//   resourceType: 'servergroup',
//   status: 'Processing'
// },

// ListAsynJobsResponseBodyJobs {
//   apiName: 'UpdateServerGroupServersAttribute',
//   createTime: 1650517200000,
//   id: '41067037-a139-4e27-b68e-4b864f8c11cd',
//   modifyTime: 1650517200000,
//   operateType: 'Update',
//   resourceId: 'sgp-7zyucxmdnfdomor6hp',
//   resourceType: 'servergroup',
//   status: 'Succeeded'
// },


