import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  client,
  CI,
  ips,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('cache available', async () => {
      const ip = ips[0]
      assert(ip)
      const ret = await client.getInstanceIdByIp(ip)
      assert(ret)

      assert(client.nodeIp2IdCache.size > 0)
      assert(client.id2NodeCache.size > 0)
    })

    it('clean cache', async () => {
      assert(client.nodeIp2IdCache.size > 0)
      assert(client.id2NodeCache.size > 0)
      client.cleanCache()
      assert(client.nodeIp2IdCache.size > 0)
      assert(client.id2NodeCache.size > 0)
    })

    it('clean cache force', async () => {
      assert(client.nodeIp2IdCache.size > 0)
      assert(client.id2NodeCache.size > 0)
      client.cleanCache(true)
      assert(client.nodeIp2IdCache.size === 0)
      assert(client.id2NodeCache.size === 0)
    })

    it('clean cache via timeout', async () => {
      const ip = ips[0]
      assert(ip)
      const ret = await client.getInstanceIdByIp(ip)
      assert(ret)
      assert(client.nodeIp2IdCache.size > 0)
      assert(client.id2NodeCache.size > 0)

      client.cacheTime = 1
      client.cleanCache()
      assert(client.nodeIp2IdCache.size === 0)
      assert(client.id2NodeCache.size === 0)
    })
  })

})


