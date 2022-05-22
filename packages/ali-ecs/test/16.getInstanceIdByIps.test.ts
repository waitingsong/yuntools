import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  client,
  CI,
  ips,
  serverIds,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('ips', async () => {
      let idx = 0
      const ret = await client.getInstancesByIps(ips)
      assert(ret)
      assert(ret.size > 0)
      assert(ret.size === ips.length)
      ips.forEach((ip) => {
        const server = ret.get(ip)
        assert(server, 'server should exist')
        assert(server.instanceId, 'server.instanceId should exist')
        assert(server.hostName, 'server.hostName should exist')

        const expectServerId = serverIds[idx]
        assert(expectServerId, 'expectServerId should exist')
        assert(server.instanceId === expectServerId, 'server.instanceId should equal to expectServerId')
        idx += 1
      })
    })

    it('fake ip', async () => {
      const ret = await client.getInstancesByIps(['127.0.0.1'])
      assert(ret.size === 0)
    })

    it('invalid ip', async () => {
      const ret = await client.getInstancesByIps([' '])
      assert(ret.size === 0)
    })
  })

})


