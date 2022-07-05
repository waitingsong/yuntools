import {
  ListServerGroupServersResponseBodyServers,
  ListAsynJobsResponseBodyJobs,
} from '@alicloud/alb20200616'


export type ServerGroupId = string
export type GroupServer = ListServerGroupServersResponseBodyServers

export interface ActionRet {
  /** 异步任务信息 */
  jobInfo: ListAsynJobsResponseBodyJobs | undefined
  /** 服务器属性 */
  groupServer: GroupServer | undefined
}

export type JobId = string

/**
 * 异步任务的执行状态
 */
export enum JobStatus {
  /** 异步消息已入队，等待处理 */
  Enqueued = 'Enqueued',
  /** 调用执行成功 */
  Succeeded = 'Succeeded',
  /** 调用执行失败 */
  Failed = 'Failed',
  /** 调用执行中 */
  Running = 'Running',
  Processing = 'Processing',
  /** 调用执行终止 */
  Stopped = 'Stopped',
  /** 执行停止中 */
  Stopping = 'Stopping',
  /** 执行因函数被删除等原因处于无效状态（任务未被执行） */
  Invalid = 'Invalid',
  /** 您为任务配置了最长排队等待的期限。该任务因为超期被丢弃（任务未被执行） */
  Expired = 'Expired',
  /** 异步调用因执行错误重试中 */
  Retrying = 'Retrying',
}

export enum Action {
  /** 查询指定异步任务信息 */
  GetAsyncJobResult = 'GetAsyncJobResult',
  /** ALB 服务组列表 */
  ListServerGroups = 'ListServerGroups',
  /** ALB 服务组所有服务器列表 */
  ListServerGroupServers = 'ListServerGroupServers',
  /** 更新 ALB 服务器组指定服务器的（权重）属性 */
  UpdateServerGroupServersAttribute = 'UpdateServerGroupServersAttribute',
}

export enum ActionType {
  up = 'up',
  down = 'down',
}


/** 更新服务组指定服务器权重属性 */
export interface UpdateServerWeightOptions {
  /** 服务组id */
  serverGroupId: string
  /** Ecs 实例id, 不能和 publicIp 同时为空 */
  ecsId?: string | undefined
  /** Ecs 实例公网ip，不能和 ecsId 同时为空 */
  ip?: string | undefined
  /** 目标权重 */
  weight: number
  /** 当前权重 */
  currentWeight?: number | undefined
  /**
   * 首次更新步长
   * @default 10
   */
  startStep?: number | undefined
  /**
   * 每次更新步长
   * @default 30
   */
  step?: number
}
export interface UpdateServerWeightOptionsInner extends UpdateServerWeightOptions {
  ecsId: string
  currentWeight: number
}


export interface CalcuWeightOptions {
  dstWeight: number
  currentWeight: number
  /**
   * 首次更新步长
   * @default 10
   */
  startStep: number
  /**
   * 每次更新步长
   * @default 30
   */
  step: number
}

