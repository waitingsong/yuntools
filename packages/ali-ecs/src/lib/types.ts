import { DescribeInstancesResponseBodyInstancesInstance } from '@alicloud/ecs20140526'


export type GetNodeMap<T> = Map<string, T>

export type EcsNodeDetail = DescribeInstancesResponseBodyInstancesInstance

export enum Action {
  /** 获取指定 Ecs 节点信息 */
  DescribeInstances = 'DescribeInstances',
}

export enum EcsStatusKey {
  deviceAvailable = 'deviceAvailable',
  expiredTime = 'expiredTime',
  instanceId = 'instanceId',
  instanceName = 'instanceName',
  regionId = 'regionId',
  startTime = 'startTime',
  status = 'status',
}
/** 阿里云 ECS 实例基础状态信息 */
export type EcsNodeStatus = {
  [key in EcsStatusKey]: EcsNodeDetail[key] | undefined
}

export enum EcsInfoKey {
  deviceAvailable = 'deviceAvailable',
  expiredTime = 'expiredTime',
  instanceId = 'instanceId',
  instanceName = 'instanceName',
  regionId = 'regionId',
  startTime = 'startTime',
  status = 'status',

  autoReleaseTime = 'autoReleaseTime',
  clusterId = 'clusterId',
  cpu = 'cpu',
  creationTime = 'creationTime',
  description = 'description',
  eipAddress = 'eipAddress',
  hostName = 'hostName',
  innerIpAddress = 'innerIpAddress',
  instanceChargeType = 'instanceChargeType',
  instanceNetworkType = 'instanceNetworkType',
  instanceType = 'instanceType',
  instanceTypeFamily = 'instanceTypeFamily',
  internetChargeType = 'internetChargeType',
  internetMaxBandwidthIn = 'internetMaxBandwidthIn',
  internetMaxBandwidthOut = 'internetMaxBandwidthOut',
  memory = 'memory',
  OSName = 'OSName',
  OSType = 'OSType',
  publicIpAddress = 'publicIpAddress',
  resourceGroupId = 'resourceGroupId',
  serialNumber = 'serialNumber',
  zoneId = 'zoneId',
}
/** 阿里云 ECS 实例信息 */
export type EcsNodeInfo = {
  [key in EcsInfoKey]: EcsNodeDetail[key] | undefined
}

