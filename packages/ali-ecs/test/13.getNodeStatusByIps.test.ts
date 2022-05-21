import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { EcsStatusKey } from '../src/index.js'

import {
  client,
  CI,
  ips,
  serverIds,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('normal', async () => {
      const ret = await client.getNodeStatusByIps(ips)
      assert(ret)
      assert(ret.size > 0)
      assert(ret.size === ips.length)

      let idx = 0
      ips.forEach((ip) => {
        const server = ret.get(ip)
        assert(server, 'server should exist')
        assert(server.instanceId, 'server.instanceId should exist')

        Object.values(EcsStatusKey).forEach((key) => {
          assert(server[key], `server.${key} should exist`)
        })

        const expectServerId = serverIds[idx]
        assert(expectServerId, 'expectServerId should exist')
        assert(server.instanceId === expectServerId, 'server.instanceId should equal to expectServerId')
        idx += 1
      })
    })
  })

})


