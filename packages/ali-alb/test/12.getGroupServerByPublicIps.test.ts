import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  client,
  CI,
  ips,
  groupId,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('normal', async () => {
      const ret = await client.getGroup(groupId)
      assert(ret, 'ret should be defined')
      assert(ret.serverGroupId === groupId, 'ret.serverGroupId should be defined')
      assert(ret.resourceGroupId, 'ret.resourceGroupId should be defined')
      assert(ret.serverGroupStatus, 'ret.serverGroupStatus should be defined')

      const servers = await client.getGroupServerByPublicIps(groupId, ips)
      assert(
        servers.size === ips.length,
        `servers.size !== ips.length, servers.size: ${servers.size}, ips.length: ${ips.length}`,
      )
      CI || console.log({ servers })
      servers.forEach((server) => {
        assert(server.serverId, 'server.serverId should be defined')
        assert(server.serverType, 'server.serverType should be defined')
        assert(server.serverIp, 'server.serverIp should be defined')
        assert(server.status, 'server.serverStatus should be defined')
        assert(server.weight, 'server.weight should be defined')
      })
    })
  })

})

