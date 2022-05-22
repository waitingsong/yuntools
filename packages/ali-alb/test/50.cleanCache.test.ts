import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  client,
  CI,
  ips,
  groupId,
  ecsClient,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('cache available', async () => {
      const ip = ips[0]
      assert(ip)

      const id = await ecsClient.getInstanceIdByIp(ip)
      assert(id, `id should be defined, ip: ${ip}`)

      const server = await client.getGroupServer(groupId, id)
      assert(server, `server should be defined, ip: ${ip}`)

      assert(client.groupServersCache.size > 0)
    })

    it('clean cache', async () => {
      assert(client.groupServersCache.size > 0)
      client.cleanCache()
      assert(client.groupServersCache.size > 0)
    })

    it('clean cache force', async () => {
      assert(client.groupServersCache.size > 0)
      client.cleanCache(true)
      assert(client.groupServersCache.size === 0)
    })

    it('clean cache via timeout', async () => {
      const ip = ips[0]
      assert(ip)

      const id = await ecsClient.getInstanceIdByIp(ip)
      assert(id, `id should be defined, ip: ${ip}`)

      const server = await client.getGroupServer(groupId, id)
      assert(server, `server should be defined, ip: ${ip}`)

      assert(client.groupServersCache.size > 0)
      client.cacheTime = 1
      client.cleanCache()
      assert(client.groupServersCache.size === 0)
    })
  })

})


